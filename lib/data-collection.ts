import { supabase } from "./supabase"

export interface CleanupReportData {
  postId?: string
  userId: string

  // Basic cleanup info
  locationName?: string
  coordinates?: { lat: number; lng: number }
  cleanupDate: Date
  cleanupDurationMinutes?: number
  volunteerCount?: number
  organizationName?: string

  // Waste data
  wasteCategories: WasteCategory[]
  totalWeightKg?: number
  totalVolumeLiters?: number
  bagCount?: number

  // Environmental conditions
  weatherConditions?: string
  tideLevel?: string
  accessibilityRating?: number

  // Photos
  beforePhotos?: string[]
  afterPhotos?: string[]
  wastePhotos?: string[]

  // Estimation data
  estimationMethod?: string
  estimationConfidence?: number
}

export interface WasteCategory {
  type: string
  subtype?: string
  quantity?: number
  weight?: number
  volume?: number
  unit: "kg" | "liters" | "pieces"
}

export interface UserActivity {
  userId: string
  activityType: string
  activityData?: Record<string, any>
  sessionId?: string
}

export class DataCollectionService {
  /**
   * Create a comprehensive cleanup report for future API submission
   */
  static async createCleanupReport(data: CleanupReportData): Promise<string | null> {
    try {
      // Prepare waste categories in structured format
      const wasteCategories = data.wasteCategories.map((category) => ({
        type: category.type,
        subtype: category.subtype,
        quantity: category.quantity || 0,
        weight_kg: category.weight || 0,
        volume_liters: category.volume || 0,
        unit: category.unit,
      }))

      // Create the report entry
      const { data: report, error } = await supabase
        .from("official_reports_queue")
        .insert({
          post_id: data.postId,
          user_id: data.userId,
          location_name: data.locationName,
          coordinates: data.coordinates ? `POINT(${data.coordinates.lng} ${data.coordinates.lat})` : null,
          cleanup_date: data.cleanupDate.toISOString(),
          cleanup_duration_minutes: data.cleanupDurationMinutes,
          volunteer_count: data.volunteerCount || 1,
          organization_name: data.organizationName,
          waste_categories: wasteCategories,
          total_weight_kg: data.totalWeightKg,
          total_volume_liters: data.totalVolumeLiters,
          bag_count: data.bagCount,
          weather_conditions: data.weatherConditions,
          tide_level: data.tideLevel,
          accessibility_rating: data.accessibilityRating,
          before_photos: data.beforePhotos || [],
          after_photos: data.afterPhotos || [],
          waste_photos: data.wastePhotos || [],
          api_payload: {
            // Pre-format data for common APIs
            rydde_format: this.formatForRyddeAPI(data),
            ssb_format: this.formatForSSBAPI(data),
            miljodirektoratet_format: this.formatForMiljodirektoratetAPI(data),
          },
        })
        .select()
        .single()

      if (error) throw error

      // Log the activity
      await this.logUserActivity({
        userId: data.userId,
        activityType: "cleanup_report_created",
        activityData: {
          reportId: report.id,
          location: data.locationName,
          weight: data.totalWeightKg,
          wasteTypes: data.wasteCategories.map((c) => c.type),
        },
      })

      return report.id
    } catch (error) {
      console.error("Error creating cleanup report:", error)
      return null
    }
  }

  /**
   * Log user activity for analytics and behavior tracking
   */
  static async logUserActivity(activity: UserActivity): Promise<void> {
    try {
      await supabase.from("user_activity_log").insert({
        user_id: activity.userId,
        activity_type: activity.activityType,
        activity_data: activity.activityData,
        session_id: activity.sessionId || this.generateSessionId(),
      })
    } catch (error) {
      console.error("Error logging user activity:", error)
    }
  }

  /**
   * Get location intelligence data
   */
  static async getLocationIntelligence(locationName: string) {
    try {
      const { data, error } = await supabase
        .from("location_intelligence")
        .select("*")
        .ilike("location_name", `%${locationName}%`)
        .limit(10)

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error fetching location intelligence:", error)
      return []
    }
  }

  /**
   * Get reports ready for API submission
   */
  static async getReportsForSubmission(apiName: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .from("official_reports_queue")
        .select("*")
        .eq("status", "pending")
        .lt("submission_attempts", 3)
        .order("created_at")
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error fetching reports for submission:", error)
      return []
    }
  }

  /**
   * Mark report as submitted to external API
   */
  static async markReportSubmitted(reportId: string, apiName: string, externalId: string) {
    try {
      const { error } = await supabase
        .from("official_reports_queue")
        .update({
          status: "submitted",
          external_ids: { [apiName]: externalId },
          processed_at: new Date().toISOString(),
        })
        .eq("id", reportId)

      if (error) throw error
    } catch (error) {
      console.error("Error marking report as submitted:", error)
    }
  }

  /**
   * Format data for Rydde API
   */
  private static formatForRyddeAPI(data: CleanupReportData) {
    return {
      location: {
        name: data.locationName,
        coordinates: data.coordinates,
      },
      cleanup: {
        date: data.cleanupDate.toISOString(),
        participants: data.volunteerCount || 1,
        duration_minutes: data.cleanupDurationMinutes,
      },
      waste: {
        total_weight_kg: data.totalWeightKg,
        categories: data.wasteCategories.map((cat) => ({
          type: cat.type,
          weight_kg: cat.weight || 0,
        })),
      },
    }
  }

  /**
   * Format data for SSB API
   */
  private static formatForSSBAPI(data: CleanupReportData) {
    return {
      activity_date: data.cleanupDate.toISOString().split("T")[0],
      location: data.locationName,
      participant_count: data.volunteerCount || 1,
      waste_amount_kg: data.totalWeightKg,
      activity_type: "coastal_cleanup",
    }
  }

  /**
   * Format data for Miljødirektoratet API
   */
  private static formatForMiljodirektoratetAPI(data: CleanupReportData) {
    return {
      location: data.coordinates,
      environmental_data: {
        waste_removed_kg: data.totalWeightKg,
        waste_types: data.wasteCategories.map((cat) => cat.type),
        cleanup_date: data.cleanupDate.toISOString(),
      },
      impact_assessment: {
        area_cleaned: "coastal",
        accessibility: data.accessibilityRating,
      },
    }
  }

  /**
   * Generate a session ID for activity tracking
   */
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export types for use in components
export type { CleanupReportData, WasteCategory, UserActivity }

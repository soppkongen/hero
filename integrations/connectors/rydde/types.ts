// Rydde-specific types

export interface RyddeCleanupData {
  location: {
    name: string
    coordinates?: {
      latitude: number
      longitude: number
    }
    municipality?: string
  }
  event: {
    date: string
    duration_hours?: number
    participant_count: number
    organization_name?: string
    event_type: "coastal_cleanup" | "beach_cleanup" | "marine_cleanup"
  }
  waste_collected: {
    total_weight_kg?: number
    waste_types: RyddeWasteType[]
  }
  documentation?: {
    before_photos?: string[]
    after_photos?: string[]
    waste_photos?: string[]
  }
}

export interface RyddeWasteType {
  category: string
  subcategory?: string
  weight_kg?: number
  volume_liters?: number
  item_count?: number
  notes?: string
}

export interface RyddeAPIResponse {
  success: boolean
  data?: {
    submission_id: string
    reference_number: string
    status: "pending" | "processing" | "confirmed" | "rejected"
    created_at: string
    processed_at?: string
  }
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
}

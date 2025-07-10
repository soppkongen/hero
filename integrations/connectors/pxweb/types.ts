// SSB PxWeb specific types

export interface SSBEnvironmentalData {
  reporting_period: {
    year: number
    quarter?: number
    month?: number
  }
  location: {
    municipality_code?: string
    municipality_name: string
    county_code?: string
    county_name?: string
  }
  activity: {
    activity_type: "voluntary_cleanup"
    activity_date: string
    participant_count: number
    organization_type?: "individual" | "ngo" | "school" | "business" | "government"
  }
  environmental_impact: {
    waste_removed_kg: number
    area_type: "coastal" | "marine" | "beach" | "fjord"
    waste_categories: SSBWasteCategory[]
  }
  methodology: {
    measurement_method: "estimated" | "weighed" | "calculated"
    confidence_level?: number
    data_quality_notes?: string
  }
}

export interface SSBWasteCategory {
  category_code: string
  category_name: string
  weight_kg?: number
  volume_liters?: number
  percentage_of_total?: number
}

export interface SSBAPIResponse {
  success: boolean
  data?: {
    submission_id: string
    processing_status: "received" | "validated" | "processed" | "published"
    reference_period: string
    created_at: string
  }
  error?: {
    error_code: string
    error_message: string
    validation_errors?: string[]
  }
}

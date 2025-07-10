// Avfallsdeklarering specific types

export interface AvfallsdeklaringData {
  declaration: {
    declaration_type: "voluntary_collection"
    reporting_entity: {
      name: string
      organization_number?: string
      contact_person: string
      contact_email?: string
    }
    collection_period: {
      start_date: string
      end_date: string
    }
  }
  location: {
    municipality_code?: string
    municipality_name: string
    specific_location: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  waste_data: {
    collection_method: "manual_pickup"
    total_weight_kg: number
    waste_fractions: AvfallsFraction[]
  }
  documentation: {
    collection_photos?: string[]
    weight_documentation?: string[]
    participant_list?: string[]
  }
  environmental_impact: {
    area_cleaned_m2?: number
    environmental_benefit_notes?: string
  }
}

export interface AvfallsFraction {
  eal_code: string
  fraction_name: string
  weight_kg: number
  volume_m3?: number
  treatment_method: "recycling" | "energy_recovery" | "disposal" | "unknown"
  contamination_level: "clean" | "lightly_contaminated" | "heavily_contaminated"
}

export interface AvfallsAPIResponse {
  success: boolean
  data?: {
    declaration_id: string
    reference_number: string
    status: "submitted" | "under_review" | "approved" | "rejected"
    submitted_at: string
    reviewed_at?: string
    certificate_issued?: boolean
  }
  error?: {
    error_type: string
    error_message: string
    field_errors?: Record<string, string[]>
  }
}

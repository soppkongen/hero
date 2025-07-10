// Common types for all integrations

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  statusCode?: number
  retryAfter?: number
}

export interface APIConnector {
  name: string
  version: string
  isAvailable(): Promise<boolean>
  healthCheck(): Promise<APIResponse>
  authenticate(): Promise<boolean>
}

export interface CleanupData {
  id: string
  location: {
    name: string
    coordinates?: {
      lat: number
      lng: number
    }
    municipality?: string
    county?: string
  }
  cleanup: {
    date: string
    duration_minutes?: number
    participants: number
    organization?: string
  }
  waste: {
    total_weight_kg?: number
    total_volume_liters?: number
    categories: WasteCategory[]
  }
  photos?: {
    before?: string[]
    after?: string[]
    waste?: string[]
  }
  metadata?: Record<string, any>
}

export interface WasteCategory {
  type: string
  subtype?: string
  weight_kg?: number
  volume_liters?: number
  count?: number
  description?: string
}

export interface SubmissionResult {
  success: boolean
  external_id?: string
  reference_number?: string
  error?: string
  retry_recommended?: boolean
  next_retry_at?: Date
}

export interface IntegrationConfig {
  api_key?: string
  api_url: string
  timeout_ms: number
  max_retries: number
  retry_delay_ms: number
  rate_limit_per_minute?: number
}

export interface DataTransformer<TInput, TOutput> {
  transform(input: TInput): TOutput
  validate(data: TOutput): boolean
  getValidationErrors(data: TOutput): string[]
}

import type { APIConnector, APIResponse, CleanupData, SubmissionResult, IntegrationConfig } from "../../types/common"
import { RyddeTransformer } from "./transformer"

export class RyddeConnector implements APIConnector {
  name = "Rydde.no"
  version = "1.0.0"

  private config: IntegrationConfig
  private transformer: RyddeTransformer
  private lastRequestTime = 0
  private requestCount = 0

  constructor(config: IntegrationConfig) {
    this.config = {
      timeout_ms: 30000,
      max_retries: 3,
      retry_delay_ms: 1000,
      rate_limit_per_minute: 60,
      ...config,
    }
    this.transformer = new RyddeTransformer()
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.healthCheck()
      return response.success
    } catch {
      return false
    }
  }

  async healthCheck(): Promise<APIResponse> {
    try {
      // For now, return a stub response
      // In production, this would make an actual API call
      console.log("Rydde health check - returning stub response")

      return {
        success: true,
        data: {
          status: "healthy",
          version: "1.0.0",
          timestamp: new Date().toISOString(),
        },
        statusCode: 200,
      }
    } catch (error) {
      return {
        success: false,
        error: `Rydde health check failed: ${error}`,
        statusCode: 500,
      }
    }
  }

  async authenticate(): Promise<boolean> {
    try {
      if (!this.config.api_key) {
        console.warn("Rydde API key not configured")
        return false
      }

      // For now, return true as stub
      // In production, this would validate the API key
      console.log("Rydde authentication - returning stub success")
      return true
    } catch (error) {
      console.error("Rydde authentication failed:", error)
      return false
    }
  }

  async submitCleanup(cleanupData: CleanupData): Promise<SubmissionResult> {
    try {
      // Rate limiting
      await this.enforceRateLimit()

      // Transform data to Rydde format
      const ryddeData = this.transformer.transform(cleanupData)

      // Validate transformed data
      if (!this.transformer.validate(ryddeData)) {
        const errors = this.transformer.getValidationErrors(ryddeData)
        return {
          success: false,
          error: `Data validation failed: ${errors.join(", ")}`,
          retry_recommended: false,
        }
      }

      // For now, return a stub success response
      // In production, this would make the actual API call
      console.log("Rydde submission - returning stub success", {
        cleanupId: cleanupData.id,
        location: cleanupData.location.name,
        weight: cleanupData.waste.total_weight_kg,
      })

      const stubExternalId = `rydde_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      return {
        success: true,
        external_id: stubExternalId,
        reference_number: `RYD-${stubExternalId.toUpperCase()}`,
      }
    } catch (error) {
      console.error("Rydde submission failed:", error)

      return {
        success: false,
        error: `Submission failed: ${error}`,
        retry_recommended: true,
        next_retry_at: new Date(Date.now() + this.config.retry_delay_ms),
      }
    }
  }

  async getSubmissionStatus(externalId: string): Promise<APIResponse> {
    try {
      // For now, return a stub response
      // In production, this would check the actual submission status
      console.log("Rydde status check - returning stub response for", externalId)

      return {
        success: true,
        data: {
          external_id: externalId,
          status: "confirmed",
          processed_at: new Date().toISOString(),
          confirmation_number: `CONF-${externalId.toUpperCase()}`,
        },
        statusCode: 200,
      }
    } catch (error) {
      return {
        success: false,
        error: `Status check failed: ${error}`,
        statusCode: 500,
      }
    }
  }

  private async enforceRateLimit(): Promise<void> {
    if (!this.config.rate_limit_per_minute) return

    const now = Date.now()
    const oneMinute = 60 * 1000

    // Reset counter if more than a minute has passed
    if (now - this.lastRequestTime > oneMinute) {
      this.requestCount = 0
      this.lastRequestTime = now
    }

    // Check if we've exceeded the rate limit
    if (this.requestCount >= this.config.rate_limit_per_minute) {
      const waitTime = oneMinute - (now - this.lastRequestTime)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      this.requestCount = 0
      this.lastRequestTime = Date.now()
    }

    this.requestCount++
  }
}

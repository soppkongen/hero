import { RyddeConnector } from "./connectors/rydde/connector"
import { PxWebConnector } from "./connectors/pxweb/connector"
import { AvfallsdeklaringConnector } from "./connectors/avfallsdeklarering/connector"
import type { CleanupData, SubmissionResult } from "./types/common"

export interface IntegrationResults {
  rydde?: SubmissionResult
  ssb?: SubmissionResult
  avfallsdeklarering?: SubmissionResult
  errors: string[]
  totalSubmitted: number
}

export class IntegrationManager {
  private ryddeConnector?: RyddeConnector
  private pxwebConnector?: PxWebConnector
  private avfallsConnector?: AvfallsdeklaringConnector

  constructor() {
    this.initializeConnectors()
  }

  private initializeConnectors(): void {
    // Initialize Rydde connector
    if (process.env.RYDDE_API_KEY && process.env.RYDDE_API_URL) {
      this.ryddeConnector = new RyddeConnector({
        api_key: process.env.RYDDE_API_KEY,
        api_url: process.env.RYDDE_API_URL,
        timeout_ms: 30000,
        max_retries: 3,
        retry_delay_ms: 1000,
        rate_limit_per_minute: 60,
      })
    }

    // Initialize SSB PxWeb connector
    if (process.env.SSB_API_URL) {
      this.pxwebConnector = new PxWebConnector({
        api_url: process.env.SSB_API_URL,
        timeout_ms: 30000,
        max_retries: 3,
        retry_delay_ms: 2000,
      })
    }

    // Initialize Avfallsdeklarering connector
    if (process.env.AVFALLSDEKLARERING_API_KEY && process.env.AVFALLSDEKLARERING_API_URL) {
      this.avfallsConnector = new AvfallsdeklaringConnector({
        api_key: process.env.AVFALLSDEKLARERING_API_KEY,
        api_url: process.env.AVFALLSDEKLARERING_API_URL,
        timeout_ms: 45000,
        max_retries: 3,
        retry_delay_ms: 3000,
      })
    }
  }

  async submitToAllSystems(cleanupData: CleanupData): Promise<IntegrationResults> {
    const results: IntegrationResults = {
      errors: [],
      totalSubmitted: 0,
    }

    // Submit to Rydde
    if (this.ryddeConnector) {
      try {
        console.log("Submitting to Rydde...")
        results.rydde = await this.ryddeConnector.submitCleanup(cleanupData)
        if (results.rydde.success) {
          results.totalSubmitted++
          console.log("Rydde submission successful:", results.rydde.external_id)
        } else {
          results.errors.push(`Rydde: ${results.rydde.error}`)
        }
      } catch (error) {
        results.errors.push(`Rydde: ${error}`)
      }
    }

    // Submit to SSB
    if (this.pxwebConnector) {
      try {
        console.log("Submitting to SSB...")
        results.ssb = await this.pxwebConnector.submitEnvironmentalData(cleanupData)
        if (results.ssb.success) {
          results.totalSubmitted++
          console.log("SSB submission successful:", results.ssb.external_id)
        } else {
          results.errors.push(`SSB: ${results.ssb.error}`)
        }
      } catch (error) {
        results.errors.push(`SSB: ${error}`)
      }
    }

    // Submit to Avfallsdeklarering
    if (this.avfallsConnector) {
      try {
        console.log("Submitting to Avfallsdeklarering...")
        results.avfallsdeklarering = await this.avfallsConnector.submitWasteDeclaration(cleanupData)
        if (results.avfallsdeklarering.success) {
          results.totalSubmitted++
          console.log("Avfallsdeklarering submission successful:", results.avfallsdeklarering.external_id)
        } else {
          results.errors.push(`Avfallsdeklarering: ${results.avfallsdeklarering.error}`)
        }
      } catch (error) {
        results.errors.push(`Avfallsdeklarering: ${error}`)
      }
    }

    console.log(
      `Integration complete: ${results.totalSubmitted} successful submissions, ${results.errors.length} errors`,
    )
    return results
  }

  async checkSystemHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {}

    if (this.ryddeConnector) {
      health.rydde = await this.ryddeConnector.isAvailable()
    }

    if (this.pxwebConnector) {
      health.ssb = await this.pxwebConnector.isAvailable()
    }

    if (this.avfallsConnector) {
      health.avfallsdeklarering = await this.avfallsConnector.isAvailable()
    }

    return health
  }

  getAvailableConnectors(): string[] {
    const available: string[] = []

    if (this.ryddeConnector) available.push("rydde")
    if (this.pxwebConnector) available.push("ssb")
    if (this.avfallsConnector) available.push("avfallsdeklarering")

    return available
  }
}

// Singleton instance
export const integrationManager = new IntegrationManager()

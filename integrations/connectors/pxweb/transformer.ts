import type { DataTransformer, CleanupData } from "../../types/common"
import type { SSBEnvironmentalData, SSBWasteCategory } from "./types"

export class SSBTransformer implements DataTransformer<CleanupData, SSBEnvironmentalData> {
  transform(input: CleanupData): SSBEnvironmentalData {
    const cleanupDate = new Date(input.cleanup.date)

    return {
      reporting_period: {
        year: cleanupDate.getFullYear(),
        quarter: Math.ceil((cleanupDate.getMonth() + 1) / 3),
        month: cleanupDate.getMonth() + 1,
      },
      location: {
        municipality_name: input.location.municipality || input.location.name,
        county_name: input.location.county,
      },
      activity: {
        activity_type: "voluntary_cleanup",
        activity_date: input.cleanup.date,
        participant_count: input.cleanup.participants,
        organization_type: this.mapOrganizationType(input.cleanup.organization),
      },
      environmental_impact: {
        waste_removed_kg: input.waste.total_weight_kg || 0,
        area_type: "coastal",
        waste_categories: this.transformWasteCategories(input.waste.categories),
      },
      methodology: {
        measurement_method: "estimated",
        confidence_level: 75, // Default confidence level
        data_quality_notes: "Data collected through Skjærgårdshelt citizen reporting platform",
      },
    }
  }

  validate(data: SSBEnvironmentalData): boolean {
    if (!data.reporting_period?.year) return false
    if (!data.location?.municipality_name) return false
    if (!data.activity?.activity_date) return false
    if (!data.activity?.participant_count || data.activity.participant_count < 1) return false
    if (!data.environmental_impact?.waste_categories?.length) return false

    return true
  }

  getValidationErrors(data: SSBEnvironmentalData): string[] {
    const errors: string[] = []

    if (!data.reporting_period?.year) {
      errors.push("Reporting year is required")
    }

    if (!data.location?.municipality_name) {
      errors.push("Municipality name is required")
    }

    if (!data.activity?.activity_date) {
      errors.push("Activity date is required")
    }

    if (!data.activity?.participant_count || data.activity.participant_count < 1) {
      errors.push("At least one participant is required")
    }

    if (!data.environmental_impact?.waste_categories?.length) {
      errors.push("At least one waste category is required")
    }

    return errors
  }

  private transformWasteCategories(categories: any[]): SSBWasteCategory[] {
    return categories.map((category, index) => ({
      category_code: this.getSSBCategoryCode(category.type),
      category_name: this.getSSBCategoryName(category.type),
      weight_kg: category.weight_kg,
      volume_liters: category.volume_liters,
      percentage_of_total: this.calculatePercentage(category, categories),
    }))
  }

  private mapOrganizationType(organization?: string): "individual" | "ngo" | "school" | "business" | "government" {
    if (!organization) return "individual"

    const org = organization.toLowerCase()
    if (org.includes("skole") || org.includes("school")) return "school"
    if (org.includes("kommune") || org.includes("stat")) return "government"
    if (org.includes("as") || org.includes("bedrift")) return "business"
    if (org.includes("forening") || org.includes("lag")) return "ngo"

    return "individual"
  }

  private getSSBCategoryCode(type: string): string {
    const mapping: Record<string, string> = {
      plastic_bottles: "PLAST_01",
      plastic_bags: "PLAST_02",
      fishing_gear: "FISK_01",
      cigarette_butts: "TOB_01",
      food_packaging: "PAKK_01",
      glass_bottles: "GLASS_01",
      metal_cans: "METALL_01",
      paper_cardboard: "PAPIR_01",
      other: "ANNET_01",
    }

    return mapping[type] || "ANNET_01"
  }

  private getSSBCategoryName(type: string): string {
    const mapping: Record<string, string> = {
      plastic_bottles: "Plastflasker",
      plastic_bags: "Plastposer",
      fishing_gear: "Fiskeutstyr",
      cigarette_butts: "Sigarettstumper",
      food_packaging: "Matemballasje",
      glass_bottles: "Glassflasker",
      metal_cans: "Metallbokser",
      paper_cardboard: "Papir og kartong",
      other: "Annet avfall",
    }

    return mapping[type] || "Annet avfall"
  }

  private calculatePercentage(category: any, allCategories: any[]): number {
    const totalWeight = allCategories.reduce((sum, cat) => sum + (cat.weight_kg || 0), 0)
    if (totalWeight === 0) return 0

    return Math.round(((category.weight_kg || 0) / totalWeight) * 100)
  }
}

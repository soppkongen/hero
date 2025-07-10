import type { DataTransformer, CleanupData } from "../../types/common"
import type { AvfallsdeklaringData, AvfallsFraction } from "./types"

export class AvfallsTransformer implements DataTransformer<CleanupData, AvfallsdeklaringData> {
  transform(input: CleanupData): AvfallsdeklaringData {
    return {
      declaration: {
        declaration_type: "voluntary_collection",
        reporting_entity: {
          name: input.cleanup.organization || "Skjærgårdshelt bruker",
          contact_person: "Skjærgårdshelt Platform",
          contact_email: "contact@skjaergardshelt.no",
        },
        collection_period: {
          start_date: input.cleanup.date,
          end_date: input.cleanup.date, // Same day collection
        },
      },
      location: {
        municipality_name: input.location.municipality || input.location.name,
        specific_location: input.location.name,
        coordinates: input.location.coordinates
          ? {
              latitude: input.location.coordinates.lat,
              longitude: input.location.coordinates.lng,
            }
          : undefined,
      },
      waste_data: {
        collection_method: "manual_pickup",
        total_weight_kg: input.waste.total_weight_kg || 0,
        waste_fractions: this.transformWasteFractions(input.waste.categories),
      },
      documentation: {
        collection_photos: input.photos?.after || input.photos?.waste,
        weight_documentation: [], // Could include estimation screenshots
      },
      environmental_impact: {
        environmental_benefit_notes: `Coastal cleanup removing ${input.waste.total_weight_kg || 0}kg of waste from Norwegian coastline`,
      },
    }
  }

  validate(data: AvfallsdeklaringData): boolean {
    if (!data.declaration?.reporting_entity?.name) return false
    if (!data.declaration?.collection_period?.start_date) return false
    if (!data.location?.municipality_name) return false
    if (!data.waste_data?.waste_fractions?.length) return false
    if (data.waste_data.total_weight_kg < 0) return false

    return true
  }

  getValidationErrors(data: AvfallsdeklaringData): string[] {
    const errors: string[] = []

    if (!data.declaration?.reporting_entity?.name) {
      errors.push("Reporting entity name is required")
    }

    if (!data.declaration?.collection_period?.start_date) {
      errors.push("Collection start date is required")
    }

    if (!data.location?.municipality_name) {
      errors.push("Municipality name is required")
    }

    if (!data.waste_data?.waste_fractions?.length) {
      errors.push("At least one waste fraction is required")
    }

    if (data.waste_data?.total_weight_kg < 0) {
      errors.push("Total weight cannot be negative")
    }

    return errors
  }

  private transformWasteFractions(categories: any[]): AvfallsFraction[] {
    return categories.map((category) => ({
      eal_code: this.getEALCode(category.type),
      fraction_name: this.getFractionName(category.type),
      weight_kg: category.weight_kg || 0,
      volume_m3: category.volume_liters ? category.volume_liters / 1000 : undefined,
      treatment_method: this.getTreatmentMethod(category.type),
      contamination_level: this.getContaminationLevel(category.type),
    }))
  }

  private getEALCode(wasteType: string): string {
    // Map waste types to EAL (European Waste List) codes
    const mapping: Record<string, string> = {
      plastic_bottles: "15 01 02", // Plastic packaging
      plastic_bags: "15 01 02", // Plastic packaging
      fishing_gear: "02 01 04", // Waste plastics (excluding packaging)
      cigarette_butts: "20 03 99", // Other municipal wastes
      food_packaging: "15 01 02", // Plastic packaging
      glass_bottles: "15 01 07", // Glass packaging
      metal_cans: "15 01 04", // Metallic packaging
      paper_cardboard: "15 01 01", // Paper and cardboard packaging
      other: "20 03 99", // Other municipal wastes
    }

    return mapping[wasteType] || "20 03 99"
  }

  private getFractionName(wasteType: string): string {
    const mapping: Record<string, string> = {
      plastic_bottles: "Plastflasker og -beholdere",
      plastic_bags: "Plastposer og -film",
      fishing_gear: "Fiskeutstyr og tau",
      cigarette_butts: "Sigarettstumper",
      food_packaging: "Matemballasje",
      glass_bottles: "Glassflasker og -beholdere",
      metal_cans: "Metallbokser og -beholdere",
      paper_cardboard: "Papir og kartong",
      other: "Blandet avfall",
    }

    return mapping[wasteType] || "Blandet avfall"
  }

  private getTreatmentMethod(wasteType: string): "recycling" | "energy_recovery" | "disposal" | "unknown" {
    const recyclableTypes = ["plastic_bottles", "glass_bottles", "metal_cans", "paper_cardboard"]

    if (recyclableTypes.includes(wasteType)) {
      return "recycling"
    }

    return "unknown" // Treatment method determined by waste management facility
  }

  private getContaminationLevel(wasteType: string): "clean" | "lightly_contaminated" | "heavily_contaminated" {
    // Marine waste is typically contaminated due to saltwater exposure
    const heavilyContaminated = ["fishing_gear", "cigarette_butts"]

    if (heavilyContaminated.includes(wasteType)) {
      return "heavily_contaminated"
    }

    return "lightly_contaminated" // Default for marine-collected waste
  }
}

import type { DataTransformer, CleanupData, WasteCategory } from "../../types/common"
import type { RyddeCleanupData, RyddeWasteType } from "./types"

export class RyddeTransformer implements DataTransformer<CleanupData, RyddeCleanupData> {
  transform(input: CleanupData): RyddeCleanupData {
    return {
      location: {
        name: input.location.name,
        coordinates: input.location.coordinates
          ? {
              latitude: input.location.coordinates.lat,
              longitude: input.location.coordinates.lng,
            }
          : undefined,
        municipality: input.location.municipality,
      },
      event: {
        date: input.cleanup.date,
        duration_hours: input.cleanup.duration_minutes ? Math.round(input.cleanup.duration_minutes / 60) : undefined,
        participant_count: input.cleanup.participants,
        organization_name: input.cleanup.organization,
        event_type: "coastal_cleanup",
      },
      waste_collected: {
        total_weight_kg: input.waste.total_weight_kg,
        waste_types: this.transformWasteCategories(input.waste.categories),
      },
      documentation: {
        before_photos: input.photos?.before,
        after_photos: input.photos?.after,
        waste_photos: input.photos?.waste,
      },
    }
  }

  validate(data: RyddeCleanupData): boolean {
    // Basic validation rules
    if (!data.location?.name) return false
    if (!data.event?.date) return false
    if (!data.event?.participant_count || data.event.participant_count < 1) return false
    if (!data.waste_collected?.waste_types?.length) return false

    return true
  }

  getValidationErrors(data: RyddeCleanupData): string[] {
    const errors: string[] = []

    if (!data.location?.name) {
      errors.push("Location name is required")
    }

    if (!data.event?.date) {
      errors.push("Event date is required")
    }

    if (!data.event?.participant_count || data.event.participant_count < 1) {
      errors.push("At least one participant is required")
    }

    if (!data.waste_collected?.waste_types?.length) {
      errors.push("At least one waste type is required")
    }

    return errors
  }

  private transformWasteCategories(categories: WasteCategory[]): RyddeWasteType[] {
    return categories.map((category) => ({
      category: this.mapWasteType(category.type),
      subcategory: category.subtype,
      weight_kg: category.weight_kg,
      volume_liters: category.volume_liters,
      item_count: category.count,
      notes: category.description,
    }))
  }

  private mapWasteType(type: string): string {
    // Map our internal waste types to Rydde categories
    const mapping: Record<string, string> = {
      plastic_bottles: "plastic",
      plastic_bags: "plastic",
      fishing_gear: "fishing_equipment",
      cigarette_butts: "cigarettes",
      food_packaging: "packaging",
      glass_bottles: "glass",
      metal_cans: "metal",
      paper_cardboard: "paper",
      other: "other",
    }

    return mapping[type] || "other"
  }
}

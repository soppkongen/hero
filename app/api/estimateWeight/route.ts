import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

interface EstimationRequest {
  method: "bag" | "volume" | "photo"
  wasteType: string
  bagSize?: string
  bagCount?: number
  volumeLength?: number
  volumeWidth?: number
  volumeHeight?: number
  photoUrl?: string
  referenceObject?: string
}

interface EstimationResponse {
  weightKg: number
  confidencePct: number
}

export async function POST(request: NextRequest) {
  try {
    const body: EstimationRequest = await request.json()
    const { method, wasteType, bagSize, bagCount, volumeLength, volumeWidth, volumeHeight, photoUrl, referenceObject } =
      body

    let weightKg = 0
    let confidencePct = 50

    switch (method) {
      case "bag":
        if (bagSize && bagCount) {
          // Get bag weight from database
          const { data: bagData, error: bagError } = await supabase
            .from("bag_weights")
            .select("avg_weight_kg")
            .eq("bag_size", bagSize)
            .single()

          if (bagError || !bagData) {
            return NextResponse.json({ error: "Bag size not found" }, { status: 400 })
          }

          // Get density factor for waste type
          const { data: densityData, error: densityError } = await supabase
            .from("density_factors")
            .select("density_kg_m3")
            .eq("waste_type", wasteType)
            .single()

          if (densityError || !densityData) {
            // Use default mixed trash density if specific type not found
            weightKg = bagData.avg_weight_kg * bagCount * 0.7 // Assume 70% fill rate
            confidencePct = 60
          } else {
            // Calculate based on density (simplified calculation)
            const densityFactor = densityData.density_kg_m3 / 138 // Normalize to mixed trash
            weightKg = bagData.avg_weight_kg * bagCount * densityFactor * 0.7
            confidencePct = 75
          }
        }
        break

      case "volume":
        if (volumeLength && volumeWidth && volumeHeight) {
          const volumeM3 = volumeLength * volumeWidth * volumeHeight

          // Get density factor for waste type
          const { data: densityData, error: densityError } = await supabase
            .from("density_factors")
            .select("density_kg_m3")
            .eq("waste_type", wasteType)
            .single()

          const density = densityData?.density_kg_m3 || 138 // Default to mixed trash
          weightKg = volumeM3 * density * 0.6 // Assume 60% packing efficiency
          confidencePct = densityData ? 70 : 50
        }
        break

      case "photo":
        if (photoUrl && referenceObject) {
          // Simplified photo estimation based on reference object
          const referenceWeights: { [key: string]: number } = {
            soda_can: 0.015, // 15g empty can
            water_bottle: 0.5, // 500ml bottle
            shoe: 0.4, // Average shoe
            hand: 0.4, // Average hand span reference
            coin: 0.005, // 5g coin
          }

          const referenceWeight = referenceWeights[referenceObject] || 0.1

          // Get density factor for waste type
          const { data: densityData, error: densityError } = await supabase
            .from("density_factors")
            .select("density_kg_m3")
            .eq("waste_type", wasteType)
            .single()

          // Simplified calculation - in real implementation, this would use image analysis
          const estimatedVolume = referenceWeight * 10 // Rough volume estimation
          const density = densityData?.density_kg_m3 || 138
          weightKg = (estimatedVolume / 1000) * density * 0.5 // Convert to m3 and apply packing
          confidencePct = 40 // Lower confidence for photo estimation
        }
        break

      default:
        return NextResponse.json({ error: "Invalid estimation method" }, { status: 400 })
    }

    // Round to reasonable precision
    weightKg = Math.round(weightKg * 100) / 100
    confidencePct = Math.max(20, Math.min(95, confidencePct)) // Clamp between 20-95%

    const response: EstimationResponse = {
      weightKg,
      confidencePct,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Weight estimation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

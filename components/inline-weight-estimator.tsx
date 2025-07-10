"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { supabase } from "@/lib/supabase"
import { Calculator, Package, Scale, Camera, Loader2 } from "lucide-react"

interface BagWeight {
  bag_size: string
  avg_weight_kg: number
}

interface EstimationResult {
  weightKg: number
  confidencePct: number
}

interface InlineWeightEstimatorProps {
  wasteTypes: string[]
  onWeightEstimated: (weight: number, confidence: number, method: string) => void
  onClose: () => void
}

export function InlineWeightEstimator({ wasteTypes, onWeightEstimated, onClose }: InlineWeightEstimatorProps) {
  const [bagWeights, setBagWeights] = useState<BagWeight[]>([])
  const [estimationMethod, setEstimationMethod] = useState<string>("bag")
  const [bagSize, setBagSize] = useState<string>("")
  const [bagCount, setBagCount] = useState<number>(1)
  const [volumeLength, setVolumeLength] = useState<number>(1)
  const [volumeWidth, setVolumeWidth] = useState<number>(1)
  const [volumeHeight, setVolumeHeight] = useState<number>(1)
  const [referenceObject, setReferenceObject] = useState<string>("")
  const [result, setResult] = useState<EstimationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadBagWeights()
  }, [])

  const loadBagWeights = async () => {
    try {
      const { data, error } = await supabase.from("bag_weights").select("*").order("avg_weight_kg")
      if (error) throw error
      setBagWeights(data || [])
      if (data && data.length > 0) {
        setBagSize(data[0].bag_size) // Set default bag size
      }
    } catch (error) {
      console.error("Error loading bag weights:", error)
    }
  }

  const estimateWeight = async () => {
    setIsLoading(true)
    try {
      // Use the first waste type or default to mixed_trash
      const wasteType = wasteTypes.length > 0 ? wasteTypes[0].toLowerCase().replace(/\s+/g, "_") : "mixed_trash"

      const requestBody = {
        method: estimationMethod,
        wasteType,
        ...(estimationMethod === "bag" && { bagSize, bagCount }),
        ...(estimationMethod === "volume" && { volumeLength, volumeWidth, volumeHeight }),
        ...(estimationMethod === "photo" && { photoUrl: "placeholder", referenceObject }),
      }

      const response = await fetch("/api/estimateWeight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) throw new Error("Estimation failed")

      const data: EstimationResult = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error estimating weight:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const useThisWeight = () => {
    if (result) {
      onWeightEstimated(result.weightKg, result.confidencePct, estimationMethod)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Vektestimator
          </span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Method Selection */}
        <div className="space-y-3">
          <Label>Velg metode</Label>
          <RadioGroup value={estimationMethod} onValueChange={setEstimationMethod} className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bag" id="inline-bag" />
              <Label htmlFor="inline-bag" className="flex items-center gap-1 text-sm">
                <Package className="h-3 w-3" />
                Pose
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="volume" id="inline-volume" />
              <Label htmlFor="inline-volume" className="flex items-center gap-1 text-sm">
                <Scale className="h-3 w-3" />
                Volum
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="photo" id="inline-photo" />
              <Label htmlFor="inline-photo" className="flex items-center gap-1 text-sm">
                <Camera className="h-3 w-3" />
                Foto
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Method-specific inputs */}
        {estimationMethod === "bag" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="inline-bagSize" className="text-sm">
                Posestørrelse
              </Label>
              <Select value={bagSize} onValueChange={setBagSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg størrelse" />
                </SelectTrigger>
                <SelectContent>
                  {bagWeights.map((bag) => (
                    <SelectItem key={bag.bag_size} value={bag.bag_size}>
                      {bag.bag_size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inline-bagCount" className="text-sm">
                Antall
              </Label>
              <Input
                id="inline-bagCount"
                type="number"
                min="1"
                value={bagCount}
                onChange={(e) => setBagCount(Number.parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
        )}

        {estimationMethod === "volume" && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <Label>L: {volumeLength}m</Label>
                <Slider
                  value={[volumeLength]}
                  onValueChange={(value) => setVolumeLength(value[0])}
                  max={5}
                  min={0.1}
                  step={0.1}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>B: {volumeWidth}m</Label>
                <Slider
                  value={[volumeWidth]}
                  onValueChange={(value) => setVolumeWidth(value[0])}
                  max={5}
                  min={0.1}
                  step={0.1}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>H: {volumeHeight}m</Label>
                <Slider
                  value={[volumeHeight]}
                  onValueChange={(value) => setVolumeHeight(value[0])}
                  max={3}
                  min={0.1}
                  step={0.1}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              Volum: {(volumeLength * volumeWidth * volumeHeight).toFixed(2)} m³
            </div>
          </div>
        )}

        {estimationMethod === "photo" && (
          <div className="space-y-2">
            <Label htmlFor="inline-reference" className="text-sm">
              Referanseobjekt
            </Label>
            <Select value={referenceObject} onValueChange={setReferenceObject}>
              <SelectTrigger>
                <SelectValue placeholder="Velg referanse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="soda_can">Brus-boks</SelectItem>
                <SelectItem value="water_bottle">Vannflaske</SelectItem>
                <SelectItem value="shoe">Sko</SelectItem>
                <SelectItem value="hand">Hånd</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Estimate Button */}
        <Button
          onClick={estimateWeight}
          disabled={
            isLoading || (estimationMethod === "bag" && !bagSize) || (estimationMethod === "photo" && !referenceObject)
          }
          className="w-full"
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Estimerer...
            </>
          ) : (
            "Estimer vekt"
          )}
        </Button>

        {/* Result */}
        {result && (
          <div className="space-y-3 pt-2 border-t">
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-lg font-bold text-green-700">~ {result.weightKg} kg</div>
              <div className="text-xs text-green-600">±{result.confidencePct}% sikkerhet</div>
            </div>
            <Button onClick={useThisWeight} className="w-full" size="sm">
              Bruk denne vekten
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

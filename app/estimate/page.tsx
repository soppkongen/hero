"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Calculator, Scale, Camera, Package } from "lucide-react"

interface Category {
  code: string
  name: string
  description: string
  waste_type: string
}

interface BagWeight {
  bag_size: string
  avg_weight_kg: number
}

interface EstimationResult {
  weightKg: number
  confidencePct: number
}

export default function EstimatePage() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [bagWeights, setBagWeights] = useState<BagWeight[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [estimationMethod, setEstimationMethod] = useState<string>("bag")
  const [bagSize, setBagSize] = useState<string>("")
  const [bagCount, setBagCount] = useState<number>(1)
  const [volumeLength, setVolumeLength] = useState<number>(1)
  const [volumeWidth, setVolumeWidth] = useState<number>(1)
  const [volumeHeight, setVolumeHeight] = useState<number>(1)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [referenceObject, setReferenceObject] = useState<string>("")
  const [result, setResult] = useState<EstimationResult | null>(null)
  const [manualOverride, setManualOverride] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadCategories()
    loadBagWeights()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await fetch("/categories.json")
      const data = await response.json()
      setCategories(data.categories)
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const loadBagWeights = async () => {
    try {
      const { data, error } = await supabase.from("bag_weights").select("*").order("avg_weight_kg")

      if (error) throw error
      setBagWeights(data || [])
    } catch (error) {
      console.error("Error loading bag weights:", error)
    }
  }

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedCategoryData = categories.find((cat) => cat.code === selectedCategory)

  const estimateWeight = async () => {
    if (!selectedCategoryData) return

    setIsLoading(true)
    try {
      const requestBody = {
        method: estimationMethod,
        wasteType: selectedCategoryData.waste_type,
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

  const saveEstimation = async () => {
    if (!user || !result || !selectedCategoryData) return

    try {
      const { error } = await supabase.from("waste_pickup").insert({
        user_id: user.id,
        eal_code: selectedCategory,
        waste_type: selectedCategoryData.waste_type,
        estimation_method: estimationMethod,
        estimated_weight_kg: manualOverride || result.weightKg,
        confidence_pct: result.confidencePct,
        ...(estimationMethod === "bag" && { bag_size: bagSize, bag_count: bagCount }),
        ...(estimationMethod === "volume" && {
          volume_length_m: volumeLength,
          volume_width_m: volumeWidth,
          volume_height_m: volumeHeight,
        }),
        ...(estimationMethod === "photo" && { reference_object: referenceObject }),
        ...(manualOverride && { manual_override_kg: manualOverride }),
      })

      if (error) throw error

      // Reset form
      setResult(null)
      setManualOverride(null)
      setSelectedCategory("")
    } catch (error) {
      console.error("Error saving estimation:", error)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Logg inn for å bruke vektestimering</h2>
            <p className="text-muted-foreground">Du må være logget inn for å estimere vekt på avfall.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Vektestimering</h1>
        <p className="text-muted-foreground">Estimer vekten på avfall ved hjelp av forskjellige metoder</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Estimeringsdata
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* EAL Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="search">Søk EAL-kategori</Label>
              <Input
                id="search"
                placeholder="Søk etter kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg EAL-kategori" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.code} value={category.code}>
                      {category.code} - {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCategoryData && (
                <p className="text-sm text-muted-foreground">{selectedCategoryData.description}</p>
              )}
            </div>

            {/* Method Selection */}
            <div className="space-y-3">
              <Label>Estimeringsmetode</Label>
              <RadioGroup value={estimationMethod} onValueChange={setEstimationMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bag" id="bag" />
                  <Label htmlFor="bag" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Pose-metode
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="volume" id="volume" />
                  <Label htmlFor="volume" className="flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Volum-metode
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="photo" id="photo" />
                  <Label htmlFor="photo" className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Foto-metode
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Method-specific inputs */}
            {estimationMethod === "bag" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bagSize">Posestørrelse</Label>
                  <Select value={bagSize} onValueChange={setBagSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg posestørrelse" />
                    </SelectTrigger>
                    <SelectContent>
                      {bagWeights.map((bag) => (
                        <SelectItem key={bag.bag_size} value={bag.bag_size}>
                          {bag.bag_size} (≈{bag.avg_weight_kg} kg)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bagCount">Antall poser</Label>
                  <Input
                    id="bagCount"
                    type="number"
                    min="1"
                    value={bagCount}
                    onChange={(e) => setBagCount(Number.parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
            )}

            {estimationMethod === "volume" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Lengde (meter): {volumeLength}m</Label>
                  <Slider
                    value={[volumeLength]}
                    onValueChange={(value) => setVolumeLength(value[0])}
                    max={10}
                    min={0.1}
                    step={0.1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bredde (meter): {volumeWidth}m</Label>
                  <Slider
                    value={[volumeWidth]}
                    onValueChange={(value) => setVolumeWidth(value[0])}
                    max={10}
                    min={0.1}
                    step={0.1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Høyde (meter): {volumeHeight}m</Label>
                  <Slider
                    value={[volumeHeight]}
                    onValueChange={(value) => setVolumeHeight(value[0])}
                    max={5}
                    min={0.1}
                    step={0.1}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Totalt volum: {(volumeLength * volumeWidth * volumeHeight).toFixed(2)} m³
                </div>
              </div>
            )}

            {estimationMethod === "photo" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="photo">Last opp foto</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Referanseobjekt</Label>
                  <Select value={referenceObject} onValueChange={setReferenceObject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg referanseobjekt" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soda_can">Brus-boks</SelectItem>
                      <SelectItem value="water_bottle">Vannflaske (0.5L)</SelectItem>
                      <SelectItem value="shoe">Sko</SelectItem>
                      <SelectItem value="hand">Hånd</SelectItem>
                      <SelectItem value="coin">Mynt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Button onClick={estimateWeight} disabled={!selectedCategory || isLoading} className="w-full">
              {isLoading ? "Estimerer..." : "Estimer vekt"}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Resultat
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="text-center p-6 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-primary">~ {result.weightKg} kg</div>
                  <div className="text-sm text-muted-foreground">±{result.confidencePct}% sikkerhet</div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="override">Manuell justering (valgfritt)</Label>
                  <Input
                    id="override"
                    type="number"
                    step="0.1"
                    placeholder="Juster vekt manuelt..."
                    value={manualOverride || ""}
                    onChange={(e) => setManualOverride(Number.parseFloat(e.target.value) || null)}
                  />
                </div>

                <Button onClick={saveEstimation} className="w-full">
                  Lagre estimering
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Fyll ut skjemaet og klikk "Estimer vekt" for å få resultat</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

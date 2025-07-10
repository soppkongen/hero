"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { compressImage, fallbackCompressImage, validateImageFile } from "@/lib/image-utils"
import { DataCollectionService, type CleanupReportData, type WasteCategory } from "@/lib/data-collection"
import { Navigation } from "@/components/navigation"
import { InlineWeightEstimator } from "@/components/inline-weight-estimator"
import { Camera, MapPin, Trash2, X, Calculator, Edit3, Users, Clock, Cloud } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

const wasteTypes = ["Plast", "Glass", "Metall", "Papir", "Sigarettstumper", "Fiskeutstyr", "Tau", "Emballasje", "Annet"]

const weatherOptions = ["Solskinn", "Delvis skyet", "Overskyet", "Lett regn", "Kraftig regn", "Vind", "Stille"]

const tideOptions = ["Lavvann", "Stigende", "Høyvann", "Fallende", "Ukjent"]

export default function CreatePostPage() {
  const { user } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [image, setImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [caption, setCaption] = useState("")
  const [location, setLocation] = useState("")
  const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([])
  const [estimatedWeight, setEstimatedWeight] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Enhanced data collection fields
  const [volunteerCount, setVolunteerCount] = useState<number>(1)
  const [cleanupDuration, setCleanupDuration] = useState<number>(60)
  const [organizationName, setOrganizationName] = useState("")
  const [weatherConditions, setWeatherConditions] = useState("")
  const [tideLevel, setTideLevel] = useState("")
  const [accessibilityRating, setAccessibilityRating] = useState<number>(3)
  const [showAdvancedFields, setShowAdvancedFields] = useState(false)

  // Weight estimation states
  const [useWeightEstimator, setUseWeightEstimator] = useState(false)
  const [estimationData, setEstimationData] = useState<{
    weight: number
    confidence: number
    method: string
  } | null>(null)

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log("Selected file:", file.name, file.type, file.size)

    const validationError = validateImageFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError("")
    setLoading(true)

    try {
      console.log("Starting image compression...")

      let compressed
      try {
        // Try primary compression method
        compressed = await compressImage(file, 800, 800, 0.8)
        console.log("Image compressed successfully with primary method:", compressed.width, "x", compressed.height)
      } catch (primaryError) {
        console.log("Primary compression failed, trying fallback method:", primaryError)

        try {
          // Try fallback compression method
          compressed = await fallbackCompressImage(file, 800, 800, 0.8)
          console.log("Image compressed successfully with fallback method:", compressed.width, "x", compressed.height)
        } catch (fallbackError) {
          console.error("Both compression methods failed:", fallbackError)
          throw new Error("Kunne ikke behandle bildet. Prøv et annet bilde eller format.")
        }
      }

      setImage(compressed.dataUrl)
      setImageFile(compressed.file)

      // Log activity
      if (user) {
        DataCollectionService.logUserActivity({
          userId: user.id,
          activityType: "image_uploaded",
          activityData: {
            originalSize: file.size,
            compressedSize: compressed.file.size,
            originalType: file.type,
            compressedType: compressed.file.type,
            compressionRatio: Math.round((1 - compressed.file.size / file.size) * 100),
          },
        })
      }
    } catch (err) {
      console.error("Image compression error:", err)
      setError(`Kunne ikke behandle bildet: ${err instanceof Error ? err.message : "Ukjent feil"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleWasteTypeToggle = (wasteType: string) => {
    setSelectedWasteTypes((prev) => {
      const newTypes = prev.includes(wasteType) ? prev.filter((type) => type !== wasteType) : [...prev, wasteType]

      // Log activity
      if (user) {
        DataCollectionService.logUserActivity({
          userId: user.id,
          activityType: "waste_type_selected",
          activityData: {
            wasteType,
            action: prev.includes(wasteType) ? "removed" : "added",
            totalSelected: newTypes.length,
          },
        })
      }

      return newTypes
    })
  }

  const handleWeightEstimated = (weight: number, confidence: number, method: string) => {
    setEstimationData({ weight, confidence, method })
    setEstimatedWeight(weight.toString())
    setUseWeightEstimator(false)

    // Log weight estimation activity
    if (user) {
      DataCollectionService.logUserActivity({
        userId: user.id,
        activityType: "weight_estimated",
        activityData: {
          method,
          estimatedWeight: weight,
          confidence,
          wasteTypes: selectedWasteTypes,
        },
      })
    }
  }

  const calculatePoints = () => {
    const basePoints = 10
    const weightBonus = Math.floor(Number.parseFloat(estimatedWeight || "0") * 5)
    const typeBonus = selectedWasteTypes.length * 2
    const volunteerBonus = Math.max(0, (volunteerCount - 1) * 5) // Bonus for group cleanups
    return basePoints + weightBonus + typeBonus + volunteerBonus
  }

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    if (!user) throw new Error("User not authenticated")

    const fileExt = file.name.split(".").pop() || "webp"
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    console.log("Uploading image:", fileName, "Size:", file.size, "Type:", file.type)

    const { data, error } = await supabase.storage.from("post-images").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Storage upload error:", error)
      throw new Error(`Upload feilet: ${error.message}`)
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("post-images").getPublicUrl(data.path)

    console.log("Image uploaded successfully:", publicUrl)
    return publicUrl
  }

  const saveEstimationData = async (postId: string) => {
    if (!estimationData || !user) return

    try {
      await supabase.from("waste_pickup").insert({
        user_id: user.id,
        post_id: postId,
        waste_type: selectedWasteTypes.join(", "),
        estimation_method: estimationData.method,
        estimated_weight_kg: estimationData.weight,
        confidence_pct: estimationData.confidence,
        ...(estimationData.method === "bag" && { bag_count: 1 }), // Could be enhanced to store actual values
      })
    } catch (error) {
      console.error("Error saving estimation data:", error)
      // Don't fail the post creation if estimation data fails to save
    }
  }

  const createComprehensiveReport = async (postId: string, imageUrl: string) => {
    if (!user) return

    // Prepare waste categories
    const wasteCategories: WasteCategory[] = selectedWasteTypes.map((type) => ({
      type,
      weight: estimatedWeight ? Number.parseFloat(estimatedWeight) / selectedWasteTypes.length : undefined,
      unit: "kg" as const,
    }))

    // Create comprehensive cleanup report
    const reportData: CleanupReportData = {
      postId,
      userId: user.id,
      locationName: location.trim() || undefined,
      cleanupDate: new Date(),
      cleanupDurationMinutes: cleanupDuration,
      volunteerCount,
      organizationName: organizationName.trim() || undefined,
      wasteCategories,
      totalWeightKg: estimatedWeight ? Number.parseFloat(estimatedWeight) : undefined,
      weatherConditions: weatherConditions || undefined,
      tideLevel: tideLevel || undefined,
      accessibilityRating,
      afterPhotos: [imageUrl], // Main post image as after photo
      estimationMethod: estimationData?.method,
      estimationConfidence: estimationData?.confidence,
    }

    await DataCollectionService.createCleanupReport(reportData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !imageFile || !caption.trim()) {
      setError("Alle påkrevde felt må fylles ut")
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log("Starting post creation...")

      // Upload image first
      const imageUrl = await uploadImageToSupabase(imageFile)
      console.log("Image uploaded, creating post...")

      // Create post
      const postData = {
        user_id: user.id,
        caption: caption.trim(),
        image_url: imageUrl,
        location: location.trim() || null,
        waste_type: selectedWasteTypes,
        estimated_weight: estimatedWeight ? Number.parseFloat(estimatedWeight) : null,
        points_earned: calculatePoints(),
      }

      console.log("Post data:", postData)

      const { data, error: postError } = await supabase.from("posts").insert(postData).select()

      if (postError) {
        console.error("Post creation error:", postError)
        throw new Error(`Kunne ikke opprette innlegg: ${postError.message}`)
      }

      console.log("Post created successfully:", data)

      if (data && data[0]) {
        // Save estimation data if available
        await saveEstimationData(data[0].id)

        // Create comprehensive report for future API submission
        await createComprehensiveReport(data[0].id, imageUrl)

        // Log post creation activity
        await DataCollectionService.logUserActivity({
          userId: user.id,
          activityType: "post_created",
          activityData: {
            postId: data[0].id,
            location: location.trim(),
            wasteTypes: selectedWasteTypes,
            estimatedWeight: estimatedWeight ? Number.parseFloat(estimatedWeight) : null,
            volunteerCount,
            hasEstimation: !!estimationData,
            pointsEarned: calculatePoints(),
          },
        })
      }

      // Redirect to home page
      router.push("/")
    } catch (err: any) {
      console.error("Post creation error:", err)
      setError(err.message || "Kunne ikke opprette innlegg")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    router.push("/auth")
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-800">
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Nytt innlegg</h1>
          <button
            onClick={handleSubmit}
            disabled={loading || !imageFile || !caption.trim()}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
          >
            {loading ? "Publiserer..." : "Publiser"}
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="card p-4">
            {image ? (
              <div className="relative">
                <div className="aspect-square relative rounded-lg overflow-hidden">
                  <Image src={image || "/placeholder.svg"} alt="Selected image" fill className="object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImage(null)
                    setImageFile(null)
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {imageFile && (
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    {imageFile.type} • {Math.round(imageFile.size / 1024)}KB
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-forest-green transition-colors"
              >
                <Camera className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-gray-600 text-center">
                  Trykk for å velge bilde
                  <br />
                  <span className="text-sm text-gray-400">JPEG, PNG, WebP eller HEIC</span>
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Caption */}
          <div className="card p-4">
            <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2">
              Beskrivelse *
            </label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Fortell om din kystopprydning..."
              className="input min-h-[100px] resize-none"
              required
            />
          </div>

          {/* Location */}
          <div className="card p-4">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Sted
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="F.eks. Oslofjorden, Oslo"
              className="input"
            />
          </div>

          {/* Basic Cleanup Info */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Opprydningsinfo</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                className="text-xs"
              >
                {showAdvancedFields ? "Skjul detaljer" : "Vis detaljer"}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="volunteers" className="text-sm flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Antall personer
                </Label>
                <Input
                  id="volunteers"
                  type="number"
                  min="1"
                  value={volunteerCount}
                  onChange={(e) => setVolunteerCount(Number.parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="duration" className="text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Varighet (min)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="5"
                  step="5"
                  value={cleanupDuration}
                  onChange={(e) => setCleanupDuration(Number.parseInt(e.target.value) || 60)}
                  className="mt-1"
                />
              </div>
            </div>

            {showAdvancedFields && (
              <div className="mt-4 space-y-3">
                <div>
                  <Label htmlFor="organization" className="text-sm">
                    Organisasjon (valgfritt)
                  </Label>
                  <Input
                    id="organization"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="F.eks. Hold Norge Rent"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm flex items-center gap-1">
                      <Cloud className="w-3 h-3" />
                      Vær
                    </Label>
                    <Select value={weatherConditions} onValueChange={setWeatherConditions}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Velg vær" />
                      </SelectTrigger>
                      <SelectContent>
                        {weatherOptions.map((weather) => (
                          <SelectItem key={weather} value={weather}>
                            {weather}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Tidevann</Label>
                    <Select value={tideLevel} onValueChange={setTideLevel}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Velg tide" />
                      </SelectTrigger>
                      <SelectContent>
                        {tideOptions.map((tide) => (
                          <SelectItem key={tide} value={tide}>
                            {tide}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Tilgjengelighet (1-5): {accessibilityRating}</Label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={accessibilityRating}
                    onChange={(e) => setAccessibilityRating(Number.parseInt(e.target.value))}
                    className="w-full mt-1"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Vanskelig</span>
                    <span>Lett</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Waste Types */}
          <div className="card p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Type søppel</label>
            <div className="flex flex-wrap gap-2">
              {wasteTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleWasteTypeToggle(type)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedWasteTypes.includes(type)
                      ? "bg-forest-green text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Weight Section */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Estimert vekt (kg)</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={!useWeightEstimator ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseWeightEstimator(false)}
                  className="text-xs"
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  Manuell
                </Button>
                <Button
                  type="button"
                  variant={useWeightEstimator ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseWeightEstimator(true)}
                  className="text-xs"
                >
                  <Calculator className="w-3 h-3 mr-1" />
                  Estimator
                </Button>
              </div>
            </div>

            {!useWeightEstimator ? (
              <div className="space-y-2">
                <input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0"
                  value={estimatedWeight}
                  onChange={(e) => setEstimatedWeight(e.target.value)}
                  placeholder="F.eks. 2.5"
                  className="input"
                />
                {estimationData && (
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    <Calculator className="w-3 h-3" />
                    Estimert med {estimationData.method}-metode (±{estimationData.confidence}%)
                  </div>
                )}
              </div>
            ) : (
              <InlineWeightEstimator
                wasteTypes={selectedWasteTypes}
                onWeightEstimated={handleWeightEstimated}
                onClose={() => setUseWeightEstimator(false)}
              />
            )}
          </div>

          {/* Points Preview */}
          <div className="card p-4 bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">Poeng du vil få:</span>
              <span className="text-lg font-bold text-green-600">+{calculatePoints()}</span>
            </div>
            <p className="text-xs text-green-600 mt-1">Basert på vekt, type søppel, antall personer og grunnpoeng</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}
        </form>
      </main>

      <Navigation />
    </div>
  )
}

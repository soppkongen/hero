"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { compressImage, validateImageFile, uploadImageToSupabase } from "@/lib/image-utils"
import { DataCollectionService, type CleanupReportData } from "@/lib/data-collection"
import { OfflineSyncService } from "@/lib/offline-sync"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { InlineWeightEstimator } from "@/components/inline-weight-estimator"
import { Header } from "@/components/header"
import {
  Camera,
  Upload,
  MapPin,
  Users,
  Clock,
  Building,
  Cloud,
  Waves,
  ChevronDown,
  ChevronUp,
  Scale,
  Calculator,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

const WASTE_TYPES = [
  { id: "plastic_bottles", label: "Plastflasker", icon: "🍼" },
  { id: "plastic_bags", label: "Plastposer", icon: "🛍️" },
  { id: "fishing_gear", label: "Fiskeutstyr", icon: "🎣" },
  { id: "cigarette_butts", label: "Sigarettstumper", icon: "🚬" },
  { id: "food_packaging", label: "Matemballasje", icon: "📦" },
  { id: "glass_bottles", label: "Glassflasker", icon: "🍾" },
  { id: "metal_cans", label: "Metallbokser", icon: "🥫" },
  { id: "paper_cardboard", label: "Papir/kartong", icon: "📄" },
  { id: "other", label: "Annet", icon: "🗑️" },
]

const WEATHER_CONDITIONS = ["Solskinn", "Overskyet", "Regn", "Vind", "Tåke"]
const TIDE_LEVELS = ["Lavvann", "Høyvann", "Stigende", "Fallende"]

export default function CreatePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(true)
  const [pendingSync, setPendingSync] = useState({ posts: 0, images: 0 })

  // Form state
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const [location, setLocation] = useState("")
  const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([])
  const [useEstimator, setUseEstimator] = useState(false)
  const [estimatedWeight, setEstimatedWeight] = useState<number | null>(null)
  const [manualWeight, setManualWeight] = useState("")
  const [estimationMethod, setEstimationMethod] = useState<string | null>(null)
  const [estimationData, setEstimationData] = useState<any>(null)

  // Advanced fields
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [volunteerCount, setVolunteerCount] = useState("1")
  const [cleanupDuration, setCleanupDuration] = useState("")
  const [organizationName, setOrganizationName] = useState("")
  const [weatherConditions, setWeatherConditions] = useState("")
  const [tideLevel, setTideLevel] = useState("")
  const [accessibilityRating, setAccessibilityRating] = useState("3")

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageProcessing, setImageProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check online status and pending sync
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    const updatePendingSync = () => {
      setPendingSync(OfflineSyncService.getPendingSyncCount())
    }

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    updateOnlineStatus()
    updatePendingSync()

    // Update pending sync count periodically
    const interval = setInterval(updatePendingSync, 5000)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
      clearInterval(interval)
    }
  }, [])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && (pendingSync.posts > 0 || pendingSync.images > 0)) {
      handleSync()
    }
  }, [isOnline])

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/velkommen")
    }
  }, [user, loading, router])

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setImageProcessing(true)

    try {
      // Validate file
      const validationError = validateImageFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      console.log("Processing image:", file.name, file.size, file.type)

      // Compress image
      const compressed = await compressImage(file)
      console.log("Image compressed:", compressed.width, compressed.height, compressed.file.size)

      setImage(compressed.file)
      setImagePreview(compressed.dataUrl)
    } catch (error: any) {
      console.error("Image processing error:", error)
      setError(`Kunne ikke behandle bildet: ${error.message}`)
    } finally {
      setImageProcessing(false)
    }
  }

  const handleWeightEstimation = (weight: number, method: string, data: any) => {
    setEstimatedWeight(weight)
    setEstimationMethod(method)
    setEstimationData(data)
    console.log("Weight estimated:", weight, "kg using", method)
  }

  const handleSync = async () => {
    if (!isOnline) return

    try {
      console.log("Starting offline sync...")
      const results = await OfflineSyncService.syncOfflineData()

      if (results.posts > 0 || results.images > 0) {
        console.log(`Synced ${results.posts} posts and ${results.images} images`)
        setPendingSync(OfflineSyncService.getPendingSyncCount())
      }

      if (results.errors.length > 0) {
        console.error("Sync errors:", results.errors)
      }
    } catch (error) {
      console.error("Sync failed:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !image) return

    setIsSubmitting(true)
    setError(null)

    try {
      const finalWeight = useEstimator ? estimatedWeight : Number.parseFloat(manualWeight) || null
      const postId = crypto.randomUUID()

      // Prepare cleanup report data
      const cleanupReportData: CleanupReportData = {
        postId,
        userId: user.id,
        locationName: location,
        cleanupDate: new Date(),
        cleanupDurationMinutes: cleanupDuration ? Number.parseInt(cleanupDuration) : undefined,
        volunteerCount: Number.parseInt(volunteerCount),
        organizationName: organizationName || undefined,
        wasteCategories: selectedWasteTypes.map((type) => ({
          type,
          weight: finalWeight ? finalWeight / selectedWasteTypes.length : undefined,
          unit: "kg" as const,
        })),
        totalWeightKg: finalWeight || undefined,
        weatherConditions: weatherConditions || undefined,
        tideLevel: tideLevel || undefined,
        accessibilityRating: Number.parseInt(accessibilityRating),
        wastePhotos: [imagePreview!],
        estimationMethod: estimationMethod || undefined,
        estimationConfidence: estimationData?.confidence || undefined,
      }

      if (isOnline) {
        // Online submission
        console.log("Submitting online...")

        // Upload image
        const imageUrl = await uploadImageToSupabase(image, user.id)

        // Create post
        const { error: postError } = await supabase.from("posts").insert({
          id: postId,
          user_id: user.id,
          caption,
          image_url: imageUrl,
          location,
          waste_type: selectedWasteTypes,
          estimated_weight: finalWeight,
          points_earned: Math.min(Math.max(Math.floor((finalWeight || 1) * 2), 5), 50),
        })

        if (postError) throw postError

        // Save estimation data if used
        if (useEstimator && estimationData) {
          await supabase.from("waste_pickup").insert({
            user_id: user.id,
            post_id: postId,
            estimation_method: estimationMethod!,
            estimated_weight_kg: estimatedWeight,
            confidence_pct: estimationData.confidence,
            bag_size: estimationData.bagSize,
            bag_count: estimationData.bagCount,
            volume_length_m: estimationData.length,
            volume_width_m: estimationData.width,
            volume_height_m: estimationData.height,
            photo_url: estimationData.photoUrl,
            reference_object: estimationData.referenceObject,
          })
        }

        // Create comprehensive cleanup report
        await DataCollectionService.createCleanupReport(cleanupReportData)

        console.log("Post created successfully")
        router.push("/")
      } else {
        // Offline submission
        console.log("Saving for offline sync...")

        // Save post for offline sync
        await OfflineSyncService.savePostOffline({
          id: postId,
          user_id: user.id,
          caption,
          image_url: `offline_${postId}`, // Temporary URL
          image_blob: image,
          location,
          waste_type: selectedWasteTypes,
          estimated_weight: finalWeight,
          points_earned: Math.min(Math.max(Math.floor((finalWeight || 1) * 2), 5), 50),
          created_at: new Date().toISOString(),
        })

        // Save image for offline sync
        await OfflineSyncService.saveImageOffline({
          id: `img_${postId}`,
          blob: image,
          filename: `${postId}.webp`,
          user_id: user.id,
          created_at: new Date().toISOString(),
        })

        setPendingSync(OfflineSyncService.getPendingSyncCount())

        console.log("Post saved offline")
        router.push("/")
      }
    } catch (error: any) {
      console.error("Error creating post:", error)
      setError(`Kunne ikke opprette innlegg: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Laster...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen pb-20">
      {/* Connection Status Bar */}
      {(!isOnline || pendingSync.posts > 0 || pendingSync.images > 0) && (
        <div
          className={`px-4 py-2 text-sm font-medium ${
            isOnline
              ? "bg-green-50 text-green-800 border-b border-green-200"
              : "bg-orange-50 text-orange-800 border-b border-orange-200"
          }`}
        >
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>Tilkoblet</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span>Offline modus</span>
                </>
              )}
            </div>

            {(pendingSync.posts > 0 || pendingSync.images > 0) && (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{pendingSync.posts + pendingSync.images} venter på synkronisering</span>
                {isOnline && (
                  <Button size="sm" variant="outline" onClick={handleSync}>
                    Synkroniser
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <Header />

      <main className="max-w-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-forest-green" />
              <h3 className="font-semibold text-gray-900">Bilde av oppryddingen</h3>
            </div>

            {imagePreview ? (
              <div className="space-y-4">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setImage(null)
                    setImagePreview(null)
                  }}
                  className="w-full"
                >
                  Velg nytt bilde
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-4">
                  {imageProcessing ? "Behandler bilde..." : "Last opp bilde av oppryddingen"}
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={imageProcessing}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors ${
                    imageProcessing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {imageProcessing ? "Behandler..." : "Velg bilde"}
                </label>
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption" className="text-gray-900 font-medium">
              Beskrivelse
            </Label>
            <Textarea
              id="caption"
              placeholder="Fortell om oppryddingen din..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              required
              rows={3}
              className="border-gray-200 focus:border-forest-green focus:ring-forest-green/20"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2 text-gray-900 font-medium">
              <MapPin className="w-4 h-4 text-forest-green" />
              Sted
            </Label>
            <Input
              id="location"
              placeholder="F.eks. Bygdøy strand, Oslo"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="border-gray-200 focus:border-forest-green focus:ring-forest-green/20"
            />
          </div>

          {/* Waste Types */}
          <div className="space-y-3">
            <Label className="text-gray-900 font-medium">Type avfall</Label>
            <div className="grid grid-cols-3 gap-2">
              {WASTE_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    setSelectedWasteTypes((prev) =>
                      prev.includes(type.id) ? prev.filter((id) => id !== type.id) : [...prev, type.id],
                    )
                  }}
                  className={`card p-3 text-center transition-all duration-200 ${
                    selectedWasteTypes.includes(type.id) ? "ring-2 ring-forest-green bg-green-50" : "hover:shadow-md"
                  }`}
                >
                  <div className="text-lg mb-1">{type.icon}</div>
                  <div className="text-xs font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Weight Section */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-forest-green" />
              <h3 className="font-semibold text-gray-900">Vekt estimering</h3>
            </div>

            <div className="space-y-4">
              {/* Toggle between manual and estimator */}
              <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setUseEstimator(false)}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    !useEstimator ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  📝 Manuell
                </button>
                <button
                  type="button"
                  onClick={() => setUseEstimator(true)}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    useEstimator ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Calculator className="w-4 h-4 inline mr-1" />
                  Estimator
                </button>
              </div>

              {useEstimator ? (
                <div className="space-y-4">
                  <InlineWeightEstimator onWeightCalculated={handleWeightEstimation} wasteTypes={selectedWasteTypes} />
                  {estimatedWeight && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Estimert vekt: {estimatedWeight.toFixed(1)} kg
                        {estimationData?.confidence && (
                          <span className="text-green-600 ml-1">(±{estimationData.confidence}%)</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-gray-900 font-medium">
                    Vekt (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="F.eks. 2.5"
                    value={manualWeight}
                    onChange={(e) => setManualWeight(e.target.value)}
                    className="border-gray-200 focus:border-forest-green focus:ring-forest-green/20"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Advanced Fields */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-4 card hover:shadow-md transition-shadow"
            >
              <span className="font-medium text-gray-900">Opprydningsinfo (valgfritt)</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="card p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="volunteers" className="flex items-center gap-2 text-gray-900 font-medium">
                      <Users className="w-4 h-4 text-forest-green" />
                      Antall frivillige
                    </Label>
                    <Input
                      id="volunteers"
                      type="number"
                      min="1"
                      value={volunteerCount}
                      onChange={(e) => setVolunteerCount(e.target.value)}
                      className="border-gray-200 focus:border-forest-green focus:ring-forest-green/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="flex items-center gap-2 text-gray-900 font-medium">
                      <Clock className="w-4 h-4 text-forest-green" />
                      Varighet (min)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="60"
                      value={cleanupDuration}
                      onChange={(e) => setCleanupDuration(e.target.value)}
                      className="border-gray-200 focus:border-forest-green focus:ring-forest-green/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization" className="flex items-center gap-2 text-gray-900 font-medium">
                    <Building className="w-4 h-4 text-forest-green" />
                    Organisasjon
                  </Label>
                  <Input
                    id="organization"
                    placeholder="F.eks. Oslo Røde Kors"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="border-gray-200 focus:border-forest-green focus:ring-forest-green/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-900 font-medium">
                      <Cloud className="w-4 h-4 text-forest-green" />
                      Værforhold
                    </Label>
                    <select
                      value={weatherConditions}
                      onChange={(e) => setWeatherConditions(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-md bg-white focus:border-forest-green focus:ring-forest-green/20 focus:outline-none"
                    >
                      <option value="">Velg værforhold</option>
                      {WEATHER_CONDITIONS.map((condition) => (
                        <option key={condition} value={condition}>
                          {condition}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-900 font-medium">
                      <Waves className="w-4 h-4 text-forest-green" />
                      Tidevann
                    </Label>
                    <select
                      value={tideLevel}
                      onChange={(e) => setTideLevel(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-md bg-white focus:border-forest-green focus:ring-forest-green/20 focus:outline-none"
                    >
                      <option value="">Velg tidevann</option>
                      {TIDE_LEVELS.map((tide) => (
                        <option key={tide} value={tide}>
                          {tide}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessibility" className="text-gray-900 font-medium">
                    Tilgjengelighet (1-5, hvor 5 er lett tilgjengelig)
                  </Label>
                  <Input
                    id="accessibility"
                    type="range"
                    min="1"
                    max="5"
                    value={accessibilityRating}
                    onChange={(e) => setAccessibilityRating(e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Vanskelig</span>
                    <span>Lett</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="card p-4 bg-red-50 border border-red-200">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!image || !caption || !location || selectedWasteTypes.length === 0 || isSubmitting}
            className="w-full bg-forest-green hover:bg-forest-green-dark text-white"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isOnline ? "Publiserer..." : "Lagrer offline..."}
              </>
            ) : (
              <>{isOnline ? "Publiser innlegg" : "Lagre offline"}</>
            )}
          </Button>

          {!isOnline && (
            <div className="card p-3 bg-orange-50 border border-orange-200">
              <p className="text-sm text-orange-600 text-center">
                Innlegget vil bli publisert automatisk når du kommer tilbake online
              </p>
            </div>
          )}
        </form>
      </main>
    </div>
  )
}

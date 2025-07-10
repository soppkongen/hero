"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { compressImage, validateImageFile } from "@/lib/image-utils"
import { Navigation } from "@/components/navigation"
import { InlineWeightEstimator } from "@/components/inline-weight-estimator"
import { Camera, MapPin, Trash2, X, Calculator, Edit3 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const wasteTypes = ["Plast", "Glass", "Metall", "Papir", "Sigarettstumper", "Fiskeutstyr", "Tau", "Emballasje", "Annet"]

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

    const validationError = validateImageFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError("")
    setLoading(true)

    try {
      const compressed = await compressImage(file, 800, 800, 0.8)
      setImage(compressed.dataUrl)
      setImageFile(compressed.file)
    } catch (err) {
      console.error("Image compression error:", err)
      setError("Kunne ikke behandle bildet")
    } finally {
      setLoading(false)
    }
  }

  const handleWasteTypeToggle = (wasteType: string) => {
    setSelectedWasteTypes((prev) =>
      prev.includes(wasteType) ? prev.filter((type) => type !== wasteType) : [...prev, wasteType],
    )
  }

  const handleWeightEstimated = (weight: number, confidence: number, method: string) => {
    setEstimationData({ weight, confidence, method })
    setEstimatedWeight(weight.toString())
    setUseWeightEstimator(false)
  }

  const calculatePoints = () => {
    const basePoints = 10
    const weightBonus = Math.floor(Number.parseFloat(estimatedWeight || "0") * 5)
    const typeBonus = selectedWasteTypes.length * 2
    return basePoints + weightBonus + typeBonus
  }

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    if (!user) throw new Error("User not authenticated")

    const fileExt = file.name.split(".").pop() || "jpg"
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    console.log("Uploading image:", fileName)

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

      // Save estimation data if available
      if (data && data[0]) {
        await saveEstimationData(data[0].id)
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
                  <span className="text-sm text-gray-400">JPEG, PNG eller WebP</span>
                </p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
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
            <p className="text-xs text-green-600 mt-1">Basert på vekt, type søppel og grunnpoeng</p>
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

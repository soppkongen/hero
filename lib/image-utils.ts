export interface CompressedImage {
  file: File
  dataUrl: string
  width: number
  height: number
}

export async function compressImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8,
): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.crossOrigin = "anonymous"

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to compress image"))
            return
          }

          const compressedFile = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          })

          const dataUrl = canvas.toDataURL("image/jpeg", quality)

          resolve({
            file: compressedFile,
            dataUrl,
            width,
            height,
          })
        },
        "image/jpeg",
        quality,
      )
    }

    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = URL.createObjectURL(file)
  })
}

export function validateImageFile(file: File): string | null {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

  if (!allowedTypes.includes(file.type)) {
    return "Kun JPEG, PNG og WebP filer er tillatt"
  }

  if (file.size > maxSize) {
    return "Bildet er for stort (maks 10MB)"
  }

  return null
}

export async function uploadImageToSupabase(file: File, userId: string): Promise<string> {
  const { supabase } = await import("./supabase")

  const fileExt = file.name.split(".").pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage.from("post-images").upload(fileName, file)

  if (error) {
    throw new Error(`Upload feilet: ${error.message}`)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("post-images").getPublicUrl(data.path)

  return publicUrl
}

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

    if (!ctx) {
      reject(new Error("Could not get canvas context"))
      return
    }

    const img = new Image()

    // Set crossOrigin before setting src
    img.crossOrigin = "anonymous"

    img.onload = () => {
      try {
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

        // Clear canvas and draw image
        ctx.clearRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create blob from canvas"))
              return
            }

            try {
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
            } catch (error) {
              reject(new Error("Failed to create compressed file"))
            }
          },
          "image/jpeg",
          quality,
        )
      } catch (error) {
        reject(new Error("Failed to process image on canvas"))
      }
    }

    img.onerror = (error) => {
      console.error("Image load error:", error)
      reject(new Error("Failed to load image file"))
    }

    // Create object URL from file
    try {
      const objectUrl = URL.createObjectURL(file)
      img.src = objectUrl

      // Clean up object URL after image loads or fails
      img.onload = ((originalOnLoad) =>
        function (this: HTMLImageElement, ev: Event) {
          URL.revokeObjectURL(objectUrl)
          return originalOnLoad?.call(this, ev)
        })(img.onload)

      img.onerror = ((originalOnError) =>
        function (this: HTMLImageElement, ev: string | Event) {
          URL.revokeObjectURL(objectUrl)
          return originalOnError?.call(this, ev)
        })(img.onerror)
    } catch (error) {
      reject(new Error("Failed to create object URL from file"))
    }
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

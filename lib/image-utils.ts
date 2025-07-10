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

        // Convert to WebP blob for better compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              // Fallback to JPEG if WebP fails
              canvas.toBlob(
                (jpegBlob) => {
                  if (!jpegBlob) {
                    reject(new Error("Failed to create image blob"))
                    return
                  }

                  try {
                    const compressedFile = new File([jpegBlob], getWebPFileName(file.name), {
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
              return
            }

            try {
              const compressedFile = new File([blob], getWebPFileName(file.name), {
                type: "image/webp",
                lastModified: Date.now(),
              })

              const dataUrl = canvas.toDataURL("image/webp", quality)

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
          "image/webp",
          quality,
        )
      } catch (error) {
        console.error("Canvas processing error:", error)
        reject(new Error("Failed to process image on canvas"))
      }
    }

    img.onerror = (error) => {
      console.error("Image load error:", error)
      reject(new Error("Failed to load image file"))
    }

    // Create a more robust image loading approach
    try {
      // First try to load directly from file
      const reader = new FileReader()

      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string
        } else {
          reject(new Error("Failed to read file"))
        }
      }

      reader.onerror = () => {
        reject(new Error("Failed to read file"))
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error("FileReader error:", error)
      reject(new Error("Failed to read image file"))
    }
  })
}

function getWebPFileName(originalName: string): string {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "")
  return `${nameWithoutExt}.webp`
}

export function validateImageFile(file: File): string | null {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"]

  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return "Kun JPEG, PNG, WebP og HEIC filer er tillatt"
  }

  if (file.size > maxSize) {
    return "Bildet er for stort (maks 10MB)"
  }

  if (file.size === 0) {
    return "Bildefilen er tom eller korrupt"
  }

  return null
}

export async function uploadImageToSupabase(file: File, userId: string): Promise<string> {
  const { supabase } = await import("./supabase")

  const fileExt = file.name.split(".").pop() || "webp"
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage.from("post-images").upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    throw new Error(`Upload feilet: ${error.message}`)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("post-images").getPublicUrl(data.path)

  return publicUrl
}

// Alternative compression function for problematic images
export async function fallbackCompressImage(
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

    // Create a simple approach using URL.createObjectURL
    const img = new Image()
    let objectUrl: string | null = null

    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }

    img.onload = () => {
      try {
        // Calculate new dimensions
        let { width, height } = img

        const aspectRatio = width / height

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            width = maxWidth
            height = width / aspectRatio
          } else {
            height = maxHeight
            width = height * aspectRatio
          }
        }

        // Set canvas dimensions
        canvas.width = Math.round(width)
        canvas.height = Math.round(height)

        // Draw image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Convert to blob - try WebP first, fallback to JPEG
        const tryWebP = () => {
          canvas.toBlob(
            (blob) => {
              cleanup()

              if (!blob) {
                tryJPEG()
                return
              }

              try {
                const compressedFile = new File([blob], getWebPFileName(file.name), {
                  type: "image/webp",
                  lastModified: Date.now(),
                })

                const dataUrl = canvas.toDataURL("image/webp", quality)

                resolve({
                  file: compressedFile,
                  dataUrl,
                  width: canvas.width,
                  height: canvas.height,
                })
              } catch (error) {
                tryJPEG()
              }
            },
            "image/webp",
            quality,
          )
        }

        const tryJPEG = () => {
          canvas.toBlob(
            (blob) => {
              cleanup()

              if (!blob) {
                reject(new Error("Failed to create image blob"))
                return
              }

              try {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                })

                const dataUrl = canvas.toDataURL("image/jpeg", quality)

                resolve({
                  file: compressedFile,
                  dataUrl,
                  width: canvas.width,
                  height: canvas.height,
                })
              } catch (error) {
                reject(new Error("Failed to create compressed file"))
              }
            },
            "image/jpeg",
            quality,
          )
        }

        // Start with WebP
        tryWebP()
      } catch (error) {
        cleanup()
        reject(new Error("Failed to process image"))
      }
    }

    img.onerror = () => {
      cleanup()
      reject(new Error("Failed to load image"))
    }

    try {
      objectUrl = URL.createObjectURL(file)
      img.src = objectUrl
    } catch (error) {
      cleanup()
      reject(new Error("Failed to create object URL"))
    }
  })
}

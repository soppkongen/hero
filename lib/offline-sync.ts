import { supabase } from "./supabase"

export interface OfflinePost {
  id: string
  caption: string
  image_url: string
  image_blob?: Blob
  location: string | null
  waste_type: string[]
  estimated_weight: number | null
  points_earned: number
  created_at: string
  user_id: string
  synced: boolean
  retry_count: number
}

export interface OfflineImage {
  id: string
  blob: Blob
  filename: string
  user_id: string
  synced: boolean
  retry_count: number
  created_at: string
}

export class OfflineSyncService {
  private static readonly POSTS_STORAGE_KEY = "offline_posts"
  private static readonly IMAGES_STORAGE_KEY = "offline_images"
  private static readonly MAX_RETRY_COUNT = 3

  /**
   * Save post for offline sync
   */
  static async savePostOffline(post: Omit<OfflinePost, "synced" | "retry_count">): Promise<void> {
    try {
      const offlinePosts = this.getOfflinePosts()
      const newPost: OfflinePost = {
        ...post,
        synced: false,
        retry_count: 0,
      }

      offlinePosts.push(newPost)
      localStorage.setItem(this.POSTS_STORAGE_KEY, JSON.stringify(offlinePosts))

      console.log("Post saved offline:", post.id)
    } catch (error) {
      console.error("Error saving post offline:", error)
    }
  }

  /**
   * Save image for offline sync
   */
  static async saveImageOffline(image: Omit<OfflineImage, "synced" | "retry_count">): Promise<void> {
    try {
      const offlineImages = this.getOfflineImages()
      const newImage: OfflineImage = {
        ...image,
        synced: false,
        retry_count: 0,
      }

      offlineImages.push(newImage)

      // Store images in IndexedDB for larger storage
      await this.storeImageInIndexedDB(newImage)

      // Store metadata in localStorage
      const imageMetadata = { ...newImage }
      delete (imageMetadata as any).blob
      localStorage.setItem(
        this.IMAGES_STORAGE_KEY,
        JSON.stringify([...offlineImages.map((img) => ({ ...img, blob: undefined })), imageMetadata]),
      )

      console.log("Image saved offline:", image.id)
    } catch (error) {
      console.error("Error saving image offline:", error)
    }
  }

  /**
   * Sync all offline data when connection is restored
   */
  static async syncOfflineData(): Promise<{ posts: number; images: number; errors: string[] }> {
    const results = { posts: 0, images: 0, errors: [] as string[] }

    try {
      // Sync images first
      const imageResults = await this.syncOfflineImages()
      results.images = imageResults.synced
      results.errors.push(...imageResults.errors)

      // Then sync posts
      const postResults = await this.syncOfflinePosts()
      results.posts = postResults.synced
      results.errors.push(...postResults.errors)

      console.log("Offline sync completed:", results)
      return results
    } catch (error) {
      console.error("Error during offline sync:", error)
      results.errors.push(`Sync error: ${error}`)
      return results
    }
  }

  /**
   * Sync offline posts
   */
  private static async syncOfflinePosts(): Promise<{ synced: number; errors: string[] }> {
    const offlinePosts = this.getOfflinePosts()
    const unsyncedPosts = offlinePosts.filter((post) => !post.synced && post.retry_count < this.MAX_RETRY_COUNT)

    let synced = 0
    const errors: string[] = []

    for (const post of unsyncedPosts) {
      try {
        const { error } = await supabase.from("posts").insert({
          id: post.id,
          user_id: post.user_id,
          caption: post.caption,
          image_url: post.image_url,
          location: post.location,
          waste_type: post.waste_type,
          estimated_weight: post.estimated_weight,
          points_earned: post.points_earned,
          created_at: post.created_at,
        })

        if (error) {
          throw error
        }

        // Mark as synced
        post.synced = true
        synced++
        console.log("Post synced:", post.id)
      } catch (error) {
        post.retry_count++
        errors.push(`Post ${post.id}: ${error}`)
        console.error("Error syncing post:", post.id, error)
      }
    }

    // Update localStorage
    this.saveOfflinePosts(offlinePosts)

    return { synced, errors }
  }

  /**
   * Sync offline images
   */
  private static async syncOfflineImages(): Promise<{ synced: number; errors: string[] }> {
    const offlineImages = this.getOfflineImages()
    const unsyncedImages = offlineImages.filter((img) => !img.synced && img.retry_count < this.MAX_RETRY_COUNT)

    let synced = 0
    const errors: string[] = []

    for (const imageMetadata of unsyncedImages) {
      try {
        // Get blob from IndexedDB
        const imageWithBlob = await this.getImageFromIndexedDB(imageMetadata.id)
        if (!imageWithBlob) {
          throw new Error("Image blob not found in IndexedDB")
        }

        // Upload to Supabase
        const file = new File([imageWithBlob.blob], imageMetadata.filename, {
          type: imageWithBlob.blob.type,
        })

        const { uploadImageToSupabase } = await import("./image-utils")
        const publicUrl = await uploadImageToSupabase(file, imageMetadata.user_id)

        // Mark as synced
        imageMetadata.synced = true
        synced++
        console.log("Image synced:", imageMetadata.id, publicUrl)
      } catch (error) {
        imageMetadata.retry_count++
        errors.push(`Image ${imageMetadata.id}: ${error}`)
        console.error("Error syncing image:", imageMetadata.id, error)
      }
    }

    // Update localStorage
    this.saveOfflineImages(offlineImages)

    return { synced, errors }
  }

  /**
   * Get offline posts from localStorage
   */
  private static getOfflinePosts(): OfflinePost[] {
    try {
      const stored = localStorage.getItem(this.POSTS_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error reading offline posts:", error)
      return []
    }
  }

  /**
   * Get offline images metadata from localStorage
   */
  private static getOfflineImages(): OfflineImage[] {
    try {
      const stored = localStorage.getItem(this.IMAGES_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error reading offline images:", error)
      return []
    }
  }

  /**
   * Save offline posts to localStorage
   */
  private static saveOfflinePosts(posts: OfflinePost[]): void {
    try {
      localStorage.setItem(this.POSTS_STORAGE_KEY, JSON.stringify(posts))
    } catch (error) {
      console.error("Error saving offline posts:", error)
    }
  }

  /**
   * Save offline images metadata to localStorage
   */
  private static saveOfflineImages(images: OfflineImage[]): void {
    try {
      const imagesWithoutBlobs = images.map((img) => ({ ...img, blob: undefined }))
      localStorage.setItem(this.IMAGES_STORAGE_KEY, JSON.stringify(imagesWithoutBlobs))
    } catch (error) {
      console.error("Error saving offline images:", error)
    }
  }

  /**
   * Store image blob in IndexedDB
   */
  private static async storeImageInIndexedDB(image: OfflineImage): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("SkjaergardsheltImages", 1)

      request.onerror = () => reject(request.error)

      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(["images"], "readwrite")
        const store = transaction.objectStore("images")

        store.put({
          id: image.id,
          blob: image.blob,
          filename: image.filename,
          user_id: image.user_id,
          created_at: image.created_at,
        })

        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
      }

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains("images")) {
          const store = db.createObjectStore("images", { keyPath: "id" })
          store.createIndex("user_id", "user_id", { unique: false })
        }
      }
    })
  }

  /**
   * Get image blob from IndexedDB
   */
  private static async getImageFromIndexedDB(imageId: string): Promise<OfflineImage | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("SkjaergardsheltImages", 1)

      request.onerror = () => reject(request.error)

      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(["images"], "readonly")
        const store = transaction.objectStore("images")
        const getRequest = store.get(imageId)

        getRequest.onsuccess = () => {
          resolve(getRequest.result || null)
        }

        getRequest.onerror = () => reject(getRequest.error)
      }
    })
  }

  /**
   * Check if device is online
   */
  static isOnline(): boolean {
    return navigator.onLine
  }

  /**
   * Get pending sync count
   */
  static getPendingSyncCount(): { posts: number; images: number } {
    const posts = this.getOfflinePosts().filter((p) => !p.synced).length
    const images = this.getOfflineImages().filter((i) => !i.synced).length
    return { posts, images }
  }

  /**
   * Clear synced offline data
   */
  static clearSyncedData(): void {
    const posts = this.getOfflinePosts().filter((p) => !p.synced)
    const images = this.getOfflineImages().filter((i) => !i.synced)

    this.saveOfflinePosts(posts)
    this.saveOfflineImages(images)
  }
}

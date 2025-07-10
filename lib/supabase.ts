import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          points: number
          level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          points?: number
          level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          points?: number
          level?: number
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          caption: string
          image_url: string
          location: string | null
          waste_type: string[]
          estimated_weight: number | null
          points_earned: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          caption: string
          image_url: string
          location?: string | null
          waste_type?: string[]
          estimated_weight?: number | null
          points_earned?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          caption?: string
          image_url?: string
          location?: string | null
          waste_type?: string[]
          estimated_weight?: number | null
          points_earned?: number
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          created_at?: string
        }
      }
      bag_weights: {
        Row: {
          bag_size: string
          avg_weight_kg: number
          created_at: string
        }
        Insert: {
          bag_size: string
          avg_weight_kg: number
          created_at?: string
        }
        Update: {
          bag_size?: string
          avg_weight_kg?: number
          created_at?: string
        }
      }
      density_factors: {
        Row: {
          waste_type: string
          density_kg_m3: number
          created_at: string
        }
        Insert: {
          waste_type: string
          density_kg_m3: number
          created_at?: string
        }
        Update: {
          waste_type?: string
          density_kg_m3?: number
          created_at?: string
        }
      }
      waste_pickup: {
        Row: {
          id: string
          user_id: string
          post_id: string | null
          eal_code: string | null
          waste_type: string | null
          estimation_method: string
          estimated_weight_kg: number | null
          confidence_pct: number | null
          bag_size: string | null
          bag_count: number | null
          volume_length_m: number | null
          volume_width_m: number | null
          volume_height_m: number | null
          photo_url: string | null
          reference_object: string | null
          manual_override_kg: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id?: string | null
          eal_code?: string | null
          waste_type?: string | null
          estimation_method: string
          estimated_weight_kg?: number | null
          confidence_pct?: number | null
          bag_size?: string | null
          bag_count?: number | null
          volume_length_m?: number | null
          volume_width_m?: number | null
          volume_height_m?: number | null
          photo_url?: string | null
          reference_object?: string | null
          manual_override_kg?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string | null
          eal_code?: string | null
          waste_type?: string | null
          estimation_method?: string
          estimated_weight_kg?: number | null
          confidence_pct?: number | null
          bag_size?: string | null
          bag_count?: number | null
          volume_length_m?: number | null
          volume_width_m?: number | null
          volume_height_m?: number | null
          photo_url?: string | null
          reference_object?: string | null
          manual_override_kg?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Helper function to validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Helper function to generate a valid test email
export function generateTestEmail(): string {
  const timestamp = Date.now()
  return `testuser${timestamp}@example.com`
}

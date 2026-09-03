import { supabase as baseSupabase } from '@/integrations/supabase/client'
export const supabase: any = baseSupabase


// Types based on our database schema
export interface Profile {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
  role?: 'admin' | 'moderator' | 'user'
  created_at: string
  updated_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role: 'admin' | 'moderator' | 'user'
  created_at: string
}

export interface Town {
  id: string
  name: string
  description?: string
  history?: string
  location?: string
  population?: number
  founded_year?: number
  featured_image_url?: string
  gallery_images?: string[]
  is_featured: boolean
  slug: string
  view_count: number
  created_at: string
  updated_at: string
}

export interface Story {
  id: string
  title: string
  content: string
  story_type: 'personal' | 'historical' | 'cultural' | 'legend'
  author_id: string
  town_id: string
  is_published: boolean
  featured_image_url?: string
  tags?: string[]
  view_count: number
  created_at: string
  updated_at: string
  author?: Profile
  town?: Town
}

export interface Comment {
  id: string
  content: string
  author_id: string
  story_id: string
  parent_id?: string
  is_approved: boolean
  created_at: string
  updated_at: string
  author?: Profile
  replies?: Comment[]
}

export interface MediaGallery {
  id: string
  title?: string
  description?: string
  media_url: string
  media_type: 'image' | 'video' | 'audio'
  town_id?: string
  story_id?: string
  uploaded_by: string
  is_featured: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  is_read: boolean
  notification_type: 'general' | 'story_approved' | 'comment' | 'admin'
  created_at: string
}
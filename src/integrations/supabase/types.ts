export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      campaign_donations: {
        Row: {
          account_details: string | null
          amount: number
          campaign_id: string
          created_at: string
          donor_id: string | null
          donor_message: string | null
          donor_name: string | null
          id: string
          is_anonymous: boolean | null
          payment_reference: string | null
          payment_status: string
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          account_details?: string | null
          amount: number
          campaign_id: string
          created_at?: string
          donor_id?: string | null
          donor_message?: string | null
          donor_name?: string | null
          id?: string
          is_anonymous?: boolean | null
          payment_reference?: string | null
          payment_status: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          account_details?: string | null
          amount?: number
          campaign_id?: string
          created_at?: string
          donor_id?: string | null
          donor_message?: string | null
          donor_name?: string | null
          id?: string
          is_anonymous?: boolean | null
          payment_reference?: string | null
          payment_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "funding_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_updates: {
        Row: {
          campaign_id: string
          content: string
          created_at: string
          created_by: string
          id: string
          media_url: string | null
          title: string
        }
        Insert: {
          campaign_id: string
          content: string
          created_at?: string
          created_by: string
          id?: string
          media_url?: string | null
          title: string
        }
        Update: {
          campaign_id?: string
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          media_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_updates_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "funding_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_withdrawals: {
        Row: {
          account_name: string
          account_number: string
          amount: number
          bank_code: string
          campaign_id: string
          created_at: string
          creator_id: string
          id: string
          processed_at: string | null
          processed_by: string | null
          rejection_reason: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number: string
          amount: number
          bank_code: string
          campaign_id: string
          created_at?: string
          creator_id: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          amount?: number
          bank_code?: string
          campaign_id?: string
          created_at?: string
          creator_id?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_withdrawals_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "funding_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_stories: {
        Row: {
          added_at: string
          collection_id: string
          display_order: number
          id: string
          story_id: string
        }
        Insert: {
          added_at?: string
          collection_id: string
          display_order?: number
          id?: string
          story_id: string
        }
        Update: {
          added_at?: string
          collection_id?: string
          display_order?: number
          id?: string
          story_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_stories_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "story_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_approved: boolean
          parent_id: string | null
          story_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean
          parent_id?: string | null
          story_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          parent_id?: string | null
          story_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      community_events: {
        Row: {
          cover_image: string | null
          created_at: string
          created_by: string
          current_attendees: number | null
          description: string
          end_date: string
          event_type: string
          has_live_stream: boolean | null
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          is_virtual: boolean | null
          location: string | null
          max_attendees: number | null
          start_date: string
          stream_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          created_by: string
          current_attendees?: number | null
          description: string
          end_date: string
          event_type: string
          has_live_stream?: boolean | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          start_date: string
          stream_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          created_by?: string
          current_attendees?: number | null
          description?: string
          end_date?: string
          event_type?: string
          has_live_stream?: boolean | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          start_date?: string
          stream_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_partners: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_approved: boolean
          location: string | null
          logo_url: string | null
          name: string
          type: string
          updated_at: string
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_approved?: boolean
          location?: string | null
          logo_url?: string | null
          name: string
          type: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_approved?: boolean
          location?: string | null
          logo_url?: string | null
          name?: string
          type?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      diaspora_posts: {
        Row: {
          author_id: string
          city: string | null
          content: string
          country: string
          created_at: string
          featured_image_url: string | null
          id: string
          is_approved: boolean
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          city?: string | null
          content: string
          country: string
          created_at?: string
          featured_image_url?: string | null
          id?: string
          is_approved?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          city?: string | null
          content?: string
          country?: string
          created_at?: string
          featured_image_url?: string | null
          id?: string
          is_approved?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          created_at: string
          event_id: string
          id: string
          rsvp_status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          rsvp_status: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          rsvp_status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "community_events"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          bio: string | null
          birth_date: string | null
          birth_place: string | null
          created_at: string
          death_date: string | null
          full_name: string
          gender: string | null
          id: string
          is_living: boolean | null
          is_public: boolean | null
          maiden_name: string | null
          occupation: string | null
          profile_photo: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          birth_date?: string | null
          birth_place?: string | null
          created_at?: string
          death_date?: string | null
          full_name: string
          gender?: string | null
          id?: string
          is_living?: boolean | null
          is_public?: boolean | null
          maiden_name?: string | null
          occupation?: string | null
          profile_photo?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          birth_date?: string | null
          birth_place?: string | null
          created_at?: string
          death_date?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          is_living?: boolean | null
          is_public?: boolean | null
          maiden_name?: string | null
          occupation?: string | null
          profile_photo?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      family_relationships: {
        Row: {
          created_at: string
          id: string
          member_id: string
          related_member_id: string
          relationship_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_id: string
          related_member_id: string
          relationship_type: string
        }
        Update: {
          created_at?: string
          id?: string
          member_id?: string
          related_member_id?: string
          relationship_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_relationships_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_relationships_related_member_id_fkey"
            columns: ["related_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_content: {
        Row: {
          content_type: string
          created_at: string
          created_by: string
          display_order: number
          featured_from: string
          featured_until: string
          id: string
          story_id: string | null
          user_id: string | null
        }
        Insert: {
          content_type: string
          created_at?: string
          created_by: string
          display_order?: number
          featured_from: string
          featured_until: string
          id?: string
          story_id?: string | null
          user_id?: string | null
        }
        Update: {
          content_type?: string
          created_at?: string
          created_by?: string
          display_order?: number
          featured_from?: string
          featured_until?: string
          id?: string
          story_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      funding_campaigns: {
        Row: {
          account_details: string | null
          available_balance: number | null
          category: string
          cover_image: string | null
          created_at: string
          created_by: string
          currency: string | null
          current_amount: number | null
          description: string
          end_date: string
          goal_amount: number
          id: string
          is_active: boolean | null
          is_approved: boolean | null
          is_featured: boolean | null
          media_gallery: Json | null
          platform_fee_percentage: number | null
          start_date: string
          title: string
          total_donors: number | null
          updated_at: string
        }
        Insert: {
          account_details?: string | null
          available_balance?: number | null
          category: string
          cover_image?: string | null
          created_at?: string
          created_by: string
          currency?: string | null
          current_amount?: number | null
          description: string
          end_date: string
          goal_amount: number
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          media_gallery?: Json | null
          platform_fee_percentage?: number | null
          start_date?: string
          title: string
          total_donors?: number | null
          updated_at?: string
        }
        Update: {
          account_details?: string | null
          available_balance?: number | null
          category?: string
          cover_image?: string | null
          created_at?: string
          created_by?: string
          currency?: string | null
          current_amount?: number | null
          description?: string
          end_date?: string
          goal_amount?: number
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          media_gallery?: Json | null
          platform_fee_percentage?: number | null
          start_date?: string
          title?: string
          total_donors?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      live_streams: {
        Row: {
          chat_enabled: boolean | null
          created_at: string
          created_by: string
          description: string | null
          ended_at: string | null
          event_id: string | null
          id: string
          is_live: boolean | null
          started_at: string | null
          stream_url: string
          title: string
          total_viewers: number | null
        }
        Insert: {
          chat_enabled?: boolean | null
          created_at?: string
          created_by: string
          description?: string | null
          ended_at?: string | null
          event_id?: string | null
          id?: string
          is_live?: boolean | null
          started_at?: string | null
          stream_url: string
          title: string
          total_viewers?: number | null
        }
        Update: {
          chat_enabled?: boolean | null
          created_at?: string
          created_by?: string
          description?: string | null
          ended_at?: string | null
          event_id?: string | null
          id?: string
          is_live?: boolean | null
          started_at?: string | null
          stream_url?: string
          title?: string
          total_viewers?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "live_streams_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "community_events"
            referencedColumns: ["id"]
          },
        ]
      }
      media_gallery: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_featured: boolean
          media_type: string
          media_url: string
          story_id: string | null
          title: string | null
          town_id: string | null
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          media_type: string
          media_url: string
          story_id?: string | null
          title?: string | null
          town_id?: string | null
          uploaded_by: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          media_type?: string
          media_url?: string
          story_id?: string | null
          title?: string | null
          town_id?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_gallery_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_gallery_town_id_fkey"
            columns: ["town_id"]
            isOneToOne: false
            referencedRelation: "towns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_gallery_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_gallery_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_wall: {
        Row: {
          author_id: string
          created_at: string
          id: string
          is_approved: boolean
          message: string
          photo_url: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          created_at?: string
          id?: string
          is_approved?: boolean
          message: string
          photo_url: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          message?: string
          photo_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          id: string
          notification_type: string
          sent_at: string | null
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json | null
          id?: string
          notification_type: string
          sent_at?: string | null
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          id?: string
          notification_type?: string
          sent_at?: string | null
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          notification_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          notification_type: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_events: {
        Row: {
          created_at: string
          description: string
          event_date: string
          id: string
          image_url: string | null
          is_approved: boolean
          location: string | null
          partner_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          event_date: string
          id?: string
          image_url?: string | null
          is_approved?: boolean
          location?: string | null
          partner_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          event_date?: string
          id?: string
          image_url?: string | null
          is_approved?: boolean
          location?: string | null
          partner_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_events_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "community_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_revenue: {
        Row: {
          campaign_id: string
          created_at: string
          creator_amount: number
          donation_amount: number
          donation_id: string
          fee_amount: number
          fee_percentage: number
          id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          creator_amount: number
          donation_amount: number
          donation_id: string
          fee_amount: number
          fee_percentage: number
          id?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          creator_amount?: number
          donation_amount?: number
          donation_id?: string
          fee_amount?: number
          fee_percentage?: number
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_revenue_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "funding_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_revenue_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "campaign_donations"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_index?: number
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          ends_at: string | null
          id: string
          is_active: boolean
          options: Json
          question: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          options?: Json
          question: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          options?: Json
          question?: string
        }
        Relationships: []
      }
      prayer_capsules: {
        Row: {
          audio_url: string | null
          author_id: string
          content: string
          created_at: string
          id: string
          is_released: boolean
          release_date: string
        }
        Insert: {
          audio_url?: string | null
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_released?: boolean
          release_date: string
        }
        Update: {
          audio_url?: string | null
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_released?: boolean
          release_date?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          subscription: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          subscription: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          subscription?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_submissions: {
        Row: {
          answers: Json
          created_at: string
          id: string
          quiz_id: string
          score: number
          user_id: string
        }
        Insert: {
          answers: Json
          created_at?: string
          id?: string
          quiz_id: string
          score: number
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          quiz_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_submissions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          difficulty: string | null
          id: string
          is_active: boolean
          questions: Json
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean
          questions?: Json
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean
          questions?: Json
          title?: string
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          id: string
          last_read_at: string
          progress_percentage: number
          story_id: string
          user_id: string
        }
        Insert: {
          id?: string
          last_read_at?: string
          progress_percentage?: number
          story_id: string
          user_id: string
        }
        Update: {
          id?: string
          last_read_at?: string
          progress_percentage?: number
          story_id?: string
          user_id?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          author_id: string
          content: string
          created_at: string
          featured_image_url: string | null
          id: string
          is_published: boolean
          reaction_counts: Json | null
          story_type: string
          tags: string[] | null
          title: string
          town_id: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          featured_image_url?: string | null
          id?: string
          is_published?: boolean
          reaction_counts?: Json | null
          story_type: string
          tags?: string[] | null
          title: string
          town_id: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          featured_image_url?: string | null
          id?: string
          is_published?: boolean
          reaction_counts?: Json | null
          story_type?: string
          tags?: string[] | null
          title?: string
          town_id?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "stories_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_town_id_fkey"
            columns: ["town_id"]
            isOneToOne: false
            referencedRelation: "towns"
            referencedColumns: ["id"]
          },
        ]
      }
      story_bookmarks: {
        Row: {
          bookmarked_at: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          bookmarked_at?: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          bookmarked_at?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_bookmarks_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_collections: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_featured: boolean
          is_public: boolean
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_featured?: boolean
          is_public?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          is_public?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      story_reactions: {
        Row: {
          created_at: string
          id: string
          reaction_type: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_type: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction_type?: string
          story_id?: string
          user_id?: string
        }
        Relationships: []
      }
      story_views: {
        Row: {
          id: string
          session_id: string | null
          story_id: string
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          session_id?: string | null
          story_id: string
          user_id?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          session_id?: string | null
          story_id?: string
          user_id?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_chat_messages: {
        Row: {
          created_at: string
          id: string
          is_approved: boolean | null
          message: string
          stream_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_approved?: boolean | null
          message: string
          stream_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_approved?: boolean | null
          message?: string
          stream_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_chat_messages_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      time_capsules: {
        Row: {
          author_id: string
          capsule_type: string
          content: string
          created_at: string
          id: string
          is_unlocked: boolean
          media_urls: string[] | null
          recipients: string[] | null
          title: string
          town_id: string | null
          unlock_date: string
          unlocked_at: string | null
          view_count: number
        }
        Insert: {
          author_id: string
          capsule_type?: string
          content: string
          created_at?: string
          id?: string
          is_unlocked?: boolean
          media_urls?: string[] | null
          recipients?: string[] | null
          title: string
          town_id?: string | null
          unlock_date: string
          unlocked_at?: string | null
          view_count?: number
        }
        Update: {
          author_id?: string
          capsule_type?: string
          content?: string
          created_at?: string
          id?: string
          is_unlocked?: boolean
          media_urls?: string[] | null
          recipients?: string[] | null
          title?: string
          town_id?: string | null
          unlock_date?: string
          unlocked_at?: string | null
          view_count?: number
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          category: string
          created_at: string
          created_by: string
          description: string
          event_date: string
          event_year: number
          featured_image: string | null
          id: string
          is_approved: boolean | null
          media_gallery: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by: string
          description: string
          event_date: string
          event_year: number
          featured_image?: string | null
          id?: string
          is_approved?: boolean | null
          media_gallery?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          event_date?: string
          event_year?: number
          featured_image?: string | null
          id?: string
          is_approved?: boolean | null
          media_gallery?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tour_stops: {
        Row: {
          audio_narration: string | null
          created_at: string
          description: string
          id: string
          latitude: number | null
          longitude: number | null
          media_type: string
          media_url: string
          stop_number: number
          title: string
          tour_id: string
        }
        Insert: {
          audio_narration?: string | null
          created_at?: string
          description: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          media_type: string
          media_url: string
          stop_number: number
          title: string
          tour_id: string
        }
        Update: {
          audio_narration?: string | null
          created_at?: string
          description?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          media_type?: string
          media_url?: string
          stop_number?: number
          title?: string
          tour_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_stops_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "virtual_tours"
            referencedColumns: ["id"]
          },
        ]
      }
      town_followers: {
        Row: {
          followed_at: string
          id: string
          town_id: string
          user_id: string
        }
        Insert: {
          followed_at?: string
          id?: string
          town_id: string
          user_id: string
        }
        Update: {
          followed_at?: string
          id?: string
          town_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "town_followers_town_id_fkey"
            columns: ["town_id"]
            isOneToOne: false
            referencedRelation: "towns"
            referencedColumns: ["id"]
          },
        ]
      }
      town_views: {
        Row: {
          id: string
          session_id: string | null
          town_id: string
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          session_id?: string | null
          town_id: string
          user_id?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          session_id?: string | null
          town_id?: string
          user_id?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "town_views_town_id_fkey"
            columns: ["town_id"]
            isOneToOne: false
            referencedRelation: "towns"
            referencedColumns: ["id"]
          },
        ]
      }
      towns: {
        Row: {
          created_at: string
          description: string | null
          featured_image_url: string | null
          founded_year: number | null
          gallery_images: string[] | null
          history: string | null
          id: string
          is_featured: boolean
          location: string | null
          name: string
          population: number | null
          slug: string
          updated_at: string
          view_count: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          featured_image_url?: string | null
          founded_year?: number | null
          gallery_images?: string[] | null
          history?: string | null
          id?: string
          is_featured?: boolean
          location?: string | null
          name: string
          population?: number | null
          slug: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          featured_image_url?: string | null
          founded_year?: number | null
          gallery_images?: string[] | null
          history?: string | null
          id?: string
          is_featured?: boolean
          location?: string | null
          name?: string
          population?: number | null
          slug?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          badge_tier: string
          badge_type: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_tier?: string
          badge_type: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_tier?: string
          badge_type?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          last_updated: string
          quiz_points: number
          total_interactions: number
          total_posts: number
          user_id: string
        }
        Insert: {
          last_updated?: string
          quiz_points?: number
          total_interactions?: number
          total_posts?: number
          user_id: string
        }
        Update: {
          last_updated?: string
          quiz_points?: number
          total_interactions?: number
          total_posts?: number
          user_id?: string
        }
        Relationships: []
      }
      virtual_tours: {
        Row: {
          cover_image: string | null
          created_at: string
          created_by: string
          description: string
          difficulty: string | null
          duration_minutes: number | null
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          title: string
          total_views: number | null
          town_id: string | null
          updated_at: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          created_by: string
          description: string
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          title: string
          total_views?: number | null
          town_id?: string | null
          updated_at?: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          created_by?: string
          description?: string
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          title?: string
          total_views?: number | null
          town_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "virtual_tours_town_id_fkey"
            columns: ["town_id"]
            isOneToOne: false
            referencedRelation: "towns"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      profiles_public: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_view_profile_email: { Args: { profile_id: string }; Returns: boolean }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_user_interaction: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      queue_notification: {
        Args: {
          p_body: string
          p_data?: Json
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      release_prayer_capsules: { Args: never; Returns: undefined }
      unlock_time_capsules: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const

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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          resource_link: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          resource_link?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          resource_link?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          duration_minutes: number
          ends_at: string | null
          id: string
          is_online: boolean
          meeting_expires_at: string | null
          meeting_link: string | null
          meeting_room_id: string | null
          patient_id: string
          payment_status: string | null
          price: number | null
          professional_id: string
          starts_at: string | null
          status: string
          type: string
          updated_at: string
          video_platform: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          duration_minutes?: number
          ends_at?: string | null
          id?: string
          is_online?: boolean
          meeting_expires_at?: string | null
          meeting_link?: string | null
          meeting_room_id?: string | null
          patient_id: string
          payment_status?: string | null
          price?: number | null
          professional_id: string
          starts_at?: string | null
          status?: string
          type?: string
          updated_at?: string
          video_platform?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          duration_minutes?: number
          ends_at?: string | null
          id?: string
          is_online?: boolean
          meeting_expires_at?: string | null
          meeting_link?: string | null
          meeting_room_id?: string | null
          patient_id?: string
          payment_status?: string | null
          price?: number | null
          professional_id?: string
          starts_at?: string | null
          status?: string
          type?: string
          updated_at?: string
          video_platform?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          accessed_at: string
          action: string
          details: Json | null
          id: string
          ip_address: unknown
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          accessed_at?: string
          action: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          accessed_at?: string
          action?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description_en: string | null
          description_es: string | null
          icon: string | null
          id: string
          name_en: string
          name_es: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description_en?: string | null
          description_es?: string | null
          icon?: string | null
          id?: string
          name_en: string
          name_es: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description_en?: string | null
          description_es?: string | null
          icon?: string | null
          id?: string
          name_en?: string
          name_es?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          message_type: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          content?: string
          conversation_id: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          message_type?: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          message_type?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_records: {
        Row: {
          appointment_id: string | null
          content: Json
          created_at: string | null
          id: string
          patient_id: string | null
          professional_id: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          content: Json
          created_at?: string | null
          id?: string
          patient_id?: string | null
          professional_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          content?: Json
          created_at?: string | null
          id?: string
          patient_id?: string | null
          professional_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_records_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conditions: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          initiated_by: string | null
          professional_id: string | null
          request_message: string | null
          request_status: string
          responded_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          initiated_by?: string | null
          professional_id?: string | null
          request_message?: string | null
          request_status?: string
          responded_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          initiated_by?: string | null
          professional_id?: string | null
          request_message?: string | null
          request_status?: string
          responded_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          patient_id: string
          professional_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          patient_id: string
          professional_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          patient_id?: string
          professional_id?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          id: string
          platform_fee: number
          professional_id: string | null
          professional_net: number
          status: string | null
          stripe_transfer_id: string | null
          total_amount: number
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          id?: string
          platform_fee: number
          professional_id?: string | null
          professional_net: number
          status?: string | null
          stripe_transfer_id?: string | null
          total_amount: number
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          id?: string
          platform_fee?: number
          professional_id?: string | null
          professional_net?: number
          status?: string | null
          stripe_transfer_id?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      imaging_studies: {
        Row: {
          accession_number: string | null
          created_at: string
          dicom_web_endpoint: string
          id: string
          modality: string
          patient_id: string
          professional_id: string | null
          referral_id: string | null
          report_status: string
          report_text: string | null
          study_type: string
          updated_at: string
        }
        Insert: {
          accession_number?: string | null
          created_at?: string
          dicom_web_endpoint: string
          id?: string
          modality: string
          patient_id: string
          professional_id?: string | null
          referral_id?: string | null
          report_status?: string
          report_text?: string | null
          study_type: string
          updated_at?: string
        }
        Update: {
          accession_number?: string | null
          created_at?: string
          dicom_web_endpoint?: string
          id?: string
          modality?: string
          patient_id?: string
          professional_id?: string | null
          referral_id?: string | null
          report_status?: string
          report_text?: string | null
          study_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "imaging_studies_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_studies_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_studies_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          appointment_id: string | null
          attachments: Json | null
          chief_complaint: string | null
          created_at: string
          deleted_at: string | null
          diagnosis: string | null
          diagnosis_code: string | null
          follow_up_date: string | null
          follow_up_instructions: string | null
          id: string
          is_draft: boolean | null
          is_signed: boolean | null
          patient_id: string
          prescription: string | null
          private_notes: string | null
          professional_id: string
          reason_for_visit: string | null
          signed_at: string | null
          treatment: string | null
          updated_at: string
          vital_signs: Json | null
        }
        Insert: {
          appointment_id?: string | null
          attachments?: Json | null
          chief_complaint?: string | null
          created_at?: string
          deleted_at?: string | null
          diagnosis?: string | null
          diagnosis_code?: string | null
          follow_up_date?: string | null
          follow_up_instructions?: string | null
          id?: string
          is_draft?: boolean | null
          is_signed?: boolean | null
          patient_id: string
          prescription?: string | null
          private_notes?: string | null
          professional_id: string
          reason_for_visit?: string | null
          signed_at?: string | null
          treatment?: string | null
          updated_at?: string
          vital_signs?: Json | null
        }
        Update: {
          appointment_id?: string | null
          attachments?: Json | null
          chief_complaint?: string | null
          created_at?: string
          deleted_at?: string | null
          diagnosis?: string | null
          diagnosis_code?: string | null
          follow_up_date?: string | null
          follow_up_instructions?: string | null
          id?: string
          is_draft?: boolean | null
          is_signed?: boolean | null
          patient_id?: string
          prescription?: string | null
          private_notes?: string | null
          professional_id?: string
          reason_for_visit?: string | null
          signed_at?: string | null
          treatment?: string | null
          updated_at?: string
          vital_signs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          appointment_id: string | null
          content: string
          created_at: string | null
          id: string
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          appointment_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          appointment_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
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
        ]
      }
      platform_revenue: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          id: string
          platform_fee: number
          professional_payout: number
          status: string | null
          total_amount: number
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          id?: string
          platform_fee: number
          professional_payout: number
          status?: string | null
          total_amount: number
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          id?: string
          platform_fee?: number
          professional_payout?: number
          status?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "platform_revenue_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          commission_rate_percentage: number | null
          id: number
          updated_at: string | null
        }
        Insert: {
          commission_rate_percentage?: number | null
          id?: number
          updated_at?: string | null
        }
        Update: {
          commission_rate_percentage?: number | null
          id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          created_at: string | null
          id: string
          instructions: string | null
          items: Json
          patient_id: string | null
          pdf_url: string | null
          professional_id: string | null
          record_id: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          instructions?: string | null
          items: Json
          patient_id?: string | null
          pdf_url?: string | null
          professional_id?: string | null
          record_id?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instructions?: string | null
          items?: Json
          patient_id?: string | null
          pdf_url?: string | null
          professional_id?: string | null
          record_id?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "clinical_records"
            referencedColumns: ["id"]
          },
        ]
      }
      Professional: {
        Row: {
          city: string
          createdAt: string | null
          description: string | null
          id: string
          name: string
          photoUrl: string | null
          priceRange: string | null
          rut: string
          slotDuration: number
          specialty: string
          workDayEnd: string
          workDayStart: string
        }
        Insert: {
          city: string
          createdAt?: string | null
          description?: string | null
          id: string
          name: string
          photoUrl?: string | null
          priceRange?: string | null
          rut: string
          slotDuration: number
          specialty: string
          workDayEnd: string
          workDayStart: string
        }
        Update: {
          city?: string
          createdAt?: string | null
          description?: string | null
          id?: string
          name?: string
          photoUrl?: string | null
          priceRange?: string | null
          rut?: string
          slotDuration?: number
          specialty?: string
          workDayEnd?: string
          workDayStart?: string
        }
        Relationships: []
      }
      professional_credentials: {
        Row: {
          created_at: string
          file_url: string
          id: string
          institution: string
          professional_id: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["credential_status"]
          title: string
          type: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
          year: string
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          institution: string
          professional_id: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["credential_status"]
          title: string
          type: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          year: string
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          institution?: string
          professional_id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["credential_status"]
          title?: string
          type?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_credentials_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_credentials_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          medical_record_id: string | null
          patient_id: string
          professional_id: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          medical_record_id?: string | null
          patient_id: string
          professional_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          medical_record_id?: string | null
          patient_id?: string
          professional_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_professional_notes_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_professional_notes_professional"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_notes_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_notes_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "patient_medical_records_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_notes_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          accepted_insurances: string[] | null
          availability: Json | null
          bio: string | null
          clinic_photos: string[] | null
          conditions_treated: string[] | null
          consultation_format: string[] | null
          consultation_price: number | null
          consultation_type: string | null
          created_at: string
          education: Json | null
          experience_years: number | null
          id: string
          in_person_price: number | null
          invited_by_code: string | null
          is_public: boolean | null
          languages: string[] | null
          location: string | null
          online_price: number | null
          rating: number
          registration_institution: string | null
          registration_number: string | null
          rejection_reason: string | null
          review_count: number
          slug: string | null
          specialty: string | null
          specialty_id: string | null
          stellar_wallet: string | null
          university: string | null
          updated_at: string
          verified: boolean
          verified_at: string | null
          verified_by: string | null
          years_experience: number | null
        }
        Insert: {
          accepted_insurances?: string[] | null
          availability?: Json | null
          bio?: string | null
          clinic_photos?: string[] | null
          conditions_treated?: string[] | null
          consultation_format?: string[] | null
          consultation_price?: number | null
          consultation_type?: string | null
          created_at?: string
          education?: Json | null
          experience_years?: number | null
          id: string
          in_person_price?: number | null
          invited_by_code?: string | null
          is_public?: boolean | null
          languages?: string[] | null
          location?: string | null
          online_price?: number | null
          rating?: number
          registration_institution?: string | null
          registration_number?: string | null
          rejection_reason?: string | null
          review_count?: number
          slug?: string | null
          specialty?: string | null
          specialty_id?: string | null
          stellar_wallet?: string | null
          university?: string | null
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          years_experience?: number | null
        }
        Update: {
          accepted_insurances?: string[] | null
          availability?: Json | null
          bio?: string | null
          clinic_photos?: string[] | null
          conditions_treated?: string[] | null
          consultation_format?: string[] | null
          consultation_price?: number | null
          consultation_type?: string | null
          created_at?: string
          education?: Json | null
          experience_years?: number | null
          id?: string
          in_person_price?: number | null
          invited_by_code?: string | null
          is_public?: boolean | null
          languages?: string[] | null
          location?: string | null
          online_price?: number | null
          rating?: number
          registration_institution?: string | null
          registration_number?: string | null
          rejection_reason?: string | null
          review_count?: number
          slug?: string | null
          specialty?: string | null
          specialty_id?: string | null
          stellar_wallet?: string | null
          university?: string | null
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "professionals_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professionals_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professionals_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string | null
          admin_notes: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          created_by_professional_id: string | null
          date_of_birth: string | null
          email: string | null
          email_verified: boolean
          first_name: string | null
          gender: string | null
          health_insurance: string | null
          id: string
          is_onboarded: boolean | null
          last_name: string | null
          last_seen: string | null
          mp_access_token: string | null
          mp_public_key: string | null
          mp_refresh_token: string | null
          mp_token_updated_at: string | null
          mp_user_id: string | null
          phone: string | null
          response_time: string | null
          rnpi_number: string | null
          role: string
          selected_plan_id: string | null
          specialty: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          trial_end_date: string | null
          updated_at: string
          warned_at: string | null
          warned_by: string | null
          warning_message: string | null
        }
        Insert: {
          account_status?: string | null
          admin_notes?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          created_by_professional_id?: string | null
          date_of_birth?: string | null
          email?: string | null
          email_verified?: boolean
          first_name?: string | null
          gender?: string | null
          health_insurance?: string | null
          id: string
          is_onboarded?: boolean | null
          last_name?: string | null
          last_seen?: string | null
          mp_access_token?: string | null
          mp_public_key?: string | null
          mp_refresh_token?: string | null
          mp_token_updated_at?: string | null
          mp_user_id?: string | null
          phone?: string | null
          response_time?: string | null
          rnpi_number?: string | null
          role?: string
          selected_plan_id?: string | null
          specialty?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          trial_end_date?: string | null
          updated_at?: string
          warned_at?: string | null
          warned_by?: string | null
          warning_message?: string | null
        }
        Update: {
          account_status?: string | null
          admin_notes?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          created_by_professional_id?: string | null
          date_of_birth?: string | null
          email?: string | null
          email_verified?: boolean
          first_name?: string | null
          gender?: string | null
          health_insurance?: string | null
          id?: string
          is_onboarded?: boolean | null
          last_name?: string | null
          last_seen?: string | null
          mp_access_token?: string | null
          mp_public_key?: string | null
          mp_refresh_token?: string | null
          mp_token_updated_at?: string | null
          mp_user_id?: string | null
          phone?: string | null
          response_time?: string | null
          rnpi_number?: string | null
          role?: string
          selected_plan_id?: string | null
          specialty?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          trial_end_date?: string | null
          updated_at?: string
          warned_at?: string | null
          warned_by?: string | null
          warning_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_created_by_professional_id_fkey"
            columns: ["created_by_professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_warned_by_fkey"
            columns: ["warned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string | null
          current_uses: number | null
          id: string
          is_active: boolean | null
          max_uses: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_uses?: number | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_uses?: number | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          patient_id: string
          referring_professional_id: string | null
          status: string | null
          target_professional_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          patient_id: string
          referring_professional_id?: string | null
          status?: string | null
          target_professional_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          patient_id?: string
          referring_professional_id?: string | null
          status?: string | null
          target_professional_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referring_professional_id_fkey"
            columns: ["referring_professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_target_professional_id_fkey"
            columns: ["target_professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          professional_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          id?: string
          professional_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          professional_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_templates_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          appointment_id: string
          comment: string | null
          created_at: string | null
          id: string
          is_public: boolean | null
          patient_id: string
          professional_id: string
          rating: number
          updated_at: string | null
        }
        Insert: {
          appointment_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          patient_id: string
          professional_id: string
          rating: number
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          patient_id?: string
          professional_id?: string
          rating?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          professional_id: string | null
          slot_duration: number | null
          start_time: string
        }
        Insert: {
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          professional_id?: string | null
          slot_duration?: number | null
          start_time: string
        }
        Update: {
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          professional_id?: string | null
          slot_duration?: number | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      search_synonyms: {
        Row: {
          alias: string
          id: number
          value: string
        }
        Insert: {
          alias: string
          id?: number
          value: string
        }
        Update: {
          alias?: string
          id?: number
          value?: string
        }
        Relationships: []
      }
      specialties: {
        Row: {
          category_id: string
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          name_en: string
          name_es: string
          parent_id: string | null
          requires_license: boolean
          slug: string
          sort_order: number
        }
        Insert: {
          category_id: string
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name_en: string
          name_es: string
          parent_id?: string | null
          requires_license?: boolean
          slug: string
          sort_order?: number
        }
        Update: {
          category_id?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name_en?: string
          name_es?: string
          parent_id?: string | null
          requires_license?: boolean
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "specialties_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialties_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      specialty_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      specialty_conditions: {
        Row: {
          condition_slug: string
          id: string
          specialty_slug: string
        }
        Insert: {
          condition_slug: string
          id?: string
          specialty_slug: string
        }
        Update: {
          condition_slug?: string
          id?: string
          specialty_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialty_conditions_condition_slug_fkey"
            columns: ["condition_slug"]
            isOneToOne: false
            referencedRelation: "conditions"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "specialty_conditions_specialty_slug_fkey"
            columns: ["specialty_slug"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["slug"]
          },
        ]
      }
      support_tickets: {
        Row: {
          admin_id: string | null
          admin_response: string | null
          category: string | null
          created_at: string | null
          id: string
          message: string
          priority: string | null
          resolved_at: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string
          user_role: string | null
        }
        Insert: {
          admin_id?: string | null
          admin_response?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          message: string
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id: string
          user_role?: string | null
        }
        Update: {
          admin_id?: string | null
          admin_response?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          message?: string
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string
          user_role?: string | null
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          sender_id: string
          sender_role: string | null
          ticket_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          sender_id: string
          sender_role?: string | null
          ticket_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          sender_id?: string
          sender_role?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string | null
          email: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      patient_medical_records_view: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          diagnosis: string | null
          id: string | null
          patient_id: string | null
          prescription: string | null
          professional_id: string | null
          treatment: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          diagnosis?: string | null
          id?: string | null
          patient_id?: string | null
          prescription?: string | null
          professional_id?: string | null
          treatment?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          diagnosis?: string | null
          id?: string | null
          patient_id?: string | null
          prescription?: string | null
          professional_id?: string | null
          treatment?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      autocomplete_specialty: {
        Args: { p_query: string }
        Returns: {
          specialty: string
        }[]
      }
      buscar_profesionales: {
        Args: { p_limit?: number; p_query: string }
        Returns: {
          bio: string
          city: string
          id: string
          professional_id: string
          rating: number
          relevance: number
          review_count: number
          specialty: string
        }[]
      }
      can_modify_subscription_fields: { Args: never; Returns: boolean }
      generate_professional_slug: { Args: { p_id: string }; Returns: string }
      get_categories_with_counts: {
        Args: { p_lang?: string }
        Returns: {
          description: string
          icon: string
          id: string
          name: string
          professional_count: number
          slug: string
          sort_order: number
          specialty_count: number
        }[]
      }
      get_or_create_conversation: {
        Args: { p_professional_id?: string; p_user_a: string; p_user_b: string }
        Returns: string
      }
      get_price_range: {
        Args: { p_category_slug?: string; p_specialty_slug?: string }
        Returns: {
          max_price: number
          min_price: number
        }[]
      }
      get_professional_details: {
        Args: { p_lang?: string; p_professional_id: string }
        Returns: {
          availability: Json
          avatar_url: string
          bio: string
          category_id: string
          category_name: string
          category_slug: string
          consultation_price: number
          consultation_type: string
          created_at: string
          email: string
          first_name: string
          id: string
          in_person_price: number
          languages: string[]
          last_name: string
          location: string
          online_price: number
          phone: string
          rating: number
          registration_institution: string
          registration_number: string
          review_count: number
          specialty_icon: string
          specialty_id: string
          specialty_name: string
          specialty_slug: string
          university: string
          verified: boolean
          years_experience: number
        }[]
      }
      get_specialties_with_counts: {
        Args: { p_category_slug?: string; p_lang?: string; p_search?: string }
        Returns: {
          category_id: string
          category_name: string
          category_slug: string
          icon: string
          id: string
          name: string
          parent_id: string
          professional_count: number
          requires_license: boolean
          slug: string
          sort_order: number
        }[]
      }
      get_user_role: { Args: never; Returns: string }
      get_waitlist_count: { Args: never; Returns: number }
      immutable_unaccent: { Args: { "": string }; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_available_today: { Args: { p_availability: Json }; Returns: boolean }
      is_patient: { Args: never; Returns: boolean }
      is_professional: { Args: never; Returns: boolean }
      is_verified_professional: {
        Args: { profile_id: string }
        Returns: boolean
      }
      normalize_search_query: { Args: { p_query: string }; Returns: string }
      professional_has_appointment_with_patient: {
        Args: { p_patient_id: string; p_professional_id: string }
        Returns: boolean
      }
      search_professionals: {
        Args: {
          p_available_today?: boolean
          p_category_slug?: string
          p_consultation_type?: string
          p_lang?: string
          p_language?: string
          p_limit?: number
          p_location?: string
          p_page?: number
          p_price_max?: number
          p_price_min?: number
          p_search?: string
          p_sort_by?: string
          p_specialty_slug?: string
          p_verified_only?: boolean
        }
        Returns: {
          availability: Json
          avatar_url: string
          bio: string
          category_name: string
          category_slug: string
          consultation_price: number
          consultation_type: string
          first_name: string
          id: string
          in_person_price: number
          languages: string[]
          last_name: string
          location: string
          online_price: number
          rating: number
          review_count: number
          specialty_icon: string
          specialty_name: string
          specialty_slug: string
          total_count: number
          university: string
          verified: boolean
          years_experience: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unaccent: { Args: { "": string }; Returns: string }
      update_conversation_request_status: {
        Args: { p_conversation_id: string; p_status: string }
        Returns: undefined
      }
    }
    Enums: {
      credential_status: "pending" | "verified" | "rejected"
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
      credential_status: ["pending", "verified", "rejected"],
    },
  },
} as const

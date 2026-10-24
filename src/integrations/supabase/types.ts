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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      account_deletion_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          failure_code: string | null
          id: string
          processing_state: string
          processing_token: string | null
          scope: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          failure_code?: string | null
          id?: string
          processing_state?: string
          processing_token?: string | null
          scope: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          failure_code?: string | null
          id?: string
          processing_state?: string
          processing_token?: string | null
          scope?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          allergies: string | null
          appointment_date: string
          concern: string
          consultation_type: string
          created_at: string
          current_medication: string | null
          date_of_birth: string | null
          doctor_notes: string | null
          email: string | null
          fee: number
          gender: string | null
          health_consent_at: string | null
          health_consent_receipt_id: string | null
          health_notice_version: string | null
          id: string
          medical_history: string | null
          mode: Database["public"]["Enums"]["consultation_mode"]
          patient_id: string
          patient_name: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string
          slot: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          allergies?: string | null
          appointment_date: string
          concern: string
          consultation_type?: string
          created_at?: string
          current_medication?: string | null
          date_of_birth?: string | null
          doctor_notes?: string | null
          email?: string | null
          fee?: number
          gender?: string | null
          health_consent_at?: string | null
          health_consent_receipt_id?: string | null
          health_notice_version?: string | null
          id?: string
          medical_history?: string | null
          mode?: Database["public"]["Enums"]["consultation_mode"]
          patient_id: string
          patient_name: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone: string
          slot: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          allergies?: string | null
          appointment_date?: string
          concern?: string
          consultation_type?: string
          created_at?: string
          current_medication?: string | null
          date_of_birth?: string | null
          doctor_notes?: string | null
          email?: string | null
          fee?: number
          gender?: string | null
          health_consent_at?: string | null
          health_consent_receipt_id?: string | null
          health_notice_version?: string | null
          id?: string
          medical_history?: string | null
          mode?: Database["public"]["Enums"]["consultation_mode"]
          patient_id?: string
          patient_name?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string
          slot?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: []
      }
      case_clinical_notes: {
        Row: {
          assessment: string
          case_record_id: string
          confidential_notes: string
          created_at: string
          doctor_id: string | null
          id: string
          updated_at: string
        }
        Insert: {
          assessment?: string
          case_record_id: string
          confidential_notes?: string
          created_at?: string
          doctor_id?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          assessment?: string
          case_record_id?: string
          confidential_notes?: string
          created_at?: string
          doctor_id?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_clinical_notes_case_record_id_fkey"
            columns: ["case_record_id"]
            isOneToOne: false
            referencedRelation: "case_records"
            referencedColumns: ["id"]
          },
        ]
      }
      case_records: {
        Row: {
          age: string
          allergies: string
          appetite: string
          appointment_id: string | null
          attachments: Json
          chief_complaint: string
          child_behaviour: string
          child_birth_history: string
          child_development: string
          child_vaccination: string
          complaint_duration: string
          created_at: string
          current_medicines: string
          current_symptoms: string
          daily_routine: string
          digestion: string
          emotional_state: string
          family_history: string
          gender: string
          health_consent_at: string | null
          health_consent_receipt_id: string | null
          health_notice_version: string | null
          id: string
          lifestyle: string
          menstrual_history: string
          mental_health_notes: string
          occupation: string
          past_medical_history: string
          patient_id: string
          patient_name: string
          phone: string
          previous_treatment: string
          reproductive_history: string
          sleep: string
          status: string
          submitted_at: string | null
          surgical_history: string
          thirst: string
          updated_at: string
        }
        Insert: {
          age?: string
          allergies?: string
          appetite?: string
          appointment_id?: string | null
          attachments?: Json
          chief_complaint?: string
          child_behaviour?: string
          child_birth_history?: string
          child_development?: string
          child_vaccination?: string
          complaint_duration?: string
          created_at?: string
          current_medicines?: string
          current_symptoms?: string
          daily_routine?: string
          digestion?: string
          emotional_state?: string
          family_history?: string
          gender?: string
          health_consent_at?: string | null
          health_consent_receipt_id?: string | null
          health_notice_version?: string | null
          id?: string
          lifestyle?: string
          menstrual_history?: string
          mental_health_notes?: string
          occupation?: string
          past_medical_history?: string
          patient_id: string
          patient_name?: string
          phone?: string
          previous_treatment?: string
          reproductive_history?: string
          sleep?: string
          status?: string
          submitted_at?: string | null
          surgical_history?: string
          thirst?: string
          updated_at?: string
        }
        Update: {
          age?: string
          allergies?: string
          appetite?: string
          appointment_id?: string | null
          attachments?: Json
          chief_complaint?: string
          child_behaviour?: string
          child_birth_history?: string
          child_development?: string
          child_vaccination?: string
          complaint_duration?: string
          created_at?: string
          current_medicines?: string
          current_symptoms?: string
          daily_routine?: string
          digestion?: string
          emotional_state?: string
          family_history?: string
          gender?: string
          health_consent_at?: string | null
          health_consent_receipt_id?: string | null
          health_notice_version?: string | null
          id?: string
          lifestyle?: string
          menstrual_history?: string
          mental_health_notes?: string
          occupation?: string
          past_medical_history?: string
          patient_id?: string
          patient_name?: string
          phone?: string
          previous_treatment?: string
          reproductive_history?: string
          sleep?: string
          status?: string
          submitted_at?: string | null
          surgical_history?: string
          thirst?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_requests: {
        Row: {
          created_at: string
          payload: Json
          request_id: string
          result: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          payload: Json
          request_id: string
          result?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          payload?: Json
          request_id?: string
          result?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      clinical_assignments: {
        Row: {
          assigned_by: string
          created_at: string
          doctor_id: string
          id: string
          patient_id: string
        }
        Insert: {
          assigned_by?: string
          created_at?: string
          doctor_id: string
          id?: string
          patient_id: string
        }
        Update: {
          assigned_by?: string
          created_at?: string
          doctor_id?: string
          id?: string
          patient_id?: string
        }
        Relationships: []
      }
      external_deletion_requests: {
        Row: {
          contact: string
          created_at: string
          id: string
          rate_key: string
          scope: string
          state: string
        }
        Insert: {
          contact: string
          created_at?: string
          id?: string
          rate_key: string
          scope: string
          state?: string
        }
        Update: {
          contact?: string
          created_at?: string
          id?: string
          rate_key?: string
          scope?: string
          state?: string
        }
        Relationships: []
      }
      gateway_initiations: {
        Row: {
          created_at: string
          kind: string
          payment_id: string | null
          resource_id: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          kind: string
          payment_id?: string | null
          resource_id: string
          token?: string
          user_id: string
        }
        Update: {
          created_at?: string
          kind?: string
          payment_id?: string | null
          resource_id?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      health_consent_receipts: {
        Row: {
          accepted_at: string
          consumed_at: string | null
          id: string
          notice_version: string
          purpose: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          consumed_at?: string | null
          id?: string
          notice_version: string
          purpose: string
          user_id: string
        }
        Update: {
          accepted_at?: string
          consumed_at?: string | null
          id?: string
          notice_version?: string
          purpose?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          line_total: number
          name: string
          order_id: string
          pack: string
          price: number
          product_id: string | null
          qty: number
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          line_total?: number
          name: string
          order_id: string
          pack?: string
          price?: number
          product_id?: string | null
          qty?: number
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          line_total?: number
          name?: string
          order_id?: string
          pack?: string
          price?: number
          product_id?: string | null
          qty?: number
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          city: string
          coupon: string | null
          created_at: string
          customer_name: string
          delivery_fee: number
          discount: number
          email: string
          id: string
          notes: string | null
          order_no: string
          payment_method: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string
          pincode: string
          state: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          tracking_note: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          city: string
          coupon?: string | null
          created_at?: string
          customer_name: string
          delivery_fee?: number
          discount?: number
          email?: string
          id?: string
          notes?: string | null
          order_no?: string
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone: string
          pincode: string
          state: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          tracking_note?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          city?: string
          coupon?: string | null
          created_at?: string
          customer_name?: string
          delivery_fee?: number
          discount?: number
          email?: string
          id?: string
          notes?: string | null
          order_no?: string
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string
          pincode?: string
          state?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          tracking_note?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string | null
          attempt: number
          created_at: string
          failure_reason: string | null
          gateway: string | null
          gateway_order_id: string | null
          gateway_payment_id: string | null
          id: string
          kind: string
          method: string
          notes: string | null
          order_id: string | null
          payer_name: string
          receipt_no: string
          recorded_by: string | null
          refund_amount: number
          refund_note: string | null
          refund_status: string
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          attempt?: number
          created_at?: string
          failure_reason?: string | null
          gateway?: string | null
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          id?: string
          kind?: string
          method?: string
          notes?: string | null
          order_id?: string | null
          payer_name?: string
          receipt_no?: string
          recorded_by?: string | null
          refund_amount?: number
          refund_note?: string | null
          refund_status?: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          attempt?: number
          created_at?: string
          failure_reason?: string | null
          gateway?: string | null
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          id?: string
          kind?: string
          method?: string
          notes?: string | null
          order_id?: string | null
          payer_name?: string
          receipt_no?: string
          recorded_by?: string | null
          refund_amount?: number
          refund_note?: string | null
          refund_status?: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_audit: {
        Row: {
          action: string
          actor_id: string | null
          changed_fields: string[]
          created_at: string
          id: string
          patient_id: string
          prescription_id: string
          snapshot: Json
          version: number
        }
        Insert: {
          action: string
          actor_id?: string | null
          changed_fields?: string[]
          created_at?: string
          id?: string
          patient_id: string
          prescription_id: string
          snapshot?: Json
          version?: number
        }
        Update: {
          action?: string
          actor_id?: string | null
          changed_fields?: string[]
          created_at?: string
          id?: string
          patient_id?: string
          prescription_id?: string
          snapshot?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "prescription_audit_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          advice: string | null
          appointment_id: string | null
          consultation_mode:
            | Database["public"]["Enums"]["consultation_mode"]
            | null
          created_at: string
          diagnosis: string
          diet_advice: string | null
          doctor_id: string | null
          doctor_name: string
          doctor_qualification: string
          doctor_registration_no: string
          follow_up_date: string | null
          general_care: string | null
          id: string
          medicines: Json
          patient_id: string
          prescription_no: string
          signature_code: string | null
          signed_at: string | null
          updated_at: string
          version: number
        }
        Insert: {
          advice?: string | null
          appointment_id?: string | null
          consultation_mode?:
            | Database["public"]["Enums"]["consultation_mode"]
            | null
          created_at?: string
          diagnosis?: string
          diet_advice?: string | null
          doctor_id?: string | null
          doctor_name?: string
          doctor_qualification?: string
          doctor_registration_no?: string
          follow_up_date?: string | null
          general_care?: string | null
          id?: string
          medicines?: Json
          patient_id: string
          prescription_no?: string
          signature_code?: string | null
          signed_at?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          advice?: string | null
          appointment_id?: string | null
          consultation_mode?:
            | Database["public"]["Enums"]["consultation_mode"]
            | null
          created_at?: string
          diagnosis?: string
          diet_advice?: string | null
          doctor_id?: string | null
          doctor_name?: string
          doctor_qualification?: string
          doctor_registration_no?: string
          follow_up_date?: string | null
          general_care?: string | null
          id?: string
          medicines?: Json
          patient_id?: string
          prescription_no?: string
          signature_code?: string | null
          signed_at?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string
          category: string
          created_at: string
          description: string
          id: string
          ingredients: string
          is_active: boolean
          mrp: number
          name: string
          pack: string
          price: number
          rating: number
          reviews: number
          slug: string
          stock: number
          updated_at: string
          usage_instructions: string
        }
        Insert: {
          brand?: string
          category: string
          created_at?: string
          description?: string
          id?: string
          ingredients?: string
          is_active?: boolean
          mrp?: number
          name: string
          pack?: string
          price?: number
          rating?: number
          reviews?: number
          slug: string
          stock?: number
          updated_at?: string
          usage_instructions?: string
        }
        Update: {
          brand?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          ingredients?: string
          is_active?: boolean
          mrp?: number
          name?: string
          pack?: string
          price?: number
          rating?: number
          reviews?: number
          slug?: string
          stock?: number
          updated_at?: string
          usage_instructions?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string
          gender: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          gender?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          cod_enabled: boolean
          cod_max_order: number
          cod_min_order: number
          delivery_fee: number
          free_delivery_over: number
          id: string
          online_payment_enabled: boolean
          updated_at: string
          upi_enabled: boolean
        }
        Insert: {
          cod_enabled?: boolean
          cod_max_order?: number
          cod_min_order?: number
          delivery_fee?: number
          free_delivery_over?: number
          id?: string
          online_payment_enabled?: boolean
          updated_at?: string
          upi_enabled?: boolean
        }
        Update: {
          cod_enabled?: boolean
          cod_max_order?: number
          cod_min_order?: number
          delivery_fee?: number
          free_delivery_over?: number
          id?: string
          online_payment_enabled?: boolean
          updated_at?: string
          upi_enabled?: boolean
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_clinical_patient: {
        Args: { _doctor: string; _patient: string }
        Returns: undefined
      }
      book_patient_appointment: { Args: { payload: Json }; Returns: string }
      can_access_patient: { Args: { _patient: string }; Returns: boolean }
      cancel_patient_appointment: {
        Args: { _appointment: string }
        Returns: undefined
      }
      claim_account_deletion: { Args: { _request: string }; Returns: Json }
      claim_gateway_initiation: {
        Args: { _kind: string; _resource: string; _user: string }
        Returns: string
      }
      create_idempotent_order: {
        Args: { _request: string; payload: Json }
        Returns: Json
      }
      create_trusted_order: { Args: { payload: Json }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      purge_eligible_account_data: {
        Args: { _request: string; _token: string }
        Returns: undefined
      }
      record_counter_payment: { Args: { payload: Json }; Returns: string }
      review_manual_payment: {
        Args: { _payment: string; payload: Json }
        Returns: undefined
      }
      settle_gateway_payment: {
        Args: {
          _amount: number
          _gateway_order: string
          _gateway_payment: string
          _method: string
          _payment: string
          _user: string
        }
        Returns: undefined
      }
      submit_patient_payment: { Args: { payload: Json }; Returns: string }
    }
    Enums: {
      app_role: "patient" | "doctor" | "admin"
      appointment_status: "pending" | "confirmed" | "completed" | "cancelled"
      consultation_mode: "clinic" | "video" | "audio"
      order_status:
        | "placed"
        | "confirmed"
        | "packed"
        | "shipped"
        | "delivered"
        | "cancelled"
      payment_status: "pending" | "paid" | "refunded" | "failed"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["patient", "doctor", "admin"],
      appointment_status: ["pending", "confirmed", "completed", "cancelled"],
      consultation_mode: ["clinic", "video", "audio"],
      order_status: [
        "placed",
        "confirmed",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
      ],
      payment_status: ["pending", "paid", "refunded", "failed"],
    },
  },
} as const

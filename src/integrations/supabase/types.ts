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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          allergies: string | null
          appointment_date: string
          concern: string
          created_at: string
          current_medication: string | null
          date_of_birth: string | null
          doctor_notes: string | null
          email: string | null
          fee: number
          gender: string | null
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
          created_at?: string
          current_medication?: string | null
          date_of_birth?: string | null
          doctor_notes?: string | null
          email?: string | null
          fee?: number
          gender?: string | null
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
          created_at?: string
          current_medication?: string | null
          date_of_birth?: string | null
          doctor_notes?: string | null
          email?: string | null
          fee?: number
          gender?: string | null
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
      prescriptions: {
        Row: {
          advice: string | null
          appointment_id: string | null
          created_at: string
          diagnosis: string
          doctor_id: string | null
          follow_up_date: string | null
          id: string
          medicines: Json
          patient_id: string
          prescription_no: string
          updated_at: string
        }
        Insert: {
          advice?: string | null
          appointment_id?: string | null
          created_at?: string
          diagnosis?: string
          doctor_id?: string | null
          follow_up_date?: string | null
          id?: string
          medicines?: Json
          patient_id: string
          prescription_no?: string
          updated_at?: string
        }
        Update: {
          advice?: string | null
          appointment_id?: string | null
          created_at?: string
          diagnosis?: string
          doctor_id?: string | null
          follow_up_date?: string | null
          id?: string
          medicines?: Json
          patient_id?: string
          prescription_no?: string
          updated_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
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

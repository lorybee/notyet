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
      compensation_data: {
        Row: {
          anonymous_id: string
          city: string
          company_size: Database["public"]["Enums"]["company_size_enum"]
          contract_type:
            | Database["public"]["Enums"]["contract_type_enum"]
            | null
          country: string
          created_at: string
          experience_level: Database["public"]["Enums"]["experience_level_enum"]
          gross_salary: number
          has_health_insurance: boolean | null
          has_life_insurance: boolean | null
          has_meal_vouchers: boolean | null
          id: string
          industry: string
          job_title: string
          meal_vouchers_value: number | null
          net_salary: number
          paid_leave_days: number | null
          schedule: Database["public"]["Enums"]["schedule_enum"] | null
          tenure_years: number | null
          work_model: Database["public"]["Enums"]["work_model_enum"] | null
        }
        Insert: {
          anonymous_id?: string
          city: string
          company_size: Database["public"]["Enums"]["company_size_enum"]
          contract_type?:
            | Database["public"]["Enums"]["contract_type_enum"]
            | null
          country?: string
          created_at?: string
          experience_level: Database["public"]["Enums"]["experience_level_enum"]
          gross_salary: number
          has_health_insurance?: boolean | null
          has_life_insurance?: boolean | null
          has_meal_vouchers?: boolean | null
          id?: string
          industry: string
          job_title: string
          meal_vouchers_value?: number | null
          net_salary: number
          paid_leave_days?: number | null
          schedule?: Database["public"]["Enums"]["schedule_enum"] | null
          tenure_years?: number | null
          work_model?: Database["public"]["Enums"]["work_model_enum"] | null
        }
        Update: {
          anonymous_id?: string
          city?: string
          company_size?: Database["public"]["Enums"]["company_size_enum"]
          contract_type?:
            | Database["public"]["Enums"]["contract_type_enum"]
            | null
          country?: string
          created_at?: string
          experience_level?: Database["public"]["Enums"]["experience_level_enum"]
          gross_salary?: number
          has_health_insurance?: boolean | null
          has_life_insurance?: boolean | null
          has_meal_vouchers?: boolean | null
          id?: string
          industry?: string
          job_title?: string
          meal_vouchers_value?: number | null
          net_salary?: number
          paid_leave_days?: number | null
          schedule?: Database["public"]["Enums"]["schedule_enum"] | null
          tenure_years?: number | null
          work_model?: Database["public"]["Enums"]["work_model_enum"] | null
        }
        Relationships: []
      }
      inflation_data: {
        Row: {
          country: string
          cpi_index: number
          created_at: string
          cumulative_inflation: number | null
          id: string
          month: number
          year: number
        }
        Insert: {
          country?: string
          cpi_index: number
          created_at?: string
          cumulative_inflation?: number | null
          id?: string
          month: number
          year: number
        }
        Update: {
          country?: string
          cpi_index?: number
          created_at?: string
          cumulative_inflation?: number | null
          id?: string
          month?: number
          year?: number
        }
        Relationships: []
      }
      legislation_articles: {
        Row: {
          answer: string
          category: string
          created_at: string
          id: string
          legal_reference: string | null
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category: string
          created_at?: string
          id?: string
          legal_reference?: string | null
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          id?: string
          legal_reference?: string | null
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          anonymous_compensation_id: string | null
          city: string | null
          created_at: string
          display_name: string | null
          id: string
          industry: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          anonymous_compensation_id?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          industry?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          anonymous_compensation_id?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          industry?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          first_request_at: string
          id: string
          ip_address: string
          last_request_at: string
          request_count: number
        }
        Insert: {
          created_at?: string
          endpoint: string
          first_request_at?: string
          id?: string
          ip_address: string
          last_request_at?: string
          request_count?: number
        }
        Update: {
          created_at?: string
          endpoint?: string
          first_request_at?: string
          id?: string
          ip_address?: string
          last_request_at?: string
          request_count?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      get_anonymous_id_for_user: {
        Args: { user_uuid: string }
        Returns: string
      }
    }
    Enums: {
      company_size_enum: "1-10" | "11-50" | "51-200" | "201-500" | "500+"
      contract_type_enum: "Full-time" | "Part-time" | "Contract" | "Freelance"
      experience_level_enum:
        | "Entry Level (0-2 years)"
        | "Junior (2-5 years)"
        | "Mid-Level (5-10 years)"
        | "Senior (10+ years)"
      schedule_enum: "8 hours/day" | "Flexible" | "Shift work"
      work_model_enum: "Remote" | "Hybrid" | "On-site"
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
      company_size_enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
      contract_type_enum: ["Full-time", "Part-time", "Contract", "Freelance"],
      experience_level_enum: [
        "Entry Level (0-2 years)",
        "Junior (2-5 years)",
        "Mid-Level (5-10 years)",
        "Senior (10+ years)",
      ],
      schedule_enum: ["8 hours/day", "Flexible", "Shift work"],
      work_model_enum: ["Remote", "Hybrid", "On-site"],
    },
  },
} as const

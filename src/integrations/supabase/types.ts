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
      benchmark_data: {
        Row: {
          avg_benefits_value: number | null
          avg_gross_salary: number
          avg_net_salary: number
          city: string
          company_size: string
          country: string
          created_at: string
          experience_level: string
          id: string
          industry: string
          p25_total_rewards: number | null
          p50_total_rewards: number | null
          p75_total_rewards: number | null
          sample_size: number | null
          updated_at: string
        }
        Insert: {
          avg_benefits_value?: number | null
          avg_gross_salary: number
          avg_net_salary: number
          city: string
          company_size: string
          country?: string
          created_at?: string
          experience_level: string
          id?: string
          industry: string
          p25_total_rewards?: number | null
          p50_total_rewards?: number | null
          p75_total_rewards?: number | null
          sample_size?: number | null
          updated_at?: string
        }
        Update: {
          avg_benefits_value?: number | null
          avg_gross_salary?: number
          avg_net_salary?: number
          city?: string
          company_size?: string
          country?: string
          created_at?: string
          experience_level?: string
          id?: string
          industry?: string
          p25_total_rewards?: number | null
          p50_total_rewards?: number | null
          p75_total_rewards?: number | null
          sample_size?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      compensation_data: {
        Row: {
          anonymous_id: string
          city: string
          company_size: string
          contract_type: string | null
          country: string
          created_at: string
          experience_level: string
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
          schedule: string | null
          tenure_years: number | null
          work_model: string | null
        }
        Insert: {
          anonymous_id?: string
          city: string
          company_size: string
          contract_type?: string | null
          country?: string
          created_at?: string
          experience_level: string
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
          schedule?: string | null
          tenure_years?: number | null
          work_model?: string | null
        }
        Update: {
          anonymous_id?: string
          city?: string
          company_size?: string
          contract_type?: string | null
          country?: string
          created_at?: string
          experience_level?: string
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
          schedule?: string | null
          tenure_years?: number | null
          work_model?: string | null
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
          city: string | null
          created_at: string
          id: string
          industry: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applied_at: string
          company: string
          created_at: string
          id: string
          job_url: string | null
          location: string | null
          notes: string | null
          role_title: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string
          company: string
          created_at?: string
          id?: string
          job_url?: string | null
          location?: string | null
          notes?: string | null
          role_title: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string
          company?: string
          created_at?: string
          id?: string
          job_url?: string | null
          location?: string | null
          notes?: string | null
          role_title?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      career_goals: {
        Row: {
          created_at: string
          id: string
          target_industry: string | null
          target_role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_industry?: string | null
          target_role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          target_industry?: string | null
          target_role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_role: string | null
          degree: string | null
          education_level: string | null
          first_name: string | null
          graduation_year: number | null
          id: string
          last_name: string | null
          onboarding_completed: boolean
          university: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_role?: string | null
          degree?: string | null
          education_level?: string | null
          first_name?: string | null
          graduation_year?: number | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean
          university?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_role?: string | null
          degree?: string | null
          education_level?: string | null
          first_name?: string | null
          graduation_year?: number | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean
          university?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resume_analyses: {
        Row: {
          ats_score: number
          career_match: number
          created_at: string
          detected_skills: Json
          id: string
          recommendations: Json
          resume_id: string | null
          resume_score: number
          role_matches: Json
          strengths: Json
          summary: string | null
          user_id: string
          weaknesses: Json
        }
        Insert: {
          ats_score?: number
          career_match?: number
          created_at?: string
          detected_skills?: Json
          id?: string
          recommendations?: Json
          resume_id?: string | null
          resume_score?: number
          role_matches?: Json
          strengths?: Json
          summary?: string | null
          user_id: string
          weaknesses?: Json
        }
        Update: {
          ats_score?: number
          career_match?: number
          created_at?: string
          detected_skills?: Json
          id?: string
          recommendations?: Json
          resume_id?: string | null
          resume_score?: number
          role_matches?: Json
          strengths?: Json
          summary?: string | null
          user_id?: string
          weaknesses?: Json
        }
        Relationships: [
          {
            foreignKeyName: "resume_analyses_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          content_text: string | null
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_text?: string | null
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_text?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      roadmap_milestones: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          label: string
          position: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          label: string
          position?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          label?: string
          position?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      roadmap_stages: {
        Row: {
          completed: boolean
          courses: Json
          created_at: string
          description: string | null
          id: string
          position: number
          project: string | null
          skills: Json
          timeframe: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          courses?: Json
          created_at?: string
          description?: string | null
          id?: string
          position?: number
          project?: string | null
          skills?: Json
          timeframe?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          courses?: Json
          created_at?: string
          description?: string | null
          id?: string
          position?: number
          project?: string | null
          skills?: Json
          timeframe?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          created_at: string
          id: string
          proficiency: number
          skill_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          proficiency?: number
          skill_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          proficiency?: number
          skill_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
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

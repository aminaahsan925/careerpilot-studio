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
          interview_at: string | null
          job_url: string | null
          location: string | null
          notes: string | null
          outcome: string | null
          outcome_recorded_at: string | null
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
          interview_at?: string | null
          job_url?: string | null
          location?: string | null
          notes?: string | null
          outcome?: string | null
          outcome_recorded_at?: string | null
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
          interview_at?: string | null
          job_url?: string | null
          location?: string | null
          notes?: string | null
          outcome?: string | null
          outcome_recorded_at?: string | null
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
      career_recommendations: {
        Row: {
          already_have: Json
          created_at: string
          example_titles: Json
          fit_note: string | null
          id: string
          need_to_build: Json
          position: number
          required_skills: Json
          role: string
          selected: boolean
          user_id: string
          why_fit: string | null
        }
        Insert: {
          already_have?: Json
          created_at?: string
          example_titles?: Json
          fit_note?: string | null
          id?: string
          need_to_build?: Json
          position?: number
          required_skills?: Json
          role: string
          selected?: boolean
          user_id: string
          why_fit?: string | null
        }
        Update: {
          already_have?: Json
          created_at?: string
          example_titles?: Json
          fit_note?: string | null
          id?: string
          need_to_build?: Json
          position?: number
          required_skills?: Json
          role?: string
          selected?: boolean
          user_id?: string
          why_fit?: string | null
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
      readiness_snapshots: {
        Row: {
          blockers: Json
          breakdown: Json
          created_at: string
          id: string
          method_version: string
          next_action: string | null
          overall: number
          stage: string | null
          target_job_id: string | null
          target_role: string | null
          user_id: string
        }
        Insert: {
          blockers?: Json
          breakdown?: Json
          created_at?: string
          id?: string
          method_version?: string
          next_action?: string | null
          overall?: number
          stage?: string | null
          target_job_id?: string | null
          target_role?: string | null
          user_id: string
        }
        Update: {
          blockers?: Json
          breakdown?: Json
          created_at?: string
          id?: string
          method_version?: string
          next_action?: string | null
          overall?: number
          stage?: string | null
          target_job_id?: string | null
          target_role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "readiness_snapshots_target_job_id_fkey"
            columns: ["target_job_id"]
            isOneToOne: false
            referencedRelation: "target_jobs"
            referencedColumns: ["id"]
          },
        ]
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
          evidence_created: string | null
          id: string
          outcome: string | null
          position: number
          project: string | null
          skills: Json
          timeframe: string | null
          title: string
          updated_at: string
          user_id: string
          why: string | null
        }
        Insert: {
          completed?: boolean
          courses?: Json
          created_at?: string
          description?: string | null
          evidence_created?: string | null
          id?: string
          outcome?: string | null
          position?: number
          project?: string | null
          skills?: Json
          timeframe?: string | null
          title: string
          updated_at?: string
          user_id: string
          why?: string | null
        }
        Update: {
          completed?: boolean
          courses?: Json
          created_at?: string
          description?: string | null
          evidence_created?: string | null
          id?: string
          outcome?: string | null
          position?: number
          project?: string | null
          skills?: Json
          timeframe?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          why?: string | null
        }
        Relationships: []
      }
      skill_evidence: {
        Row: {
          created_at: string
          detail: string | null
          id: string
          skill_name: string
          source: string
          strength: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          id?: string
          skill_name: string
          source?: string
          strength?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          id?: string
          skill_name?: string
          source?: string
          strength?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      skill_gaps: {
        Row: {
          action: string | null
          created_at: string
          evidence: string | null
          id: string
          position: number
          priority: string
          proof_task: string | null
          required_level: string | null
          skill: string
          status: string
          target_job_id: string | null
          updated_at: string
          user_id: string
          why_it_matters: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string
          evidence?: string | null
          id?: string
          position?: number
          priority?: string
          proof_task?: string | null
          required_level?: string | null
          skill: string
          status?: string
          target_job_id?: string | null
          updated_at?: string
          user_id: string
          why_it_matters?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string
          evidence?: string | null
          id?: string
          position?: number
          priority?: string
          proof_task?: string | null
          required_level?: string | null
          skill?: string
          status?: string
          target_job_id?: string | null
          updated_at?: string
          user_id?: string
          why_it_matters?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_gaps_target_job_id_fkey"
            columns: ["target_job_id"]
            isOneToOne: false
            referencedRelation: "target_jobs"
            referencedColumns: ["id"]
          },
        ]
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
      target_jobs: {
        Row: {
          company: string | null
          created_at: string
          description: string
          id: string
          is_active: boolean
          parsed: Json
          source_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          parsed?: Json
          source_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          parsed?: Json
          source_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
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
      weekly_goals: {
        Row: {
          completed: boolean
          created_at: string
          detail: string | null
          evidence_created: string | null
          id: string
          linked_skill: string | null
          position: number
          title: string
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          detail?: string | null
          evidence_created?: string | null
          id?: string
          linked_skill?: string | null
          position?: number
          title: string
          updated_at?: string
          user_id: string
          week_start?: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          detail?: string | null
          evidence_created?: string | null
          id?: string
          linked_skill?: string | null
          position?: number
          title?: string
          updated_at?: string
          user_id?: string
          week_start?: string
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

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
      badges: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          name: string
          required_points: number
          sort_order: number
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          required_points: number
          sort_order?: number
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          required_points?: number
          sort_order?: number
        }
        Relationships: []
      }
      course_invites: {
        Row: {
          accepted_at: string | null
          course_id: string
          id: string
          invited_at: string
          invited_by: string | null
          invited_email: string
          status: Database["public"]["Enums"]["invite_status"]
        }
        Insert: {
          accepted_at?: string | null
          course_id: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          invited_email: string
          status?: Database["public"]["Enums"]["invite_status"]
        }
        Update: {
          accepted_at?: string | null
          course_id?: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          invited_email?: string
          status?: Database["public"]["Enums"]["invite_status"]
        }
        Relationships: [
          {
            foreignKeyName: "course_invites_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          access_rule: Database["public"]["Enums"]["course_access_rule"]
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          instructor_id: string | null
          is_published: boolean
          price: number | null
          published_at: string | null
          responsible_id: string | null
          short_description: string | null
          tags: string[] | null
          title: string
          total_duration: number | null
          updated_at: string
          views_count: number
          visibility: Database["public"]["Enums"]["course_visibility"]
          website_url: string | null
        }
        Insert: {
          access_rule?: Database["public"]["Enums"]["course_access_rule"]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          instructor_id?: string | null
          is_published?: boolean
          price?: number | null
          published_at?: string | null
          responsible_id?: string | null
          short_description?: string | null
          tags?: string[] | null
          title: string
          total_duration?: number | null
          updated_at?: string
          views_count?: number
          visibility?: Database["public"]["Enums"]["course_visibility"]
          website_url?: string | null
        }
        Update: {
          access_rule?: Database["public"]["Enums"]["course_access_rule"]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          instructor_id?: string | null
          is_published?: boolean
          price?: number | null
          published_at?: string | null
          responsible_id?: string | null
          short_description?: string | null
          tags?: string[] | null
          title?: string
          total_duration?: number | null
          updated_at?: string
          views_count?: number
          visibility?: Database["public"]["Enums"]["course_visibility"]
          website_url?: string | null
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          started_at: string | null
          status: Database["public"]["Enums"]["enrollment_status"]
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_attachments: {
        Row: {
          attachment_type: string | null
          created_at: string
          external_url: string | null
          file_url: string | null
          id: string
          lesson_id: string
          title: string
        }
        Insert: {
          attachment_type?: string | null
          created_at?: string
          external_url?: string | null
          file_url?: string | null
          id?: string
          lesson_id: string
          title: string
        }
        Update: {
          attachment_type?: string | null
          created_at?: string
          external_url?: string | null
          file_url?: string | null
          id?: string
          lesson_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_attachments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          id: string
          is_completed: boolean
          lesson_id: string
          progress_percentage: number | null
          started_at: string
          time_spent: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          is_completed?: boolean
          lesson_id: string
          progress_percentage?: number | null
          started_at?: string
          time_spent?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          is_completed?: boolean
          lesson_id?: string
          progress_percentage?: number | null
          started_at?: string
          time_spent?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          allow_download: boolean | null
          content_url: string | null
          course_id: string
          created_at: string
          description: string | null
          duration: number | null
          id: string
          lesson_type: Database["public"]["Enums"]["lesson_type"]
          responsible_id: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          allow_download?: boolean | null
          content_url?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          lesson_type?: Database["public"]["Enums"]["lesson_type"]
          responsible_id?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          allow_download?: boolean | null
          content_url?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          lesson_type?: Database["public"]["Enums"]["lesson_type"]
          responsible_id?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_attempt_answers: {
        Row: {
          answered_at: string
          attempt_id: string
          id: string
          is_correct: boolean
          question_id: string
          selected_option_id: string | null
        }
        Insert: {
          answered_at?: string
          attempt_id: string
          id?: string
          is_correct?: boolean
          question_id: string
          selected_option_id?: string | null
        }
        Update: {
          answered_at?: string
          attempt_id?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_option_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempt_answers_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "quiz_options"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          attempt_number: number
          completed_at: string | null
          correct_answers: number | null
          id: string
          is_completed: boolean
          points_earned: number | null
          quiz_id: string
          score: number | null
          started_at: string
          total_questions: number | null
          user_id: string
        }
        Insert: {
          attempt_number?: number
          completed_at?: string | null
          correct_answers?: number | null
          id?: string
          is_completed?: boolean
          points_earned?: number | null
          quiz_id: string
          score?: number | null
          started_at?: string
          total_questions?: number | null
          user_id: string
        }
        Update: {
          attempt_number?: number
          completed_at?: string | null
          correct_answers?: number | null
          id?: string
          is_completed?: boolean
          points_earned?: number | null
          quiz_id?: string
          score?: number | null
          started_at?: string
          total_questions?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_options: {
        Row: {
          id: string
          is_correct: boolean
          option_text: string
          question_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_correct?: boolean
          option_text: string
          question_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_correct?: boolean
          option_text?: string
          question_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          created_at: string
          id: string
          question_text: string
          quiz_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          question_text: string
          quiz_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          question_text?: string
          quiz_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          first_try_points: number | null
          fourth_plus_try_points: number | null
          id: string
          second_try_points: number | null
          third_try_points: number | null
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          first_try_points?: number | null
          fourth_plus_try_points?: number | null
          id?: string
          second_try_points?: number | null
          third_try_points?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          first_try_points?: number | null
          fourth_plus_try_points?: number | null
          id?: string
          second_try_points?: number | null
          third_try_points?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          course_id: string
          created_at: string
          id: string
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          awarded_at: string
          badge_id: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_id: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points: {
        Row: {
          id: string
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_course: { Args: { _course_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_course_instructor: { Args: { _course_id: string }; Returns: boolean }
      is_enrolled: { Args: { _course_id: string }; Returns: boolean }
    }
    Enums: {
      course_access_rule: "open" | "invitation" | "payment"
      course_visibility: "everyone" | "signed_in"
      enrollment_status: "active" | "completed" | "cancelled"
      invite_status: "pending" | "accepted" | "rejected" | "expired"
      lesson_type: "video" | "document" | "image" | "quiz"
      user_role: "admin" | "instructor" | "learner"
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
      course_access_rule: ["open", "invitation", "payment"],
      course_visibility: ["everyone", "signed_in"],
      enrollment_status: ["active", "completed", "cancelled"],
      invite_status: ["pending", "accepted", "rejected", "expired"],
      lesson_type: ["video", "document", "image", "quiz"],
      user_role: ["admin", "instructor", "learner"],
    },
  },
} as const

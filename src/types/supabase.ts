
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          display_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          display_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          display_name?: string | null
          created_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          title: string
          questions: Json
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          title: string
          questions: Json
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          questions?: Json
          created_at?: string
          created_by?: string | null
        }
      }
      quiz_attempts: {
        Row: {
          id: string
          quiz_id: string
          user_id: string | null
          user_answers: Json
          result: Json
          created_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          user_id?: string | null
          user_answers: Json
          result: Json
          created_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          user_id?: string | null
          user_answers?: Json
          result?: Json
          created_at?: string
        }
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
  }
}

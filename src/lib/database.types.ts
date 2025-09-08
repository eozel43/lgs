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
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          color: string
          order_index: number
          created_at: string
        }
        Insert: {
          id: string
          name: string
          color?: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          order_index?: number
          created_at?: string
        }
      }
      daily_entries: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      subject_entries: {
        Row: {
          id: string
          daily_entry_id: string
          subject_id: string
          total_questions: number
          correct_answers: number
          wrong_answers: number
          blank_answers: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          daily_entry_id: string
          subject_id: string
          total_questions?: number
          correct_answers?: number
          wrong_answers?: number
          blank_answers?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          daily_entry_id?: string
          subject_id?: string
          total_questions?: number
          correct_answers?: number
          wrong_answers?: number
          blank_answers?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
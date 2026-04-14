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
      funnel_blocks: {
        Row: {
          content: Json | null
          created_at: string
          funnel_id: string
          id: string
          next_block_id: string | null
          position_x: number | null
          position_y: number | null
          sort_order: number | null
          type: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          funnel_id: string
          id?: string
          next_block_id?: string | null
          position_x?: number | null
          position_y?: number | null
          sort_order?: number | null
          type: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          funnel_id?: string
          id?: string
          next_block_id?: string | null
          position_x?: number | null
          position_y?: number | null
          sort_order?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "funnel_blocks_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funnel_blocks_next_block_id_fkey"
            columns: ["next_block_id"]
            isOneToOne: false
            referencedRelation: "funnel_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_visits: {
        Row: {
          clicks: Json | null
          completed: boolean | null
          created_at: string
          funnel_id: string
          id: string
          step_reached: number | null
          visitor_id: string | null
        }
        Insert: {
          clicks?: Json | null
          completed?: boolean | null
          created_at?: string
          funnel_id: string
          id?: string
          step_reached?: number | null
          visitor_id?: string | null
        }
        Update: {
          clicks?: Json | null
          completed?: boolean | null
          created_at?: string
          funnel_id?: string
          id?: string
          step_reached?: number | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funnel_visits_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      funnels: {
        Row: {
          attendant_photo_url: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          settings: Json | null
          slug: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attendant_photo_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          settings?: Json | null
          slug: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attendant_photo_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          settings?: Json | null
          slug?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          data: Json | null
          email: string | null
          funnel_id: string
          id: string
          name: string | null
          phone: string | null
          source: string | null
        }
        Insert: {
          created_at?: string
          data?: Json | null
          email?: string | null
          funnel_id: string
          id?: string
          name?: string | null
          phone?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string
          data?: Json | null
          email?: string | null
          funnel_id?: string
          id?: string
          name?: string | null
          phone?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          id: string
          is_online: boolean
          last_seen: string
          user_id: string
        }
        Insert: {
          id?: string
          is_online?: boolean
          last_seen?: string
          user_id: string
        }
        Update: {
          id?: string
          is_online?: boolean
          last_seen?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      admin_get_user_funnels: {
        Args: { _user_id: string }
        Returns: {
          block_count: number
          created_at: string
          id: string
          name: string
          slug: string
          status: string
        }[]
      }
      admin_get_users: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          display_name: string
          email: string
          funnel_count: number
          id: string
          last_sign_in_at: string
          phone: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const

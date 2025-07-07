export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      field_reviews: {
        Row: {
          field_id: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          field_id: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          field_id?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_reviews_field_id_fields_id_fk"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_reviews_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fields: {
        Row: {
          adminedBy: string[]
          avatar_url: string | null
          city: string
          description: string | null
          id: string
          images: string[] | null
          location: unknown | null
          name: string
          neighborhood: string
          owner: string
          price: number
          slot_duration: number
          sports: string[]
          street: string
          street_number: string
        }
        Insert: {
          adminedBy?: string[]
          avatar_url?: string | null
          city: string
          description?: string | null
          id?: string
          images?: string[] | null
          location?: unknown | null
          name: string
          neighborhood: string
          owner: string
          price: number
          slot_duration?: number
          sports: string[]
          street: string
          street_number: string
        }
        Update: {
          adminedBy?: string[]
          avatar_url?: string | null
          city?: string
          description?: string | null
          id?: string
          images?: string[] | null
          location?: unknown | null
          name?: string
          neighborhood?: string
          owner?: string
          price?: number
          slot_duration?: number
          sports?: string[]
          street?: string
          street_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "fields_owner_users_id_fk"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      inscriptions: {
        Row: {
          id: string
          teamId: string | null
          tournamentId: string
        }
        Insert: {
          id?: string
          teamId?: string | null
          tournamentId: string
        }
        Update: {
          id?: string
          teamId?: string | null
          tournamentId?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscriptions_teamId_teams_team_id_fk"
            columns: ["teamId"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "inscriptions_tournamentId_tournaments_id_fk"
            columns: ["tournamentId"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          room_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          room_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_room_id_teams_team_id_fk"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "messages_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mp_oauth_authorization: {
        Row: {
          access_token: string
          expires_in: number
          live_mode: number
          mercado_pago_user_id: string
          processor: string
          public_key: string
          refresh_token: string
          scope: string
          user_id: string
        }
        Insert: {
          access_token: string
          expires_in: number
          live_mode: number
          mercado_pago_user_id: string
          processor: string
          public_key: string
          refresh_token: string
          scope: string
          user_id: string
        }
        Update: {
          access_token?: string
          expires_in?: number
          live_mode?: number
          mercado_pago_user_id?: string
          processor?: string
          public_key?: string
          refresh_token?: string
          scope?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mp_oauth_authorization_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mp_payments: {
        Row: {
          last_updated: string
          net_received_amount: number
          payment_id: number
          reservation_id: string
          status: string
          total_paid_amount: number
          transaction_amount: number
          user_id: string
        }
        Insert: {
          last_updated: string
          net_received_amount: number
          payment_id: number
          reservation_id: string
          status: string
          total_paid_amount: number
          transaction_amount: number
          user_id: string
        }
        Update: {
          last_updated?: string
          net_received_amount?: number
          payment_id?: number
          reservation_id?: string
          status?: string
          total_paid_amount?: number
          transaction_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mp_payments_reservation_id_reservations_id_fk"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mp_payments_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          bookers_count: number
          confirmed: boolean
          date_time: string
          field_id: string
          id: string
          owner_id: string
          payments_ids: number[] | null
          pending_bookers_ids: string[]
          team_id: string | null
        }
        Insert: {
          bookers_count: number
          confirmed?: boolean
          date_time?: string
          field_id: string
          id?: string
          owner_id: string
          payments_ids?: number[] | null
          pending_bookers_ids: string[]
          team_id?: string | null
        }
        Update: {
          bookers_count?: number
          confirmed?: boolean
          date_time?: string
          field_id?: string
          id?: string
          owner_id?: string
          payments_ids?: number[] | null
          pending_bookers_ids?: string[]
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_field_id_fields_id_fk"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_owner_id_users_id_fk"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_team_id_teams_team_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      sports: {
        Row: {
          name: string
        }
        Insert: {
          name: string
        }
        Update: {
          name?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          admins: string[]
          contactEmail: string
          contactPhone: string
          description: string | null
          images: string[] | null
          isPublic: boolean
          name: string
          playerRequests: string[]
          players: string[]
          sport: string
          team_id: string
        }
        Insert: {
          admins: string[]
          contactEmail: string
          contactPhone: string
          description?: string | null
          images?: string[] | null
          isPublic: boolean
          name: string
          playerRequests: string[]
          players: string[]
          sport: string
          team_id?: string
        }
        Update: {
          admins?: string[]
          contactEmail?: string
          contactPhone?: string
          description?: string | null
          images?: string[] | null
          isPublic?: boolean
          name?: string
          playerRequests?: string[]
          players?: string[]
          sport?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_sport_sports_name_fk"
            columns: ["sport"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["name"]
          },
        ]
      }
      tournaments: {
        Row: {
          active: boolean
          cantPlayers: number
          deadline: string
          description: string | null
          fieldId: string
          id: string
          name: string
          price: number
          sport: string
          startDate: string
        }
        Insert: {
          active?: boolean
          cantPlayers: number
          deadline: string
          description?: string | null
          fieldId: string
          id?: string
          name: string
          price: number
          sport: string
          startDate: string
        }
        Update: {
          active?: boolean
          cantPlayers?: number
          deadline?: string
          description?: string | null
          fieldId?: string
          id?: string
          name?: string
          price?: number
          sport?: string
          startDate?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_fieldId_fields_id_fk"
            columns: ["fieldId"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournaments_sport_sports_name_fk"
            columns: ["sport"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["name"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          email: string
          full_name: string
          id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          email: string
          full_name: string
          id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string
          full_name?: string
          id?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      nearby_fields: {
        Args: { lat: number; long: number; lim: number }
        Returns: {
          id: string
          owner: string
          name: string
          location: unknown
          street_number: string
          street: string
          neighborhood: string
          sports: string[]
          description: string
          city: string
          avatar_url: string
          images: string[]
          price: number
          long: number
          lat: number
          dist_meters: number
        }[]
      }
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

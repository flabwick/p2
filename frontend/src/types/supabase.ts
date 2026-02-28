export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      desks: {
        Row: {
          created_at: string
          feed_state: Json
          id: string
          name: string
          pocket_id: string
        }
        Insert: {
          created_at?: string
          feed_state: Json
          id?: string
          name: string
          pocket_id: string
        }
        Update: {
          created_at?: string
          feed_state?: Json
          id?: string
          name?: string
          pocket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "desks_pocket_id_fkey"
            columns: ["pocket_id"]
            isOneToOne: false
            referencedRelation: "pockets"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          id: string
          name: string
          payload: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          payload?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          payload?: Json | null
        }
        Relationships: []
      }
      feed_operations: {
        Row: {
          applied_at: string
          applied_by: string | null
          feed_id: string
          id: string
          operation_batch: Json
        }
        Insert: {
          applied_at?: string
          applied_by?: string | null
          feed_id: string
          id?: string
          operation_batch: Json
        }
        Update: {
          applied_at?: string
          applied_by?: string | null
          feed_id?: string
          id?: string
          operation_batch?: Json
        }
        Relationships: [
          {
            foreignKeyName: "feed_operations_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "feeds"
            referencedColumns: ["id"]
          },
        ]
      }
      feeds: {
        Row: {
          cards: Json
          created_at: string
          dsl_version: string
          id: string
          pocket_id: string
          role_id: string | null
          updated_at: string
        }
        Insert: {
          cards: Json
          created_at?: string
          dsl_version?: string
          id?: string
          pocket_id: string
          role_id?: string | null
          updated_at?: string
        }
        Update: {
          cards?: Json
          created_at?: string
          dsl_version?: string
          id?: string
          pocket_id?: string
          role_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feeds_pocket_id_fkey"
            columns: ["pocket_id"]
            isOneToOne: true
            referencedRelation: "pockets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feeds_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          mime_type: string | null
          name: string
          size: number | null
          storage_path: string
          updated_at: string
          vault_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          name: string
          size?: number | null
          storage_path: string
          updated_at?: string
          vault_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          name?: string
          size?: number | null
          storage_path?: string
          updated_at?: string
          vault_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      generators: {
        Row: {
          created_at: string
          executive_prompt: string | null
          id: string
          is_active: boolean
          last_run_at: string | null
          name: string
          owner_id: string
          target_folder_id: string | null
          trigger_config: Json | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          executive_prompt?: string | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          name: string
          owner_id: string
          target_folder_id?: string | null
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          executive_prompt?: string | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          name?: string
          owner_id?: string
          target_folder_id?: string | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "generators_target_folder_id_fkey"
            columns: ["target_folder_id"]
            isOneToOne: false
            referencedRelation: "pocket_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      pocket_folders: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pocket_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "pocket_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      pockets: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          folder_id: string | null
          generator_id: string | null
          icon: string | null
          id: string
          is_inbox: boolean
          last_accessed_at: string | null
          name: string
          owner_id: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          folder_id?: string | null
          generator_id?: string | null
          icon?: string | null
          id?: string
          is_inbox?: boolean
          last_accessed_at?: string | null
          name: string
          owner_id: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          folder_id?: string | null
          generator_id?: string | null
          icon?: string | null
          id?: string
          is_inbox?: boolean
          last_accessed_at?: string | null
          name?: string
          owner_id?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_pockets_generator"
            columns: ["generator_id"]
            isOneToOne: false
            referencedRelation: "generators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pockets_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "pocket_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          executive_instructions: string | null
          id: string
          logging_instructions: string | null
          name: string
          owner_id: string
          pocket_id: string | null
          preset: Json | null
          scope: string
          system_prompt: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          executive_instructions?: string | null
          id?: string
          logging_instructions?: string | null
          name: string
          owner_id: string
          pocket_id?: string | null
          preset?: Json | null
          scope?: string
          system_prompt?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          executive_instructions?: string | null
          id?: string
          logging_instructions?: string | null
          name?: string
          owner_id?: string
          pocket_id?: string | null
          preset?: Json | null
          scope?: string
          system_prompt?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_pocket_id_fkey"
            columns: ["pocket_id"]
            isOneToOne: false
            referencedRelation: "pockets"
            referencedColumns: ["id"]
          },
        ]
      }
      vaults: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const


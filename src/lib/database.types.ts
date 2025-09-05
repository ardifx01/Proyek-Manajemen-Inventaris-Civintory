export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      app_users: {
        Row: {
          created_at: string | null
          department: string | null
          full_name: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          full_name: string
          id: string
          role?: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          full_name?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      inventory_moves: {
        Row: {
          created_at: string | null
          created_by: string | null
          dst_partner_id: string | null
          effective_on: string
          id: string
          is_usable: boolean | null
          item_id: string
          mtype: string
          note: string | null
          qty: number
          ref_no: string | null
          src_partner_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          dst_partner_id?: string | null
          effective_on: string
          id: string
          is_usable?: boolean | null
          item_id: string
          mtype: string
          note?: string | null
          qty: number
          ref_no?: string | null
          src_partner_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          dst_partner_id?: string | null
          effective_on?: string
          id?: string
          is_usable?: boolean | null
          item_id?: string
          mtype?: string
          note?: string | null
          qty?: number
          ref_no?: string | null
          src_partner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_moves_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_moves_dst_partner_id_fkey"
            columns: ["dst_partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_moves_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_moves_src_partner_id_fkey"
            columns: ["src_partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          category_id: string | null
          code: string
          condition: string
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          reorder_point: number | null
          track_unusable_separately: boolean | null
          unit_id: string | null
        }
        Insert: {
          category_id?: string | null
          code: string
          condition?: string
          created_at?: string | null
          created_by?: string | null
          id: string
          name: string
          reorder_point?: number | null
          track_unusable_separately?: boolean | null
          unit_id?: string | null
        }
        Update: {
          category_id?: string | null
          code?: string
          condition?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          reorder_point?: number | null
          track_unusable_separately?: boolean | null
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          id: string
          name: string
          ptype: string
        }
        Insert: {
          id: string
          name: string
          ptype: string
        }
        Update: {
          id?: string
          name?: string
          ptype?: string
        }
        Relationships: []
      }
      stock_moves: {
        Row: {
          condition: string | null
          created_at: string | null
          id: string
          item_id: string | null
          quantity: number
          reason: string | null
          type: string
        }
        Insert: {
          condition?: string | null
          created_at?: string | null
          id?: string
          item_id?: string | null
          quantity: number
          reason?: string | null
          type: string
        }
        Update: {
          condition?: string | null
          created_at?: string | null
          id?: string
          item_id?: string | null
          quantity?: number
          reason?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_moves_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          id: string
          name: string
          symbol: string
        }
        Insert: {
          id: string
          name: string
          symbol: string
        }
        Update: {
          id?: string
          name?: string
          symbol?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

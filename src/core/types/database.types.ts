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
      audit_logs: {
        Row: {
          accion: string
          cambios_nuevos: Json | null
          cambios_previos: Json | null
          created_at: string
          entidad: string
          entidad_id: string | null
          id: string
          ip_address: string | null
          negocio_id: string
          user_id: string
        }
        Insert: {
          accion: string
          cambios_nuevos?: Json | null
          cambios_previos?: Json | null
          created_at?: string
          entidad: string
          entidad_id?: string | null
          id?: string
          ip_address?: string | null
          negocio_id: string
          user_id: string
        }
        Update: {
          accion?: string
          cambios_nuevos?: Json | null
          cambios_previos?: Json | null
          created_at?: string
          entidad?: string
          entidad_id?: string | null
          id?: string
          ip_address?: string | null
          negocio_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          icono: string | null
          id: string
          negocio_id: string | null
          nombre: string
          slug: string
        }
        Insert: {
          icono?: string | null
          id?: string
          negocio_id?: string | null
          nombre: string
          slug: string
        }
        Update: {
          icono?: string | null
          id?: string
          negocio_id?: string | null
          nombre?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_categorias_negocio"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          created_at: string
          direccion: string | null
          email: string | null
          id: string
          negocio_id: string
          nombre: string
          notas: string | null
          telefono: string | null
        }
        Insert: {
          created_at?: string
          direccion?: string | null
          email?: string | null
          id?: string
          negocio_id: string
          nombre: string
          notas?: string | null
          telefono?: string | null
        }
        Update: {
          created_at?: string
          direccion?: string | null
          email?: string | null
          id?: string
          negocio_id?: string
          nombre?: string
          notas?: string | null
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_clientes_negocio"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
        ]
      }
      negocios: {
        Row: {
          banner_url: string | null
          color_primary: string | null
          created_at: string | null
          current_period_ends_at: string | null
          descripcion: string | null
          direccion: string | null
          direccion_notas: string | null
          facebook_url: string | null
          horarios: Json | null
          id: string
          instagram_url: string | null
          localidad: string | null
          logo_url: string | null
          nombre: string
          plan_tier: string
          slug: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          tiktok_url: string | null
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          banner_url?: string | null
          color_primary?: string | null
          created_at?: string | null
          current_period_ends_at?: string | null
          descripcion?: string | null
          direccion?: string | null
          direccion_notas?: string | null
          facebook_url?: string | null
          horarios?: Json | null
          id?: string
          instagram_url?: string | null
          localidad?: string | null
          logo_url?: string | null
          nombre: string
          plan_tier?: string
          slug: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          tiktok_url?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          banner_url?: string | null
          color_primary?: string | null
          created_at?: string | null
          current_period_ends_at?: string | null
          descripcion?: string | null
          direccion?: string | null
          direccion_notas?: string | null
          facebook_url?: string | null
          horarios?: Json | null
          id?: string
          instagram_url?: string | null
          localidad?: string | null
          logo_url?: string | null
          nombre?: string
          plan_tier?: string
          slug?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          tiktok_url?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      pedido_items: {
        Row: {
          cantidad: number
          detalles: string | null
          id: string
          nombre_producto: string
          pedido_id: string | null
          precio_unitario: number
          producto_id: string | null
        }
        Insert: {
          cantidad: number
          detalles?: string | null
          id?: string
          nombre_producto: string
          pedido_id?: string | null
          precio_unitario: number
          producto_id?: string | null
        }
        Update: {
          cantidad?: number
          detalles?: string | null
          id?: string
          nombre_producto?: string
          pedido_id?: string | null
          precio_unitario?: number
          producto_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pedido_items_pedido"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          cliente_id: string | null
          cliente_nombre: string | null
          cliente_whatsapp: string | null
          created_at: string
          direccion_entrega: string | null
          es_delivery: boolean | null
          estado: Database["public"]["Enums"]["estado_pedido"]
          id: string
          metodo_pago: string | null
          negocio_id: string
          notas: string | null
          total: number
        }
        Insert: {
          cliente_id?: string | null
          cliente_nombre?: string | null
          cliente_whatsapp?: string | null
          created_at?: string
          direccion_entrega?: string | null
          es_delivery?: boolean | null
          estado?: Database["public"]["Enums"]["estado_pedido"]
          id?: string
          metodo_pago?: string | null
          negocio_id: string
          notas?: string | null
          total?: number
        }
        Update: {
          cliente_id?: string | null
          cliente_nombre?: string | null
          cliente_whatsapp?: string | null
          created_at?: string
          direccion_entrega?: string | null
          es_delivery?: boolean | null
          estado?: Database["public"]["Enums"]["estado_pedido"]
          id?: string
          metodo_pago?: string | null
          negocio_id?: string
          notas?: string | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_pedidos_negocio"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      productos: {
        Row: {
          categoria_id: string | null
          configuracion: Json | null
          created_at: string
          descripcion: string | null
          disponible: boolean | null
          id: string
          imagen_url: string | null
          negocio_id: string
          nombre: string
          precio: number
        }
        Insert: {
          categoria_id?: string | null
          configuracion?: Json | null
          created_at?: string
          descripcion?: string | null
          disponible?: boolean | null
          id?: string
          imagen_url?: string | null
          negocio_id: string
          nombre: string
          precio?: number
        }
        Update: {
          categoria_id?: string | null
          configuracion?: Json | null
          created_at?: string
          descripcion?: string | null
          disponible?: boolean | null
          id?: string
          imagen_url?: string | null
          negocio_id?: string
          nombre?: string
          precio?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_productos_negocio"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      promos: {
        Row: {
          activo: boolean | null
          codigo: string | null
          created_at: string | null
          descripcion: string | null
          id: string
          items_combo: Json | null
          negocio_id: string
          nombre: string
          tipo_descuento: string
          updated_at: string | null
          valor_descuento: number
        }
        Insert: {
          activo?: boolean | null
          codigo?: string | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          items_combo?: Json | null
          negocio_id: string
          nombre: string
          tipo_descuento: string
          updated_at?: string | null
          valor_descuento: number
        }
        Update: {
          activo?: boolean | null
          codigo?: string | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          items_combo?: Json | null
          negocio_id?: string
          nombre?: string
          tipo_descuento?: string
          updated_at?: string | null
          valor_descuento?: number
        }
        Relationships: [
          {
            foreignKeyName: "promos_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          count: number
          created_at: string
          expires_at: string
          id: string
          key: string
        }
        Insert: {
          count?: number
          created_at?: string
          expires_at: string
          id?: string
          key: string
        }
        Update: {
          count?: number
          created_at?: string
          expires_at?: string
          id?: string
          key?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invited_by: string | null
          negocio_id: string
          role: Database["public"]["Enums"]["team_role"]
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_by?: string | null
          negocio_id: string
          role?: Database["public"]["Enums"]["team_role"]
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_by?: string | null
          negocio_id?: string
          role?: Database["public"]["Enums"]["team_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      view_resumen_clientes: {
        Row: {
          cliente_nombre: string | null
          negocio_id: string | null
          total_gasto: number | null
          total_pedidos: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pedidos_negocio"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      cleanup_rate_limits: { Args: never; Returns: undefined }
      eliminar_negocio_completo: {
        Args: { p_negocio_id: string }
        Returns: Json
      }
      eliminar_usuario_completo: { Args: { p_user_id: string }; Returns: Json }
      listar_negocios_usuario: {
        Args: { p_email?: string }
        Returns: {
          created_at: string
          negocio_id: string
          negocio_nombre: string
          negocio_slug: string
          user_email: string
          user_id: string
        }[]
      }
      obtener_ranking_fidelidad: {
        Args: { target_negocio_id: string }
        Returns: {
          email: string
          id: string
          nombre: string
          notas: string
          pedidos_count: number
          telefono: string
          total_gasto: number
        }[]
      }
      submit_order_atomic: {
        Args: {
          p_cliente_nombre: string
          p_cliente_whatsapp: string
          p_direccion_entrega: string
          p_es_delivery: boolean
          p_items: Json
          p_metodo_pago: string
          p_negocio_id: string
          p_notas: string
        }
        Returns: string
      }
      usuario_accede_negocio: {
        Args: { p_negocio_id: string }
        Returns: boolean
      }
    }
    Enums: {
      estado_pedido: "pendiente" | "en_preparacion" | "entregado" | "cancelado"
      team_role: "admin" | "staff" | "viewer"
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
      estado_pedido: ["pendiente", "en_preparacion", "entregado", "cancelado"],
      team_role: ["admin", "staff", "viewer"],
    },
  },
} as const

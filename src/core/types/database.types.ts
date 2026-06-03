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
            foreignKeyName: "categorias_negocio_id_fkey"
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
            foreignKeyName: "clientes_negocio_id_fkey"
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
          slug: string
          tiktok_url: string | null
          updated_at: string | null
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          banner_url?: string | null
          color_primary?: string | null
          created_at?: string | null
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
          slug: string
          tiktok_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          banner_url?: string | null
          color_primary?: string | null
          created_at?: string | null
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
          slug?: string
          tiktok_url?: string | null
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
            foreignKeyName: "pedido_items_pedido_id_fkey"
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
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
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
            foreignKeyName: "productos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productos_negocio_id_fkey"
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
            foreignKeyName: "pedidos_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
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
    }
    Enums: {
      estado_pedido: "pendiente" | "en_preparacion" | "entregado" | "cancelado"
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
    },
  },
} as const

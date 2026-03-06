// Supabase Database type definitions matching postgrest-js GenericSchema format

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          name: string;
          role: 'member' | 'zone_manager';
          city: string | null;
          province: string | null;
          zone: string | null;
          zone_manager_id: string | null;
          professional_id: string | null;
          registered_at: string;
        };
        Insert: {
          id: string;
          name: string;
          role?: 'member' | 'zone_manager';
          city?: string | null;
          province?: string | null;
          zone?: string | null;
          zone_manager_id?: string | null;
          professional_id?: string | null;
          registered_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
        Relationships: [];
      };
      wizard_profiles: {
        Row: {
          user_id: string;
          profile_data: Json;
          completion_pct: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          profile_data?: Json;
          completion_pct?: number;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['wizard_profiles']['Insert']>;
        Relationships: [];
      };
      professionals: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          profession: string;
          category: string | null;
          city: string;
          province: string | null;
          chapter: string | null;
          phone: string | null;
          email: string | null;
          bio: string | null;
          specialties: string[];
          years_in_bni: number;
          referrals_given: number;
          rating: number;
          month_score: number;
          profile_score: number;
          requests_received: number;
          requests_fulfilled: number;
          avg_response_time: number;
          is_top_of_month: boolean;
          profile_complete: boolean;
          open_requests: number;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id?: string | null;
          name: string;
          profession: string;
          category?: string | null;
          city: string;
          province?: string | null;
          chapter?: string | null;
          phone?: string | null;
          email?: string | null;
          bio?: string | null;
          specialties?: string[];
          years_in_bni?: number;
          referrals_given?: number;
          rating?: number;
          month_score?: number;
          profile_score?: number;
          requests_received?: number;
          requests_fulfilled?: number;
          avg_response_time?: number;
          is_top_of_month?: boolean;
          profile_complete?: boolean;
          open_requests?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['professionals']['Insert']>;
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          initiator_id: string;
          professional_id: string;
          subject: string | null;
          status: 'active' | 'archived' | 'resolved' | 'muted';
          last_message_at: string;
          last_message_preview: string;
          unread_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          initiator_id: string;
          professional_id: string;
          subject?: string | null;
          status?: 'active' | 'archived' | 'resolved' | 'muted';
          last_message_at?: string;
          last_message_preview?: string;
          unread_count?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string | null;
          sender_name: string;
          content: string;
          type: 'text' | 'system' | 'reference_card' | 'attachment';
          status: 'sent' | 'delivered' | 'read';
          attachment_name: string | null;
          attachment_size: string | null;
          reference_id: string | null;
          sent_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id?: string | null;
          sender_name: string;
          content?: string;
          type?: 'text' | 'system' | 'reference_card' | 'attachment';
          status?: 'sent' | 'delivered' | 'read';
          attachment_name?: string | null;
          attachment_size?: string | null;
          reference_id?: string | null;
          sent_at?: string;
        };
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
        Relationships: [];
      };
      references: {
        Row: {
          id: string;
          conversation_id: string;
          from_user_id: string;
          from_user_name: string;
          to_professional_id: string;
          to_professional_name: string;
          contact_name: string;
          contact_type: 'lead' | 'referenza' | 'opportunità';
          contact_info: string | null;
          notes: string | null;
          urgency: 'bassa' | 'media' | 'alta';
          has_consent: boolean;
          status: 'in_verifica' | 'approvata' | 'rifiutata';
          score_awarded: number;
          reviewed_by_user_id: string | null;
          review_notes: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          from_user_id: string;
          from_user_name: string;
          to_professional_id: string;
          to_professional_name: string;
          contact_name: string;
          contact_type: 'lead' | 'referenza' | 'opportunità';
          contact_info?: string | null;
          notes?: string | null;
          urgency?: 'bassa' | 'media' | 'alta';
          has_consent?: boolean;
          status?: 'in_verifica' | 'approvata' | 'rifiutata';
          score_awarded?: number;
          reviewed_by_user_id?: string | null;
          review_notes?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['references']['Insert']>;
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          user_display_name: string | null;
          type: string;
          description: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_display_name?: string | null;
          type: string;
          description?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['activity_logs']['Insert']>;
        Relationships: [];
      };
      alerts: {
        Row: {
          id: string;
          member_id: string;
          member_name: string | null;
          created_by_user_id: string;
          title: string;
          description: string | null;
          severity: 'info' | 'warning' | 'critical';
          status: 'open' | 'closed' | 'archived';
          closed_notes: string | null;
          closed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          member_name?: string | null;
          created_by_user_id: string;
          title: string;
          description?: string | null;
          severity?: 'info' | 'warning' | 'critical';
          status?: 'open' | 'closed' | 'archived';
          closed_notes?: string | null;
          closed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['alerts']['Insert']>;
        Relationships: [];
      };
      awards: {
        Row: {
          id: string;
          member_id: string;
          member_name: string | null;
          awarded_by_id: string;
          awarded_by_name: string | null;
          title: string;
          description: string | null;
          score_bonus: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          member_name?: string | null;
          awarded_by_id: string;
          awarded_by_name?: string | null;
          title: string;
          description?: string | null;
          score_bonus?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['awards']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

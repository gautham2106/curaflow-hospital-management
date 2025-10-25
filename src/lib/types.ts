
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
      ad_resources: {
        Row: {
          clinic_id: string
          created_at: string | null
          display_order: number
          duration: number
          id: string
          title: string
          type: string
          url: string
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          display_order?: number
          duration: number
          id?: string
          title: string
          type: string
          url: string
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          display_order?: number
          duration?: number
          id?: string
          title?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_resources_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          clinic_id: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          avatar: string | null
          clinic_id: string
          created_at: string | null
          id: string
          name: string
          phone: string | null
          sessions: Json | null
          specialty: string
          status: string
        }
        Insert: {
          avatar?: string | null
          clinic_id: string
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
          sessions?: Json | null
          specialty: string
          status?: string
        }
        Update: {
          avatar?: string | null
          clinic_id?: string
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
          sessions?: Json | null
          specialty?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctors_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          age: number | null
          clinic_id: string
          created_at: string | null
          family_id: string
          gender: string | null
          id: string
          last_visit: string | null
          name: string
          phone: string | null
          total_visits: number | null
        }
        Insert: {
          age?: number | null
          clinic_id: string
          created_at?: string | null
          family_id: string
          gender?: string | null
          id?: string
          last_visit?: string | null
          name: string
          phone?: string | null
          total_visits?: number | null
        }
        Update: {
          age?: number | null
          clinic_id?: string
          created_at?: string | null
          family_id?: string
          gender?: string | null
          id?: string
          last_visit?: string | null
          name?: string
          phone?: string | null
          total_visits?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      queue: {
        Row: {
          appointment_id: string
          check_in_time: string
          clinic_id: string
          id: string
          priority: string | null
          status: string
        }
        Insert: {
          appointment_id: string
          check_in_time?: string
          clinic_id: string
          id?: string
          priority?: string | null
          status?: string
        }
        Update: {
          appointment_id?: string
          check_in_time?: string
          clinic_id?: string
          id?: string
          priority?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          clinic_id: string
          created_at: string | null
          end_time: string
          id: string
          name: string
          start_time: string
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          end_time: string
          id?: string
          name: string
          start_time: string
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          end_time?: string
          id?: string
          name?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          called_time: string | null
          check_in_time: string | null
          clinic_id: string
          completed_time: string | null
          consultation_time_minutes: number | null
          date: string
          doctor_id: string
          fee: number | null
          id: string
          out_of_turn_reason: string | null
          patient_id: string
          patient_satisfaction_rating: number | null
          payment_method: string | null
          session: string | null
          session_end_time: string | null
          skip_reason: string | null
          status: string
          token_number: number
          total_time_minutes: number | null
          visit_notes: string | null
          waiting_time_minutes: number | null
          was_out_of_turn: boolean | null
          was_skipped: boolean | null
        }
        Insert: {
          called_time?: string | null
          check_in_time?: string | null
          clinic_id: string
          completed_time?: string | null
          consultation_time_minutes?: number | null
          date: string
          doctor_id: string
          fee?: number | null
          id?: string
          out_of_turn_reason?: string | null
          patient_id: string
          patient_satisfaction_rating?: number | null
          payment_method?: string | null
          session?: string | null
          session_end_time?: string | null
          skip_reason?: string | null
          status?: string
          token_number: number
          total_time_minutes?: number | null
          visit_notes?: string | null
          waiting_time_minutes?: number | null
          was_out_of_turn?: boolean | null
          was_skipped?: boolean | null
        }
        Update: {
          called_time?: string | null
          check_in_time?: string | null
          clinic_id?: string
          completed_time?: string | null
          consultation_time_minutes?: number | null
          date?: string
          doctor_id?: string
          fee?: number | null
          id?: string
          out_of_turn_reason?: string | null
          patient_id?: string
          patient_satisfaction_rating?: number | null
          payment_method?: string | null
          session?: string | null
          session_end_time?: string | null
          skip_reason?: string | null
          status?: string
          token_number?: number
          total_time_minutes?: number | null
          visit_notes?: string | null
          waiting_time_minutes?: number | null
          was_out_of_turn?: boolean | null
          was_skipped?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_clinic: {
        Args: {
          p_pin: string
          p_username: string
        }
        Returns: {
          admin_name: string | null
          clinic_id: string | null
          clinic_name: string | null
          is_authenticated: boolean
        }[]
      }
      complete_previous_consultation: {
        Args: {
          p_doctor_id: string
          p_clinic_id: string
        }
        Returns: undefined
      }
      create_clinic_with_admin: {
        Args: {
          p_address?: string | null
          p_admin_name: string
          p_admin_pin: string
          p_admin_username: string
          p_email?: string | null
          p_max_doctors?: number
          p_max_patients_per_day?: number
          p_name: string
          p_phone?: string | null
          p_subscription_plan?: string
        }
        Returns: {
          admin_username: string | null
          clinic_id: string | null
          clinic_name: string | null
          success: boolean
        }[]
      }
      create_clinic_user: {
        Args: {
          user_email: string
          user_password: string
          clinic_id_to_assign: string
          clinic_name_to_assign: string
          user_full_name: string
        }
        Returns: string
      }
      deactivate_clinic: {
        Args: {
          p_clinic_id: string
        }
        Returns: boolean
      }
      end_session_for_doctor: {
        Args: {
          p_clinic_id: string
          p_doctor_name: string
          p_session_name: string
        }
        Returns: undefined
      }
      end_session_with_tracking: {
        Args: {
          p_clinic_id: string
          p_doctor_id: string
          p_session_end_time?: string
          p_session_name: string
        }
        Returns: {
          avg_consultation_time: number | null
          avg_waiting_time: number | null
          completed_patients: number | null
          no_show_patients: number | null
          skipped_patients: number | null
          total_patients: number | null
          total_revenue: number | null
          waiting_patients: number | null
        }[]
      }
      get_clinic_stats: {
        Args: {
          p_clinic_id: string
        }
        Returns: {
          active_queue_count: number | null
          max_doctors: number | null
          max_patients_per_day: number | null
          subscription_plan: string | null
          total_doctors: number | null
          total_patients: number | null
          total_visits_today: number | null
        }[]
      }
      get_full_queue: {
        Args: {
          p_clinic_id: string
        }
        Returns: {
          id: string
          token_number: number
          patient_name: string
          doctor_name: string
          check_in_time: string
          status: string
          priority: string
          appointment_id: string
        }[]
      }
      update_clinic_admin: {
        Args: {
          p_clinic_id: string
          p_new_admin_name: string
          p_new_pin: string
          p_new_username: string
        }
        Returns: boolean
      }
      seed_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
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
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
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
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
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
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never


export type Patient = {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  familyId: string; // All members of a family share the same familyId
  lastVisit?: string;
  totalVisits: number;
};

export type Session = {
    name: "Morning" | "Afternoon" | "Evening";
    limit: number;
};

export type TodaySession = Session & {
    status: 'pending' | 'active' | 'paused' | 'completed';
}

export type Doctor = Tables<'doctors'>;

export type Appointment = {
  id: string;
  patient: Pick<Patient, "id" | "name">;
  doctor: Pick<Doctor, "id" | "name" | "specialty">;
  time: Date;
  duration: number; // in minutes
  status: "Scheduled" | "Checked-in" | "In-consultation" | "Completed" | "No-show";
  type: "Booking" | "Walk-in" | "Follow-up";
  comments?: string;
};

export type QueueItem = {
    id: string;
    patientName: string;
    doctorName: string;
    checkInTime: Date;
    status: "Waiting" | "In-consultation" | "Completed" | "Skipped" | "No-show";
    priority: "High" | "Medium" | "Low";
    tokenNumber: number;
    appointmentId?: string;
    session?: string;
}

export type SessionConfig = {
    name: "Morning" | "Afternoon" | "Evening";
    start: string;
    end: string;
};

export type VisitRecord = Tables<'visits'>;

export interface AdResource {
  id: string;
  title: string;
  type: 'image' | 'video';
  url: string; 
  duration: number; // Duration in seconds
}

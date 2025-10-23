import { createServiceSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/client';
import type { 
  Doctor, 
  Patient, 
  VisitRecord, 
  QueueItem, 
  SessionConfig, 
  AdResource,
  Tables,
  TablesInsert,
  TablesUpdate
} from '@/lib/types';

export class SupabaseService {
  private serviceSupabase = createServiceSupabaseClient();
  private supabase = createClient();

  // ===== CLINICS =====
  async getClinics() {
    const { data, error } = await this.serviceSupabase
      .from('clinics')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getClinicById(id: string) {
    const { data, error } = await this.serviceSupabase
      .from('clinics')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createClinic(clinic: TablesInsert<'clinics'>) {
    const { data, error } = await this.serviceSupabase
      .from('clinics')
      .insert(clinic)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateClinic(id: string, updates: TablesUpdate<'clinics'>) {
    const { data, error } = await this.serviceSupabase
      .from('clinics')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // ===== DOCTORS =====
  async getDoctors(clinicId: string, status?: string) {
    let query = this.serviceSupabase
      .from('doctors')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('name');

    if (status) {
      const statuses = status.split(',');
      query = query.in('status', statuses);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getDoctorById(id: string) {
    const { data, error } = await this.serviceSupabase
      .from('doctors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createDoctor(doctor: TablesInsert<'doctors'>) {
    const { data, error } = await this.serviceSupabase
      .from('doctors')
      .insert(doctor)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateDoctor(id: string, updates: TablesUpdate<'doctors'>) {
    const { data, error } = await this.serviceSupabase
      .from('doctors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateDoctorStatus(id: string, status: string) {
    const { data, error } = await this.serviceSupabase
      .from('doctors')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteDoctor(id: string) {
    const { error } = await this.serviceSupabase
      .from('doctors')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // ===== PATIENTS =====
  async getPatients(clinicId: string) {
    const { data, error } = await this.serviceSupabase
      .from('patients')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  async searchPatients(clinicId: string, searchTerm: string) {
    const { data, error } = await this.serviceSupabase
      .from('patients')
      .select('*')
      .eq('clinic_id', clinicId)
      .or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  async getPatientById(id: string) {
    const { data, error } = await this.serviceSupabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createPatient(patient: TablesInsert<'patients'>) {
    const { data, error } = await this.serviceSupabase
      .from('patients')
      .insert(patient)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updatePatient(id: string, updates: TablesUpdate<'patients'>) {
    const { data, error } = await this.serviceSupabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deletePatient(id: string) {
    const { error } = await this.serviceSupabase
      .from('patients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // ===== DEPARTMENTS =====
  async getDepartments(clinicId: string) {
    const { data, error } = await this.serviceSupabase
      .from('departments')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  async createDepartment(department: TablesInsert<'departments'>) {
    const { data, error } = await this.serviceSupabase
      .from('departments')
      .insert(department)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteDepartment(id: string) {
    const { error } = await this.serviceSupabase
      .from('departments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // ===== SESSIONS =====
  async getSessions(clinicId: string) {
    const { data, error } = await this.serviceSupabase
      .from('sessions')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  async createSession(session: TablesInsert<'sessions'>) {
    const { data, error } = await this.serviceSupabase
      .from('sessions')
      .insert(session)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateSession(id: string, updates: TablesUpdate<'sessions'>) {
    const { data, error } = await this.serviceSupabase
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteSession(id: string) {
    const { error } = await this.serviceSupabase
      .from('sessions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // ===== VISITS =====
  async getVisits(clinicId: string, date?: string) {
    let query = this.serviceSupabase
      .from('visits')
      .select(`
        *,
        patients!inner(name, phone),
        doctors!inner(name, specialty)
      `)
      .eq('clinic_id', clinicId);

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query.order('token_number');
    if (error) throw error;
    return data || [];
  }

  async getVisitsByDateRange(clinicId: string, startDate: string, endDate: string) {
    const { data, error } = await this.serviceSupabase
      .from('visits')
      .select(`
        *,
        patients!inner(name, phone),
        doctors!inner(name, specialty)
      `)
      .eq('clinic_id', clinicId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .order('token_number');
    
    if (error) throw error;
    return data || [];
  }

  async createVisit(visit: TablesInsert<'visits'>) {
    const { data, error } = await this.serviceSupabase
      .from('visits')
      .insert(visit)
      .select(`
        *,
        patients!inner(name, phone),
        doctors!inner(name, specialty)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateVisit(id: string, updates: TablesUpdate<'visits'>) {
    const { data, error } = await this.serviceSupabase
      .from('visits')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        patients!inner(name, phone),
        doctors!inner(name, specialty)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getNextTokenNumber(clinicId: string, doctorId: string, date: string, session: string) {
    const { data, error } = await this.serviceSupabase
      .from('visits')
      .select('token_number')
      .eq('clinic_id', clinicId)
      .eq('doctor_id', doctorId)
      .eq('date', date)
      .eq('session', session)
      .order('token_number', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    return data?.[0]?.token_number || 0;
  }

  // ===== QUEUE =====
  async getQueue(clinicId: string) {
    const { data, error } = await this.serviceSupabase
      .rpc('get_full_queue', { p_clinic_id: clinicId });
    
    if (error) throw error;
    return data || [];
  }

  async addToQueue(queueItem: TablesInsert<'queue'>) {
    const { data, error } = await this.serviceSupabase
      .from('queue')
      .insert(queueItem)
      .select(`
        *,
        visits!inner(
          token_number,
          patients!inner(name),
          doctors!inner(name)
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateQueueStatus(id: string, status: string) {
    const { data, error } = await this.serviceSupabase
      .from('queue')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        visits!inner(
          token_number,
          patients!inner(name),
          doctors!inner(name)
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  async callPatient(queueId: string, outOfTurnReason?: string) {
    const { data, error } = await this.serviceSupabase
      .from('queue')
      .update({ 
        status: 'In-consultation',
        check_in_time: new Date().toISOString()
      })
      .eq('id', queueId)
      .select(`
        *,
        visits!inner(
          id,
          token_number,
          patients!inner(name),
          doctors!inner(name)
        )
      `)
      .single();
    
    if (error) throw error;
    
    // Update visit record with call details
    if (data.visits) {
      const { error: visitError } = await this.serviceSupabase
        .from('visits')
        .update({ 
          status: 'In-consultation',
          called_time: new Date().toISOString(),
          was_out_of_turn: !!outOfTurnReason,
          out_of_turn_reason: outOfTurnReason || null
        })
        .eq('id', data.visits.id);
      
      if (visitError) throw visitError;
    }
    
    return data;
  }

  async skipPatient(queueId: string, skipReason?: string) {
    // First update the queue status
    const { data: queueData, error: queueError } = await this.serviceSupabase
      .from('queue')
      .update({ status: 'Skipped' })
      .eq('id', queueId)
      .select(`
        *,
        visits!inner(
          id,
          token_number,
          patients!inner(name),
          doctors!inner(name)
        )
      `)
      .single();
    
    if (queueError) throw queueError;
    
    // Then update the visit record with skip details
    if (queueData.visits) {
      const { error: visitError } = await this.serviceSupabase
        .from('visits')
        .update({ 
          status: 'Skipped',
          was_skipped: true,
          skip_reason: skipReason || 'No reason provided'
        })
        .eq('id', queueData.visits.id);
      
      if (visitError) throw visitError;
    }
    
    return queueData;
  }

  async completePatient(queueId: string) {
    const { data, error } = await this.serviceSupabase
      .from('queue')
      .update({ status: 'Completed' })
      .eq('id', queueId)
      .select(`
        *,
        visits!inner(
          token_number,
          patients!inner(name),
          doctors!inner(name)
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  // ===== AD RESOURCES =====
  async getAdResources(clinicId: string) {
    const { data, error } = await this.serviceSupabase
      .from('ad_resources')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('display_order');
    
    if (error) throw error;
    return data || [];
  }

  async createAdResource(resource: TablesInsert<'ad_resources'>) {
    const { data, error } = await this.serviceSupabase
      .from('ad_resources')
      .insert(resource)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateAdResource(id: string, updates: TablesUpdate<'ad_resources'>) {
    const { data, error } = await this.serviceSupabase
      .from('ad_resources')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteAdResource(id: string) {
    const { error } = await this.serviceSupabase
      .from('ad_resources')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  async reorderAdResources(clinicId: string, reorderedResources: { id: string; display_order: number }[]) {
    const updates = reorderedResources.map(resource => 
      this.serviceSupabase
        .from('ad_resources')
        .update({ display_order: resource.display_order })
        .eq('id', resource.id)
        .eq('clinic_id', clinicId)
    );

    const results = await Promise.all(updates);
    const errors = results.filter(result => result.error);
    
    if (errors.length > 0) {
      throw new Error('Failed to reorder some resources');
    }
  }

  // ===== UTILITY FUNCTIONS =====
  async completePreviousConsultation(doctorId: string, clinicId: string) {
    const { error } = await this.serviceSupabase
      .rpc('complete_previous_consultation', { 
        p_doctor_id: doctorId, 
        p_clinic_id: clinicId 
      });
    
    if (error) throw error;
  }

  async endSessionForDoctor(clinicId: string, doctorName: string, sessionName: string) {
    const { error } = await this.serviceSupabase
      .rpc('end_session_for_doctor', { 
        p_clinic_id: clinicId,
        p_doctor_name: doctorName,
        p_session_name: sessionName
      });
    
    if (error) throw error;
  }

  async endSessionWithTracking(clinicId: string, doctorId: string, sessionName: string) {
    const { data, error } = await this.serviceSupabase
      .rpc('end_session_with_tracking', { 
        p_clinic_id: clinicId,
        p_doctor_id: doctorId,
        p_session_name: sessionName
      });
    
    if (error) throw error;
    return data[0]; // Return the first (and only) row of statistics
  }

  // ===== AUTHENTICATION =====
  async signInWithPassword(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error) throw error;
    return user;
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService();

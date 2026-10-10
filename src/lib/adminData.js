import { getSupabase } from './supabaseClient';

export const ROLE_LABELS = { student: 'Student', lecturer: 'Lecturer' };

// Students and lecturers (with email) for the admin pages. Pass an id to get just one person.
// The database function returns nothing unless the caller is an active admin.
export async function fetchManagedUsers(targetId = null) {
  const { data, error } = await getSupabase().rpc('admin_list_users', { target_id: targetId });
  if (error) throw error;
  return data || [];
}

// Activates or deactivates a student/lecturer account.
export async function setUserActive(userId, isActive) {
  const { data, error } = await getSupabase()
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId)
    .select('id, is_active')
    .maybeSingle();
  if (error) throw error;
  // Row-level security hides rows you may not change, so "no row back" means "not allowed".
  if (!data) throw Object.assign(new Error('Status change was not applied.'), { code: '42501' });
  return data;
}

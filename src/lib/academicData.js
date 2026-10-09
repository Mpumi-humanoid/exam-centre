import { getSupabase } from './supabaseClient';

export async function fetchProfile(userId) {
  const client = getSupabase();
  const { data, error } = await client.from('profiles').select('id, full_name, role, gender, institutional_id').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export async function fetchStudentModules(userId) {
  const client = getSupabase();
  const { data, error } = await client
    .from('enrollments')
    .select('module:modules!inner(id, code, name, credits)')
    .eq('student_id', userId)
    .order('module_id');
  if (error) throw error;
  return (data || []).map(({ module }) => module);
}

export async function fetchLecturerModules(userId) {
  const client = getSupabase();
  const { data, error } = await client
    .from('lecturer_modules')
    .select('module:modules!inner(id, code, name, credits)')
    .eq('lecturer_id', userId);
  if (error) throw error;
  return (data || []).map((assignment) => assignment.module);
}

export async function fetchStudentResults(userId) {
  const client = getSupabase();
  const { data, error } = await client
    .from('results')
    .select('id, mark, feedback, updated_at, assessment:assessments!inner(id, name, type, date, module:modules!inner(id, code, name))')
    .eq('student_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((result) => ({
    id: result.id,
    mark: result.mark,
    feedback: result.feedback,
    updatedAt: result.updated_at,
    assessmentId: result.assessment.id,
    assessment: result.assessment.name,
    type: result.assessment.type,
    date: result.assessment.date,
    moduleId: result.assessment.module.id,
    code: result.assessment.module.code,
    module: result.assessment.module.name,
  }));
}

export async function fetchLecturerWorkspace(userId) {
  const client = getSupabase();
  const { data: assignments, error: assignmentError } = await client
    .from('lecturer_modules')
    .select('module:modules!inner(id, code, name, credits)')
    .eq('lecturer_id', userId);
  if (assignmentError) throw assignmentError;
  const assignedModules = (assignments || []).map((assignment) => assignment.module);
  const moduleIds = assignedModules.map((module) => module.id);
  if (moduleIds.length === 0) return { modules: [], assessments: [], students: [], results: [] };

  const [
    { data: assessments, error: assessmentError },
    { data: enrollments, error: enrollmentError },
  ] = await Promise.all([
    client.from('assessments').select('id, module_id, name, type, date, is_released').in('module_id', moduleIds).order('date', { ascending: false }),
    client.from('enrollments').select('student_id, module_id').in('module_id', moduleIds),
  ]);
  if (assessmentError) throw assessmentError;
  if (enrollmentError) throw enrollmentError;

  const studentIds = [...new Set((enrollments || []).map((enrollment) => enrollment.student_id))];
  const assessmentIds = (assessments || []).map((assessment) => assessment.id);
  const [profilesResponse, resultsResponse] = await Promise.all([
    studentIds.length
      ? client.from('profiles').select('id, full_name').in('id', studentIds).order('full_name')
      : Promise.resolve({ data: [], error: null }),
    assessmentIds.length
      ? client
        .from('results')
        .select('id, student_id, assessment_id, mark, feedback, student:profiles!results_student_id_fkey(id, full_name)')
        .in('assessment_id', assessmentIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (profilesResponse.error) throw profilesResponse.error;
  if (resultsResponse.error) throw resultsResponse.error;

  const moduleById = new Map(assignedModules.map((module) => [module.id, module]));
  const students = (profilesResponse.data || []).map((profile) => ({
    ...profile,
    modules: (enrollments || [])
      .filter((enrollment) => enrollment.student_id === profile.id)
      .map((enrollment) => moduleById.get(enrollment.module_id))
      .filter(Boolean),
  }));
  const assessmentsWithModules = (assessments || []).map((assessment) => ({
    ...assessment,
    module: moduleById.get(assessment.module_id),
  }));
  return {
    modules: assignedModules,
    assessments: assessmentsWithModules,
    students,
    results: (resultsResponse.data || []).map((result) => ({
      ...result,
      studentName: result.student?.full_name || 'Student',
    })),
  };
}

export function friendlyDataError(error) {
  console.error('Academic data request failed:', error);
  if (error?.code === 'PGRST116') return 'The record could not be found or is outside your permissions.';
  if (error?.code === '42501' || error?.status === 401 || error?.status === 403) {
    return 'You do not have permission to access this information.';
  }
  return 'We could not load the academic information. Check your connection and try again.';
}

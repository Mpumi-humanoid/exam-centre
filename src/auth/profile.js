// Helpers for loading the signed-in user's profile and explaining why it failed.

const FULL_COLUMNS = 'id, full_name, role, gender, institutional_id';
const BASIC_COLUMNS = 'id, full_name, role';
const SUPPORTED_ROLES = ['student', 'lecturer'];

export class ProfileError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ProfileError';
    this.code = code;
  }
}

// Reads the profile row for a user and checks the role is one we have a portal for.
export async function fetchProfileRow(client, userId) {
  let { data, error } = await client.from('profiles').select(FULL_COLUMNS).eq('id', userId).maybeSingle();

  // 42703 = "column does not exist": the profile_details migration has not been applied
  // to this database yet. Fall back to the basic columns so the user can still sign in.
  if (error?.code === '42703') {
    console.warn('profiles.gender / profiles.institutional_id are missing. Run the latest Supabase migrations.');
    ({ data, error } = await client.from('profiles').select(BASIC_COLUMNS).eq('id', userId).maybeSingle());
  }

  if (error) throw error;
  if (!data) throw new ProfileError('PROFILE_MISSING', 'No profiles row exists for this account.');

  const role = String(data.role ?? '').trim().toLowerCase();
  if (!SUPPORTED_ROLES.includes(role)) {
    throw new ProfileError('UNSUPPORTED_ROLE', `Unsupported role: ${data.role}`);
  }
  return { ...data, role };
}

// Turns any sign-in or profile error into a message the person can act on.
export function describeAuthError(error) {
  const code = error?.code;
  const message = error?.message || '';

  if (message.includes('Supabase is not configured')) {
    return 'The sign-in service is not configured yet. Add your Supabase project URL and anon key to .env.local and restart the dev server.';
  }
  if (code === 'email_not_confirmed' || message.includes('Email not confirmed')) {
    return 'Your email address has not been confirmed yet. Confirm it in Supabase (Authentication → Users), then try again.';
  }
  if (code === 'invalid_credentials' || message.includes('Invalid login credentials')) {
    return 'Your email or password is incorrect.';
  }
  if (code === 'PROFILE_MISSING' || code === 'PGRST116') {
    return 'You signed in, but no student or lecturer profile is linked to this account yet. An administrator needs to add a row for you in the profiles table.';
  }
  if (code === 'UNSUPPORTED_ROLE') {
    return 'Your account role is not "student" or "lecturer", so there is no portal for it. An administrator needs to correct your role.';
  }
  if (code === '42501' || error?.status === 401 || error?.status === 403) {
    return 'The database would not let you read your profile (a permissions/RLS problem). An administrator needs to check the profiles policies.';
  }
  if (code === '42P01') {
    return 'The database is missing the profiles table. Run the Supabase migrations on this project.';
  }
  return 'We could not sign you in. Check your connection, then try again.';
}

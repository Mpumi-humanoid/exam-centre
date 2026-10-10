// Where each role lands after signing in. A role that is not listed has no portal.
const ROLE_HOME = {
  student: '/student',
  lecturer: '/lecturer/results',
  admin: '/admin/users',
};

export function homeForRole(role) {
  return ROLE_HOME[role] ?? null;
}

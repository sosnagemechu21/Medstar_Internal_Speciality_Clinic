export function isStaffRole(role?: string): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase().trim();
  return ['doctor', 'admin', 'staff'].includes(normalized);
}
/** 运营中心访问权限码 */
export const PERMISSIONS = {
  GROWTH_ACCESS: 'center.growth.access',
  EVENTS_ACCESS: 'center.events.access',
  SYSTEM_ACCESS: 'center.system.access',
} as const;

export type PermissionCode =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export function hasPermission(
  permissions: string[] | undefined | null,
  code: string
): boolean {
  if (!permissions || permissions.length === 0) return false;
  return permissions.includes(code);
}

export function hasAnyCenterAccess(permissions: string[] | undefined | null): boolean {
  return (
    hasPermission(permissions, PERMISSIONS.GROWTH_ACCESS) ||
    hasPermission(permissions, PERMISSIONS.EVENTS_ACCESS)
  );
}

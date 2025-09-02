import type { Role, User } from '@/types/auth';

export type Permission =
  | 'admin:manage'         // créer / modifier / supprimer des admins
  | 'site:read'
  | 'site:write'
  | 'courier:scan'
  | 'courier:send'
  | 'courier:read'
  | 'docs:upload'
  | 'docs:view'
  | 'billing:read'
  | 'billing:write'
  | 'profile:edit_own'
  | 'docs:view_own'
  | 'billing:view_own';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    'admin:manage',
    'site:read','site:write',
    'courier:scan','courier:send','courier:read',
    'docs:upload','docs:view',
    'billing:read','billing:write',
  ],
  admin: [
    'site:read','site:write',
    'courier:scan','courier:send','courier:read',
    'docs:upload','docs:view',
    'billing:read','billing:write',
  ],
  secretary: [
    'site:read',
    'courier:scan','courier:send','courier:read',
    'docs:upload','docs:view',
    'billing:read',
  ],
  client: [
    'docs:view_own',
    'billing:view_own',
    'profile:edit_own',
  ],
};

type Ctx = { siteId?: string; ownerId?: string };

/** Vérifie si l’utilisateur a la permission (et le bon périmètre) */
export function can(user: User | null | undefined, perm: Permission, ctx: Ctx = {}): boolean {
  if (!user) return false;
  const list = ROLE_PERMISSIONS[user.role] || [];

  // le super admin passe partout
  if (user.role === 'super_admin') return true;

  // si la permission n’est pas dans son rôle → non
  if (!list.includes(perm)) return false;

  // vérif de périmètre
  if (user.role === 'admin' || user.role === 'secretary') {
    // besoin d’être rattaché au site si on cible un site précis
    if (ctx.siteId && !(user.siteIds || []).includes(ctx.siteId)) return false;
  }

  if (user.role === 'client') {
    // permissions orientées *_own → vérifier ownerId si fourni
    if ((perm === 'docs:view_own' || perm === 'billing:view_own' || perm === 'profile:edit_own') && ctx.ownerId) {
      return user.ownerId === ctx.ownerId;
    }
  }

  return true;
}

/** Vérifie une liste (au moins une) */
export function canAny(user: User | null | undefined, perms: Permission[], ctx?: Ctx) {
  return perms.some(p => can(user, p, ctx));
}

/** Vérifie une liste (toutes) */
export function canAll(user: User | null | undefined, perms: Permission[], ctx?: Ctx) {
  return perms.every(p => can(user, p, ctx));
}

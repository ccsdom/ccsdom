import { canAny, type Permission } from '@/utils/rbac';
import type { User } from '@/types/auth';

export type NavItem = {
  title: string;
  path?: string;
  icon?: any;
  children?: NavItem[];
  required?: Permission[];
  siteScoped?: boolean;
};

export function filterNavForUser(items: NavItem[], user: User | null | undefined, ctx?: { siteId?: string; ownerId?: string }) {
  const res: NavItem[] = [];
  for (const it of items) {
    const ok = !it.required || canAny(user, it.required, ctx);
    if (!ok) continue;
    const children = it.children ? filterNavForUser(it.children, user, ctx) : undefined;
    res.push({ ...it, children });
  }
  return res;
}

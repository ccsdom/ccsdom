export type Role = 'super_admin' | 'admin' | 'secretary' | 'client';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  role: Role;
  /** sites (adresses de domiciliation) sur lesquels l’utilisateur a des droits */
  siteIds?: string[]; // ex: ['ORLY', 'PARIS-12']
  /** pour le client : son propre id société, si besoin */
  ownerId?: string;
}

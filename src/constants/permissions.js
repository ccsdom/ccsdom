export const PERMISSIONS = {
    admin: {
        canViewCAStats: true,
        canManageClients: true,
        canManageInvoices: true,
    },
    secretary: {
        canViewCAStats: false, // Pas accès aux stats chiffre d'affaires
        canManageClients: true,
        canManageInvoices: true,
    },
    client: {
        canViewCAStats: false,
        canManageClients: false,
        canManageInvoices: false,
    },
};

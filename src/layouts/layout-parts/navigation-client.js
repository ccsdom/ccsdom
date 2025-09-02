import duotone from "@/icons/duotone";
export const clientNavigations = [
    { type: "label", label: "Mon espace" },
    {
        type: "item",
        name: "Tableau de bord",
        path: "/client/dashboard",
        icon: duotone.PersonChalkboard,
    },
    {
        type: "item",
        name: "Mes documents",
        path: "/client/documents",
        icon: duotone.Folder,
    },
    {
        type: "item",
        name: "Courriers",
        path: "/client/courriers",
        icon: duotone.Inbox,
    },
    {
        type: "item",
        name: "Factures",
        path: "/client/factures",
        icon: duotone.Invoice,
    },
    {
        type: "item",
        name: "Abonnement",
        path: "/client/abonnement",
        icon: duotone.Apps,
    },
    {
        type: "item",
        name: "Profil",
        path: "/client/profil",
        icon: duotone.UserProfile,
    },
];

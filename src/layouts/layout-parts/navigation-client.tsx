import { ReactNode } from "react";
import { SvgIconProps } from "@mui/material";
import duotone from "@/icons/duotone";
import { Navigations } from "./navigation-types";


interface NavItem {
  type?: "label" | "item" | "extLink";
  name?: string;
  path?: string;
  label?: string;
  access?: string;
  iconText?: string;
  disabled?: boolean;
  badge?: ReactNode;
  children?: NavItem[];
  icon?: (props: SvgIconProps) => JSX.Element;
}

export type Navigations = NavItem[];

export const clientNavigations: Navigations = [
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

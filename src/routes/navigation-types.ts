import { SvgIconProps } from "@mui/material";

export interface NavigationItem {
  type: "label" | "item" | "extLink";
  label?: string;
  name?: string;
  path?: string;
  icon?: (props: SvgIconProps) => JSX.Element;  // Icon en tant que composant fonctionnel
  iconText?: string;
  disabled?: boolean;
  children?: NavigationItem[];
}

export type Navigations = NavigationItem[];

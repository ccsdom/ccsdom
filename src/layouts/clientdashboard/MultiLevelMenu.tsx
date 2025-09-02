import React, { FC } from "react";
import { useTranslation } from "react-i18next";
import useAuth from "@/hooks/useAuth";
import useNavigate from "@/hooks/useNavigate";
import useLocation from "@/hooks/useLocation";
import useLayout from "./context/useLayout";

import SidebarAccordion from "./ClientSidebarAccordion";
import {
  ItemText,
  ListLabel,
  BulletIcon,
  ICON_STYLE,
  ExternalLink,
  NavItemButton,
} from "../layout-parts/styles/sidebar";

// ---- Types locaux robustes (compatibles avec tes menus) ----
export type NavItem = {
  name?: string;                 // libellé (clé i18n possible)
  label?: string;                // libellé pour type "label"
  path?: string;                 // route interne ou URL externe
  icon?: React.ElementType<any>; // composant d'icône MUI ou custom
  iconText?: string;             // fallback texte quand pas d'icône
  type?: "label" | "extLink";    // comportement spécial
  disabled?: boolean;
  children?: Partial<NavItem>[];
  badge?: string | number;
};

// ---- Props du composant ----
interface Props {
  sidebarCompact?: boolean;
  navigations: Partial<NavItem>[];
  /** Permet (ex. sur mobile) de fermer le drawer après un clic */
  onItemClick?: () => void;
}

const MultiLevelMenu: FC<Props> = ({ sidebarCompact = false, navigations, onItemClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { handleCloseMobileSidebar } = useLayout();
  const { user } = useAuth();

  // certains styles attendent 0/1
  const COMPACT = sidebarCompact ? 1 : 0;

  const isActiveRoute = (path?: string) => (path && pathname === path ? 1 : 0);

  const handleNavigation = (path?: string) => {
    if (!path) return;
    navigate(path);
    // si onItemClick est fourni, on l'utilise, sinon on tente de fermer le sidebar via le layout
    if (onItemClick) onItemClick();
    else handleCloseMobileSidebar?.();
  };

  const renderLevels = (items: Partial<NavItem>[]) => {
    return items.map((item, index) => {
      const key = item.path ?? item.name ?? `nav-item-${index}`;
      const active = isActiveRoute(item.path);
      const Icon = item.icon;

      // Label de section
      if (item.type === "label") {
        return (
          <ListLabel key={key} compact={COMPACT}>
            {t(item.label || item.name || "")}
          </ListLabel>
        );
      }

      // Item avec sous-niveaux
      if (item.children && item.children.length) {
        return (
          <SidebarAccordion key={key} item={item} sidebarCompact={COMPACT as any}>
            {renderLevels(item.children)}
          </SidebarAccordion>
        );
      }

      // Lien externe
      if (item.type === "extLink") {
        return (
          <ExternalLink
            key={key}
            href={item.path || "#"}
            rel="noopener noreferrer"
            target="_blank"
          >
            <NavItemButton name="child" active={0}>
              {Icon ? (
                <Icon sx={ICON_STYLE(0)} />
              ) : (
                <span className="item-icon icon-text">{item.iconText}</span>
              )}
              <ItemText compact={COMPACT} active={0}>
                {item.name}
              </ItemText>
            </NavItemButton>
          </ExternalLink>
        );
      }

      // Item standard (navigation interne)
      return (
        <NavItemButton
          key={key}
          disabled={!!item.disabled}
          active={active}
          aria-current={active ? "page" : undefined}
          onClick={() => handleNavigation(item.path)}
        >
          {Icon ? <Icon sx={ICON_STYLE(active)} /> : <BulletIcon active={active} />}
          <ItemText compact={COMPACT} active={active}>
            {t(item.name || "")}
          </ItemText>
        </NavItemButton>
      );
    });
  };

  return <>{renderLevels(navigations || [])}</>;
};

export default MultiLevelMenu;

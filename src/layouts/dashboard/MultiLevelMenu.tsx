import { FC, Fragment, useMemo } from "react";
import { Link as RouterLink, matchPath, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useLayout from "./context/useLayout";

import SidebarAccordion from "./SidebarAccordion";
import {
  ItemText,
  ListLabel,
  BulletIcon,
  ICON_STYLE,
  ExternalLink,
  NavItemButton,
} from "../layout-parts/styles/sidebar";

import { Navigations } from "../layout-parts/navigation";

interface Props {
  sidebarCompact: boolean;
  navigations: Navigations[];
}

const MultiLevelMenu: FC<Props> = ({ sidebarCompact, navigations }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { handleCloseMobileSidebar } = useLayout();
  const COMPACT = sidebarCompact ? 1 : 0;

  const isActive = (path?: string) => {
    if (!path) return 0;
    if (pathname === path) return 1;
    // actif aussi sur les sous-routes
    return matchPath({ path: path + "/*", end: false }, pathname) ? 1 : 0;
  };

  const closeIfMobile = () => handleCloseMobileSidebar?.();

  const renderLevels = (data: Navigations[]) =>
    data.map((item, index) => {
      const key = item.path || item.name || String(index);

      // 1) Label
      if (item.type === "label") {
        const labelText = t(item.label ?? "");
        const isAdminLabel = item.label === "Administration" || labelText === "Administration";
        return (
          <ListLabel
            key={key}
            compact={COMPACT}
            sx={{
              fontWeight: isAdminLabel ? "bold" : undefined,
              fontSize: isAdminLabel ? "1.2rem" : undefined,
              color: isAdminLabel ? "text.primary" : undefined,
              mt: isAdminLabel ? 2 : undefined,
              mb: isAdminLabel ? 1 : undefined,
            }}
          >
            {labelText}
          </ListLabel>
        );
      }

      // 2) Item avec enfants (accordéon)
      if (item.children && item.children.length > 0) {
        return (
          <SidebarAccordion key={key} item={item} sidebarCompact={COMPACT}>
            {renderLevels(item.children)}
          </SidebarAccordion>
        );
      }

      // 3) Lien externe
      if (item.type === "extLink") {
        return (
          <ExternalLink key={key} href={item.path} rel="noopener noreferrer" target="_blank">
            <NavItemButton name="child" active={0}>
              {item.icon ? <item.icon sx={ICON_STYLE(0)} /> : <span className="item-icon icon-text">{item.iconText}</span>}
              <ItemText compact={COMPACT} active={0}>
                {item.name}
              </ItemText>
            </NavItemButton>
          </ExternalLink>
        );
      }

      // 4) Lien interne — on emballe le bouton dans un RouterLink (TOUJOURS)
      const active = isActive(item.path);

      return (
        <RouterLink
          key={key}
          to={item.path || "#"}
          onClick={closeIfMobile}
          style={{ textDecoration: "none", display: "block" }}
        >
          <NavItemButton
            disabled={item.disabled}
            active={active}
            aria-current={active ? "page" : undefined}
            role="link"
            tabIndex={0}
            // IMPORTANT : pas de onClick ici (c’est RouterLink qui navigue)
          >
            {item.icon ? <item.icon sx={ICON_STYLE(active)} /> : <BulletIcon active={active} />}
            <ItemText compact={COMPACT} active={active}>
              {t(item.name ?? "")}
            </ItemText>
          </NavItemButton>
        </RouterLink>
      );
    });

  // Mémo léger (évite rerenders inutiles du menu si les props n'ont pas changé)
  const content = useMemo(() => renderLevels(navigations), [navigations, pathname, sidebarCompact]);

  return <Fragment>{content}</Fragment>;
};

export default MultiLevelMenu;

import { FC, Fragment, PropsWithChildren, useEffect, useState } from "react";
import { Box, Collapse } from "@mui/material";
import { useTranslation } from "react-i18next";
// Hook custom pour récupérer le chemin courant
import useLocation from "@/hooks/useLocation";
// Composants styles custom pour sidebar
import {
  ItemText,
  BulletIcon,
  ICON_STYLE,
  AccordionButton,
  ChevronRightStyled,
  AccordionExpandPanel,
} from "../layout-parts/styles/sidebar";
// Type de navigation
import { Navigations } from "@/layouts/layout-parts/navigation";

// Props avec enfants (sous-menus)
interface SidebarAccordionProps extends PropsWithChildren {
  item: Navigations;
  sidebarCompact: 0 | 1;
}

const SidebarAccordion: FC<SidebarAccordionProps> = ({ item, children, sidebarCompact }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  // Indique si un item enfant est actif (correspond au chemin courant)
  const [hasActive, setHasActive] = useState(0);
  // Contrôle de l’état d’ouverture (collapsed = false ouvert)
  const [collapsed, setCollapsed] = useState(false);

  // Toggle ouverture/fermeture
  const handleClick = () => setCollapsed((prev) => !prev);

  // Recherche un item enfant actif dans la navigation
  const activeChild = item?.children?.some((li) => li.path === pathname);

  useEffect(() => {
    if (activeChild) {
      setCollapsed(true);
      setHasActive(1);
    } else {
      setCollapsed(false);
      setHasActive(0);
    }
  }, [activeChild]);

  return (
    <Fragment>
      {/* Bouton accordéon avec icônes et texte */}
      <AccordionButton
        onClick={handleClick}
        aria-expanded={collapsed}
        aria-controls={`panel-${item.name}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <Box pl="7px" display="flex" alignItems="center">
          {/* Icône si présente */}
          {item.icon && <item.icon sx={ICON_STYLE(hasActive)} />}

          {/* Bullet icon si texte alternatif */}
          {item.iconText && <BulletIcon active={hasActive} />}

          {/* Texte du menu */}
          <ItemText compact={sidebarCompact} active={hasActive}>
            {t(item.name!)}
          </ItemText>
        </Box>

        {/* Flèche accordéon */}
        <ChevronRightStyled
          active={hasActive}
          compact={sidebarCompact}
          className="accordionArrow"
          collapsed={collapsed ? 1 : 0}
        />
      </AccordionButton>

      {/* Contenu du panneau déroulant */}
      <Collapse
        in={collapsed}
        timeout="auto"
        unmountOnExit
        id={`panel-${item.name}`}
        aria-labelledby={`accordion-${item.name}`}
      >
        <AccordionExpandPanel className="expand">{children}</AccordionExpandPanel>
      </Collapse>
    </Fragment>
  );
};

export default SidebarAccordion;

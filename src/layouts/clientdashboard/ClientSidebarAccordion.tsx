import { FC, Fragment, PropsWithChildren, useEffect, useState } from "react";
import { Box, Collapse } from "@mui/material";
import { useTranslation } from "react-i18next";
import useLocation from "@/hooks/useLocation";
import {
  ItemText,
  BulletIcon,
  ICON_STYLE,
  AccordionButton,
  ChevronRightStyled,
  AccordionExpandPanel,
} from "../layout-parts/styles/sidebar";
import { Navigations } from "@/layouts/layout-parts/navigation";

interface SidebarAccordionProps extends PropsWithChildren {
  item: Navigations;
  sidebarCompact: 0 | 1;
}

const ClientSidebarAccordion: FC<SidebarAccordionProps> = ({ item, children, sidebarCompact }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  // Indique si cet item ou un enfant est actif (1) ou non (0)
  const [hasActive, setHasActive] = useState<0 | 1>(0);

  // Etat d'ouverture/repli de l'accordéon
  const [collapsed, setCollapsed] = useState(false);

  const handleClick = () => setCollapsed(prev => !prev);

  // Recherche récursive si un enfant correspond au pathname actuel
  const findActivePath = (items?: Navigations[]): boolean => {
    if (!items) return false;
    return items.some(child => 
      child.path === pathname || findActivePath(child.children)
    );
  };

  useEffect(() => {
    const found = findActivePath(item.children);
    if (found) {
      setCollapsed(true);
      setHasActive(1);
    } else {
      setCollapsed(false);
      setHasActive(0);
    }
  }, [pathname, item.children]);

  return (
    <Fragment>
      <AccordionButton onClick={handleClick}>
        <Box pl="7px" display="flex" alignItems="center">
          {item.icon && <item.icon sx={ICON_STYLE(hasActive)} />}
          {item.iconText && <BulletIcon active={hasActive} />}
          <ItemText compact={sidebarCompact} active={hasActive}>
            {t(item.name!)}
          </ItemText>
        </Box>
        <ChevronRightStyled
          active={hasActive}
          compact={sidebarCompact}
          className="accordionArrow"
          collapsed={collapsed ? 1 : 0}
        />
      </AccordionButton>

      <Collapse in={collapsed} unmountOnExit>
        <AccordionExpandPanel className="expand">{children}</AccordionExpandPanel>
      </Collapse>
    </Fragment>
  );
};

export default ClientSidebarAccordion;

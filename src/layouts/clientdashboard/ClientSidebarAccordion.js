import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useState } from "react";
import { Box, Collapse } from "@mui/material";
import { useTranslation } from "react-i18next";
import useLocation from "@/hooks/useLocation";
import { ItemText, BulletIcon, ICON_STYLE, AccordionButton, ChevronRightStyled, AccordionExpandPanel, } from "../layout-parts/styles/sidebar";
const ClientSidebarAccordion = ({ item, children, sidebarCompact }) => {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    // Indique si cet item ou un enfant est actif (1) ou non (0)
    const [hasActive, setHasActive] = useState(0);
    // Etat d'ouverture/repli de l'accordéon
    const [collapsed, setCollapsed] = useState(false);
    const handleClick = () => setCollapsed(prev => !prev);
    // Recherche récursive si un enfant correspond au pathname actuel
    const findActivePath = (items) => {
        if (!items)
            return false;
        return items.some(child => child.path === pathname || findActivePath(child.children));
    };
    useEffect(() => {
        const found = findActivePath(item.children);
        if (found) {
            setCollapsed(true);
            setHasActive(1);
        }
        else {
            setCollapsed(false);
            setHasActive(0);
        }
    }, [pathname, item.children]);
    return (_jsxs(Fragment, { children: [_jsxs(AccordionButton, { onClick: handleClick, children: [_jsxs(Box, { pl: "7px", display: "flex", alignItems: "center", children: [item.icon && _jsx(item.icon, { sx: ICON_STYLE(hasActive) }), item.iconText && _jsx(BulletIcon, { active: hasActive }), _jsx(ItemText, { compact: sidebarCompact, active: hasActive, children: t(item.name) })] }), _jsx(ChevronRightStyled, { active: hasActive, compact: sidebarCompact, className: "accordionArrow", collapsed: collapsed ? 1 : 0 })] }), _jsx(Collapse, { in: collapsed, unmountOnExit: true, children: _jsx(AccordionExpandPanel, { className: "expand", children: children }) })] }));
};
export default ClientSidebarAccordion;

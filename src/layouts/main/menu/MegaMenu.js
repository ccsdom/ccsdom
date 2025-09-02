import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Grid, styled } from "@mui/material";
import { FlexBox } from "@/components/flexbox";
import { Span } from "@/components/typography";
import ChevronDown from "@/icons/ChevronDown";
import MegaMenuList from "./MegaMenuList";
import { PAGES_MENUS } from "./navigation";
// styled components
const MenusContainer = styled("div")({
    zIndex: 2,
    opacity: 0,
    top: "120%",
    minWidth: 700,
    position: "absolute",
    visibility: "hidden",
    transition: "top 300ms",
    transform: `translate(-50%, 0%)`,
});
const MainListItem = styled("li")(({ theme }) => ({
    position: "relative",
    ":hover": {
        ".menu-item": { color: theme.palette.primary.main },
        ".inner-menu": { opacity: 1, visibility: "visible", top: "100%" },
    },
}));
const MegaMenu = ({ isDark }) => {
    return (_jsxs(MainListItem, { children: [_jsxs(FlexBox, { alignItems: "center", color: isDark ? "white" : "text.primary", className: "menu-item", sx: { cursor: "pointer" }, children: [_jsx(Span, { children: "Pages" }), " ", _jsx(ChevronDown, { sx: { fontSize: 19, ml: 0.3 } })] }), _jsx(MenusContainer, { className: "inner-menu", children: _jsx(Card, { sx: { px: 3, py: 4, mt: 1.5, width: "100%" }, children: _jsx(Grid, { container: true, spacing: 3, children: PAGES_MENUS.map(({ id, title, child }) => (_jsx(Grid, { item: true, xs: 4, children: _jsx(MegaMenuList, { title: title, child: child }) }, id))) }) }) })] }));
};
export default MegaMenu;

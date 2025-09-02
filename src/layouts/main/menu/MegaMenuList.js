import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { styled } from "@mui/material/styles";
// CUSTOM COMPONENTS
import { Link } from "@/components/link";
import { H6 } from "@/components/typography";
import { FlexBox } from "@/components/flexbox";
// CUSTOM DEFINED HOOK
import useLocation from "@/hooks/useLocation";
// styled component
const MenuList = styled(FlexBox)(({ theme }) => ({
    alignItems: "start",
    flexDirection: "column",
    "& > a": {
        fontSize: 14,
        fontWeight: 400,
        transition: "all 300ms",
        color: theme.palette.grey[500],
        ":hover": { color: theme.palette.grey[300] },
        "&.active": { color: theme.palette.primary.main },
    },
}));
// ==============================================================
const MegaMenuList = ({ title, child }) => {
    const { pathname } = useLocation();
    return (_jsxs(_Fragment, { children: [_jsx(H6, { fontSize: 14, children: title }), _jsx(MenuList, { mt: 2, gap: 2, children: child.map((item) => (_jsx(Link, { className: pathname === item.href ? "active" : "", href: item.href, children: item.title }, item.id))) })] }));
};
export default MegaMenuList;

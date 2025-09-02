import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, styled, Tooltip, Checkbox, IconButton, useMediaQuery, } from "@mui/material";
import StarBorder from "@mui/icons-material/StarBorder";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
// CUSTOM COMPONENTS
import { Paragraph, Small } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// CUSTOM LAYOUT COMPONENT
import Layout from "../Layout";
// CUSTOM ICON COMPONENTS
import Trash from "@/icons/duotone/Trash";
import Archive from "@/icons/duotone/Archive";
import UnreadMail from "@/icons/duotone/UnreadMail";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
// STYLED COMPONENTS
const MailActionWrapper = styled("div")(({ theme }) => ({
    right: 24,
    top: "50%",
    zIndex: 11,
    display: "none",
    position: "absolute",
    transform: "translateY(-50%)",
    backgroundColor: theme.palette.grey[isDark(theme) ? 900 : 100],
}));
const MailItem = styled(FlexBetween)(({ theme }) => ({
    cursor: "pointer",
    position: "relative",
    borderBottom: `1px solid ${theme.palette.divider}`,
    ":hover": {
        backgroundColor: theme.palette.grey[isDark(theme) ? 900 : 100],
        "& .actions": { display: "block" },
    },
}));
const AllMailPageView = () => {
    const navigate = useNavigate();
    const upSm = useMediaQuery((theme) => theme.breakpoints.up("sm"));
    return (_jsx(Layout, { children: Array.from({ length: 10 }).map((item, i) => (_jsxs(MailItem, { p: 3, gap: 3, flexWrap: "wrap", onClick: () => navigate("/dashboard/mail/details"), children: [_jsxs(FlexBox, { alignItems: "center", gap: 2, children: [upSm && _jsx(Checkbox, { size: "small", sx: { p: 0 } }), upSm && (_jsx(Tooltip, { title: "Starred", children: _jsx(IconButton, { size: "small", sx: { p: 0 }, children: _jsx(StarBorder, {}) }) })), _jsx(Avatar, { src: "/static/user/user-11.png", sx: { width: 25, height: 25 } }), upSm && _jsx(Paragraph, { fontWeight: 600, children: "Penni Nojel" })] }), _jsx(Paragraph, { flex: 1, color: "text.secondary", ellipsis: upSm, children: "How to Choose the Perfect Shopify Theme and Build Your Online Store Fast!" }), _jsx(Small, { className: "time", color: "text.secondary", children: "1:45 PM" }), _jsxs(MailActionWrapper, { className: "actions", children: [_jsx(Tooltip, { title: "Archive", children: _jsx(IconButton, { color: "secondary", children: _jsx(Archive, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "Trash", children: _jsx(IconButton, { color: "secondary", children: _jsx(Trash, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "Unread", children: _jsx(IconButton, { color: "secondary", children: _jsx(UnreadMail, { fontSize: "small" }) }) })] })] }, i))) }));
};
export default AllMailPageView;

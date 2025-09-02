import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, Drawer, useMediaQuery } from "@mui/material";
import { Create, SendTwoTone } from "@mui/icons-material";
import { nanoid } from "nanoid";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
import useLocation from "@/hooks/useLocation";
// CUSTOM COMPONENTS
import ListItem from "./ListItem";
import { Paragraph } from "@/components/typography";
// CUSTOM ICON COMPONENTS
import Mail from "@/icons/duotone/Mail";
import Edit from "@/icons/duotone/Edit";
import Trash from "@/icons/duotone/Trash";
import Inbox from "@/icons/duotone/Inbox";
import Report from "@/icons/duotone/Report";
import StartHalf from "@/icons/duotone/StarHalf";
// CUSTOM DUMMY DATA SET
const LIST_ITEMS = [
    {
        value: 0,
        Icon: Mail,
        id: nanoid(),
        title: "All Mail",
        url: "/dashboard/mail/all",
    },
    {
        value: 16,
        Icon: Inbox,
        id: nanoid(),
        title: "Inbox",
        url: "/dashboard/mail/inbox",
    },
    {
        value: 0,
        Icon: SendTwoTone,
        id: nanoid(),
        title: "Sent",
        url: "/dashboard/mail/sent",
    },
    {
        value: 0,
        Icon: Edit,
        id: nanoid(),
        title: "Draft",
        url: "/dashboard/mail/inbox",
    },
    {
        value: 0,
        Icon: StartHalf,
        id: nanoid(),
        title: "Starred",
        url: "/dashboard/mail/inbox",
    },
    {
        value: 0,
        Icon: Report,
        id: nanoid(),
        title: "Spam",
        url: "/dashboard/mail/inbox",
    },
    {
        value: 0,
        Icon: Trash,
        id: nanoid(),
        title: "Trash",
        url: "/dashboard/mail/inbox",
    },
    // { value: 0, Icon: ExpandMore, id: nanoid(), title: "More" },
];
const LABELS = [
    { value: 0, id: nanoid(), title: "Personal", color: "primary.main" },
    { value: 0, id: nanoid(), title: "Company", color: "success.main" },
    { value: 0, id: nanoid(), title: "Important", color: "warning.main" },
    { value: 0, id: nanoid(), title: "Private", color: "error.main" },
];
// ==============================================================
const MailSidebar = ({ openSidebar, onClose }) => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const downMd = useMediaQuery((theme) => theme.breakpoints.down("md"));
    const handleNavigate = (url) => () => navigate(url);
    const CONTENT = (_jsxs(_Fragment, { children: [_jsx(Button, { fullWidth: true, startIcon: _jsx(Create, {}), onClick: handleNavigate("/dashboard/mail/compose"), children: "Compose" }), _jsx(Box, { display: "flex", flexDirection: "column", mt: 4, children: LIST_ITEMS.map(({ Icon, id, title, value, url }) => (_jsx(ListItem, { title: title, value: value, active: url === pathname, handleChange: handleNavigate(url), Icon: _jsx(Icon, { sx: { fontSize: 18 } }) }, id))) }), _jsx(Paragraph, { fontWeight: 600, mt: 4, mb: 1, children: "Labels" }), _jsx(Box, { display: "flex", flexDirection: "column", children: LABELS.map(({ id, title, value, color }) => (_jsx(ListItem, { title: title, value: value, active: false, handleChange: () => { }, Icon: _jsx(Box, { sx: {
                            mr: 1,
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor: color,
                        } }) }, id))) })] }));
    if (downMd) {
        return (_jsx(Drawer, { anchor: "left", onClose: onClose, open: openSidebar, PaperProps: { sx: { width: 280, p: 3 } }, children: CONTENT }));
    }
    return (_jsx(Box, { p: 3, width: 260, flexShrink: 0, borderRight: "1px solid", borderColor: "divider", children: CONTENT }));
};
export default MailSidebar;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, AvatarGroup, Button, Chip, Stack, styled, } from "@mui/material";
import { TimelineDot, TimelineItem, TimelineContent, TimelineSeparator, TimelineConnector, } from "@mui/lab";
// CUSTOM COMPONENTS
import FlexBetween from "@/components/flexbox/FlexBetween";
import { Paragraph, Small } from "@/components/typography";
// CUSTOM ICON COMPONENT
import Chat from "@/icons/Chat";
// STYLED COMPONENTS
const StyledAvatarGroup = styled(AvatarGroup)(({ theme }) => ({
    justifyContent: "flex-end",
    "& .MuiAvatarGroup-avatar": {
        width: 25,
        height: 25,
        fontSize: 12,
        color: theme.palette.primary.main,
        borderColor: theme.palette.common.white,
        backgroundColor: theme.palette.primary[100],
    },
}));
const StyledFlexBetween = styled(FlexBetween)(({ theme }) => ({
    padding: 16,
    marginTop: 16,
    borderRadius: 16,
    border: `1px solid ${theme.palette.divider}`,
}));
const ChatItem = () => {
    return (_jsxs(TimelineItem, { sx: { "&::before": { display: "none" } }, children: [_jsxs(TimelineSeparator, { children: [_jsx(TimelineDot, { children: _jsx(Chat, { sx: { fontSize: 16 } }) }), _jsx(TimelineConnector, {})] }), _jsxs(TimelineContent, { sx: { pb: 3 }, children: [_jsx(Paragraph, { fontWeight: 600, mb: 0.5, children: "There are 2 new tasks for you in Alphp Plus project:" }), _jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(Small, { color: "text.secondary", children: "Added at 4.23 PM by" }), _jsx(Avatar, { src: "/static/user/user-11.png", sx: { width: 17, height: 17 } })] }), _jsx(ListItem, { title: "Meeting with customer", status: "In Progress" }), _jsx(ListItem, { title: "Project Delivery", status: "Complete" })] })] }));
};
export default ChatItem;
// ======================================================================
function ListItem({ title, status }) {
    return (_jsxs(StyledFlexBetween, { children: [_jsx(Paragraph, { children: title }), _jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, children: [_jsx(Chip, { label: "Application", color: "secondary", sx: { borderRadius: 4 } }), _jsxs(StyledAvatarGroup, { max: 4, children: [_jsx(Avatar, { src: "/static/user/user-11.png" }), _jsx(Avatar, { src: "/static/user/user-10.png" }), _jsx(Avatar, { src: "/static/user/user-9.png" }), _jsx(Avatar, { src: "/static/user/user-8.png" }), _jsx(Avatar, { src: "/static/user/user-7.png" })] })] }), _jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(Button, { size: "small", color: status === "Complete" ? "success" : "primary", sx: { py: 0.3 }, children: status }), _jsx(Button, { size: "small", variant: "outlined", color: "secondary", sx: { py: 0.3 }, children: "View" })] })] }));
}

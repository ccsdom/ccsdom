import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, Stack, Table, Button, TableRow, Checkbox, TableBody, TableHead, TextField, } from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
// CUSTOM COMPONENTS
import { Link } from "@/components/link";
import { Scrollbar } from "@/components/scrollbar";
import { H6, Paragraph, Small } from "@/components/typography";
// COMMON STYLED COMPONENTS
import { BodyTableCell, BodyTableRow, HeadTableCell } from "./common/styles";
const Notifications = () => {
    return (_jsxs(Card, { children: [_jsxs(Box, { padding: 3, children: [_jsx(H6, { fontSize: 14, children: "Notifications" }), _jsxs(Small, { color: "text.secondary", children: ["We need permission from your browser to show notifications.", " ", _jsx(Link, { href: "#", children: "Request permission" })] })] }), _jsx(Scrollbar, { autoHide: false, children: _jsxs(Table, { sx: { minWidth: 600 }, children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(HeadTableCell, { children: "Type" }), _jsx(HeadTableCell, { children: "Email" }), _jsx(HeadTableCell, { children: "Browser" }), _jsx(HeadTableCell, { children: "App" })] }) }), _jsx(TableBody, { children: NOTIFICATION_SETTINGS.map((item) => (_jsxs(BodyTableRow, { children: [_jsx(BodyTableCell, { children: item.type }), _jsx(BodyTableCell, { children: _jsx(Checkbox, { defaultChecked: item.email }) }), _jsx(BodyTableCell, { children: _jsx(Checkbox, { defaultChecked: item.browser }) }), _jsx(BodyTableCell, { children: _jsx(Checkbox, { defaultChecked: item.app }) })] }, item.id))) })] }) }), _jsxs(Box, { padding: 3, children: [_jsxs(Box, { mb: 6, mt: 2, children: [_jsx(TextField, { select: true, fullWidth: true, value: "always", variant: "outlined", placeholder: "Language", label: "When should we send you notifications?", SelectProps: { native: true, IconComponent: KeyboardArrowDown }, sx: { maxWidth: 400 }, children: _jsx("option", { value: "always", children: "Always" }) }), _jsx(Paragraph, { color: "text.secondary", mt: 2, children: "In order to cut back on noise, email notifications are grouped together and only sent when you're idle or offline." })] }), _jsxs(Stack, { direction: "row", spacing: 2, children: [_jsx(Button, { variant: "contained", children: "Save Changes" }), _jsx(Button, { variant: "outlined", children: "Cancel" })] })] })] }));
};
const NOTIFICATION_SETTINGS = [
    { id: 1, app: false, email: true, browser: false, type: "New for you" },
    { id: 2, app: true, email: true, browser: true, type: "Account activity" },
    {
        id: 3,
        app: true,
        email: true,
        browser: true,
        type: "A new browser used to sign in",
    },
    {
        id: 4,
        app: false,
        email: false,
        browser: true,
        type: "A new device is linked",
    },
    {
        id: 5,
        app: false,
        email: true,
        browser: false,
        type: "A new device connected",
    },
];
export default Notifications;

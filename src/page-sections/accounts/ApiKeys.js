import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, Grid, Chip, Alert, Table, Button, Switch, Divider, Select, MenuItem, TableRow, TableBody, TableHead, IconButton, AlertTitle, FormControlLabel, } from "@mui/material";
import { CopyToClipboard } from "react-copy-to-clipboard";
// CUSTOM COMPONENTS
import { Link } from "@/components/link";
import { Scrollbar } from "@/components/scrollbar";
import { FlexBetween, FlexBox } from "@/components/flexbox";
import { H5, H6, Paragraph, Tiny } from "@/components/typography";
// CUSTOM ICON COMPONENTS
import Copy from "@/icons/Copy";
import Delete from "@/icons/Delete";
import NotificationAlert from "@/icons/NotificationAlert";
// COMMON STYLED COMPONENTS
import { BodyTableCellV2, BodyTableRow, HeadTableCell } from "./common/styles";
const ApiKeys = () => {
    return (_jsxs(Card, { children: [_jsxs(FlexBetween, { px: 3, py: 2, children: [_jsx(H6, { fontSize: 14, children: "API Overview" }), _jsx(FormControlLabel, { label: "Test Mode", control: _jsx(Switch, { defaultChecked: true }), slotProps: { typography: { fontSize: 14 } } })] }), _jsx(Divider, {}), _jsxs(Box, { padding: 3, children: [_jsxs(Grid, { container: true, spacing: 4, mb: 3, children: [_jsxs(Grid, { item: true, sm: 6, xs: 12, children: [_jsx(H5, { fontSize: 14, mb: 0.5, children: "How to set Api" }), _jsx(Paragraph, { fontSize: 12, mb: 2, children: "Use images to enhance your post, improve its flow, add humor and explain complex topics" }), _jsx(Button, { variant: "contained", children: "Get Started" })] }), _jsxs(Grid, { item: true, sm: 6, xs: 12, children: [_jsx(H5, { fontSize: 14, mb: 0.5, children: "Developer Tools" }), _jsx(Paragraph, { fontSize: 12, mb: 2, children: "Plan your blog post by choosing a topic, creating an outline conduct research, and checking facts" }), _jsx(Button, { variant: "contained", children: "Create Rule" })] })] }), _jsxs(Alert, { severity: "info", variant: "outlined", icon: _jsx(NotificationAlert, {}), children: [_jsx(AlertTitle, { children: "Two Factor Authentication" }), "Adds an extra layer of security to your account. To log in, in you'll need to provide a 4 digit amazing and create outstanding products to serve your clients ", _jsx(Link, { href: "#", children: "Learn More" }), "."] })] }), _jsxs(FlexBetween, { px: 3, py: 2, children: [_jsx(H5, { fontSize: 14, children: "Login Sessions" }), _jsxs(Select, { defaultValue: 2022, size: "small", children: [_jsx(MenuItem, { value: 2022, children: "2022" }), _jsx(MenuItem, { value: 2021, children: "2021" }), _jsx(MenuItem, { value: 2020, children: "2020" })] })] }), _jsx(Scrollbar, { autoHide: false, children: _jsxs(Table, { sx: { minWidth: 800 }, children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(HeadTableCell, { children: "Location" }), _jsx(HeadTableCell, { children: "Status" }), _jsx(HeadTableCell, { children: "Device" }), _jsx(HeadTableCell, { children: "IP Address" }), _jsx(HeadTableCell, { children: "Time" })] }) }), _jsx(TableBody, { children: sessionList.map((item) => (_jsxs(BodyTableRow, { children: [_jsx(BodyTableCellV2, { children: item.location }), _jsx(BodyTableCellV2, { children: _jsx(Chip, { size: "small", label: item.status, color: item.status === "Error" ? "error" : "success" }) }), _jsx(BodyTableCellV2, { children: item.device }), _jsx(BodyTableCellV2, { children: item.ip }), _jsx(BodyTableCellV2, { children: item.time })] }, item.id))) })] }) }), _jsx(Divider, { sx: { my: 2 } }), _jsx(H5, { fontSize: 14, p: 3, children: "API Keys" }), _jsx(Scrollbar, { autoHide: false, children: _jsxs(Table, { sx: { minWidth: 800 }, children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(HeadTableCell, { children: "Label" }), _jsx(HeadTableCell, { children: "API Keys" }), _jsx(HeadTableCell, { children: "Created" }), _jsx(HeadTableCell, { children: "Status" }), _jsx(HeadTableCell, { children: "Action" })] }) }), _jsx(TableBody, { children: keys.map((item, index) => (_jsxs(BodyTableRow, { children: [_jsx(BodyTableCellV2, { children: item.label }), _jsx(BodyTableCellV2, { children: _jsxs(FlexBox, { alignItems: "center", children: [_jsx(Tiny, { fontSize: 12, minWidth: 180, children: item.key }), _jsx(CopyToClipboard, { text: item.key, onCopy: () => true, children: _jsx(IconButton, { color: "inherit", children: _jsx(Copy, { fontSize: "small" }) }) })] }) }), _jsx(BodyTableCellV2, { children: item.created }), _jsx(BodyTableCellV2, { children: _jsx(Chip, { size: "small", label: item.status, color: item.status === "Inactive" ? "error" : "success" }) }), _jsx(BodyTableCellV2, { children: _jsx(IconButton, { color: "inherit", children: _jsx(Delete, { fontSize: "small" }) }) })] }, index))) })] }) })] }));
};
const sessionList = [
    {
        id: 1,
        location: "USA(5)",
        status: "Ok",
        device: "	Chrome - Windows",
        ip: "	236.125.56.78",
        time: "2 mins ago",
    },
    {
        id: 2,
        location: "United Kingdom(10)",
        status: "Ok",
        device: "Safari - Mac OS",
        ip: "236.125.56.79",
        time: "4 mins ago",
    },
    {
        id: 3,
        location: "Norway(8)",
        status: "Error",
        device: "Firefox - Windows",
        ip: "236.125.56.74",
        time: "10 mins ago",
    },
];
const keys = [
    {
        label: "none set",
        key: "fftt456765gjkkjhi83093985",
        created: "Nov 12, 2021",
        status: "Active",
    },
    {
        label: "Navitare",
        key: "jk076590ygghgh324vd33",
        created: "Nov 14, 2021",
        status: "Active",
    },
    {
        label: "Docs API Key",
        key: "fftt456765gjkkjhi83093985",
        created: "Nov 14, 2021",
        status: "Inactive",
    },
    {
        label: "Remore Interface",
        key: "jk076590ygghgh324vd33",
        created: "Nov 15, 2021",
        status: "Active",
    },
];
export default ApiKeys;

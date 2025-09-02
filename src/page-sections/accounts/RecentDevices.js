import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, Card, Table, TableHead, TableRow, TableBody, Chip, } from "@mui/material";
import { nanoid } from "nanoid";
// CUSTOM COMPONENTS
import { Scrollbar } from "@/components/scrollbar";
import { FlexBetween, FlexBox } from "@/components/flexbox";
import { H6, Paragraph, Small } from "@/components/typography";
// COMMON STYLED COMPONENTS
import { HeadTableCell, BodyTableCell, BodyTableRow } from "./common/styles";
// CUSTOM DUMMY DATA SET
const ACTIVITY_LIST = [
    {
        id: nanoid(),
        current: true,
        recentActivity: "Now",
        device: "Dell XPS 12",
        location: "New York, USA",
        browser: "Chrome on Windows",
        browserIcon: "/static/browser/chrome.svg",
    },
    {
        id: nanoid(),
        device: "Acer Aspire 300",
        location: "New York, USA",
        browser: "Mozilla Firefox",
        recentActivity: "15 June 2020",
        browserIcon: "/static/browser/mozilla.svg",
    },
    {
        id: nanoid(),
        location: "London, UK",
        browser: "Safari Browser",
        device: "Macbook Pro 2020",
        recentActivity: "05 October 2020",
        browserIcon: "/static/browser/safari.svg",
    },
    {
        id: nanoid(),
        browser: "Apple Browser",
        location: "Manchester, UK",
        device: "IPhone 13 Pro Max",
        recentActivity: "05 October 2020",
        browserIcon: "/static/browser/apple.svg",
    },
];
const RecentDevices = () => {
    return (_jsxs(Card, { sx: { pb: 1 }, children: [_jsxs(FlexBetween, { padding: 3, flexWrap: "wrap", children: [_jsx(H6, { fontSize: 14, children: "Recent Devices" }), _jsx(Small, { children: "View and manage devices where you're currently logged in." })] }), _jsx(Scrollbar, { autoHide: false, children: _jsxs(Table, { sx: { minWidth: 800 }, children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(HeadTableCell, { children: "Browser" }), _jsx(HeadTableCell, { children: "Device" }), _jsx(HeadTableCell, { children: "Location" }), _jsx(HeadTableCell, { children: "Recent Activity" })] }) }), _jsx(TableBody, { children: ACTIVITY_LIST.map((item) => (_jsxs(BodyTableRow, { children: [_jsx(BodyTableCell, { children: _jsxs(FlexBox, { alignItems: "center", gap: 1, children: [_jsx(Avatar, { src: item.browserIcon, sx: { width: 20, height: 20 } }), _jsx(Paragraph, { children: item.browser })] }) }), _jsx(BodyTableCell, { children: item.device }), _jsx(BodyTableCell, { children: _jsxs(FlexBox, { gap: 1, alignItems: "center", children: [_jsx(Paragraph, { children: item.location }), item.current && (_jsx(Chip, { label: "current", size: "small", color: "success", variant: "outlined" }))] }) }), _jsx(BodyTableCell, { children: item.recentActivity })] }, item.id))) })] }) })] }));
};
export default RecentDevices;

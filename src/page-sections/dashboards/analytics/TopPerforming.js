import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Table, TableBody, TableHead, TableRow, } from "@mui/material";
import { nanoid } from "nanoid";
// CUSTOM COMPONENTS
import { Scrollbar } from "@/components/scrollbar";
import { FlexBetween } from "@/components/flexbox";
import { MoreButton } from "@/components/more-button";
import { Paragraph, Span } from "@/components/typography";
// CUSTOM UTILS METHOD
import { numberFormat } from "@/utils/numberFormat";
// STYLED COMPONENTS
import { HeadTableCell, BodyTableCell } from "./styles";
// DUMMY DATA LIST
const DATA = [
    {
        id: nanoid(),
        page: "https://onion.com",
        click: 1369,
        views: "50M",
        click2: -165,
    },
    {
        id: nanoid(),
        page: "https://onion/analytic.com",
        click: 1003,
        views: "28M",
        click2: 528,
    },
    {
        id: nanoid(),
        page: "https://onion/ecommerce.com",
        click: 1987,
        views: "63M",
        click2: 898,
    },
    {
        id: nanoid(),
        page: "https://onion/crm.com",
        click: 1462,
        views: "50M",
        click2: -369,
    },
    {
        id: nanoid(),
        page: "https://onion/finance.com",
        click: 986,
        views: "70M",
        click2: -479,
    },
    {
        id: nanoid(),
        page: "https://onion/projectm.com",
        click: 1028,
        views: "75M",
        click2: 669,
    },
    {
        id: nanoid(),
        page: "https://onion/logistics.com",
        click: 369,
        views: "25M",
        click2: 215,
    },
];
const TopPerforming = () => {
    return (_jsxs(Card, { sx: { padding: 3, pb: 1 }, children: [_jsxs(FlexBetween, { mb: 4, children: [_jsxs("div", { children: [_jsx(Paragraph, { fontSize: 18, fontWeight: 500, children: "Top performing pages" }), _jsx(Paragraph, { color: "text.secondary", children: "Counted in Millions" })] }), _jsx(MoreButton, { size: "small" })] }), _jsx(Scrollbar, { children: _jsxs(Table, { sx: { minWidth: 470 }, children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(HeadTableCell, { children: "PAGES" }), _jsx(HeadTableCell, { children: "CLICKS" }), _jsx(HeadTableCell, { align: "center", children: "VIEWS" })] }) }), _jsx(TableBody, { children: DATA.map((item) => (_jsxs(TableRow, { children: [_jsx(BodyTableCell, { children: item.page }), _jsx(BodyTableCell, { children: _jsxs(Paragraph, { fontWeight: 500, children: [numberFormat(item.click), " ", _jsxs(Span, { color: item.click2 > 0 ? "success.main" : "error.main", ml: 1, children: [item.click2 > 0 && "+", item.click2] })] }) }), _jsx(BodyTableCell, { align: "center", children: item.views })] }, item.id))) })] }) })] }));
};
export default TopPerforming;

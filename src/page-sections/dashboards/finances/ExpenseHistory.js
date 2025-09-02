import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Table, Avatar, TableRow, TableBody, TableHead, } from "@mui/material";
import { nanoid } from "nanoid";
import format from "date-fns/format";
// CUSTOM COMPONENTS
import { Scrollbar } from "@/components/scrollbar";
import { MoreButton } from "@/components/more-button";
import { Paragraph, Small } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// COMMON DASHBOARD RELATED COMPONENTS
import { BodyTableCell, HeadTableCell } from "../_common";
// CUSTOM DUMMY DATA SET
const DATA = [
    {
        id: nanoid(),
        total: 356.25,
        createdAt: new Date("August 31, 2022 10:30:00"),
        user: { id: nanoid(), name: "Arikunn", image: "/static/thumbnail/1.png" },
    },
    {
        id: nanoid(),
        total: 165.58,
        createdAt: new Date("August 30, 2022 13:30:00"),
        user: { id: nanoid(), name: "Ikauwis", image: "/static/thumbnail/2.png" },
    },
    {
        id: nanoid(),
        total: 463.25,
        createdAt: new Date("August 29, 2022 19:30:00"),
        user: { id: nanoid(), name: "Dayet", image: "/static/thumbnail/3.png" },
    },
];
const ExpenseHistory = () => {
    return (_jsxs(Card, { sx: { height: "100%" }, children: [_jsxs(FlexBetween, { p: 3, children: [_jsxs("div", { children: [_jsx(Paragraph, { fontSize: 18, fontWeight: 500, children: "Expanse History" }), _jsx(Paragraph, { color: "text.secondary", children: "Top 7 Countries" })] }), _jsx(MoreButton, { size: "small" })] }), _jsx(Scrollbar, { children: _jsxs(Table, { sx: { minWidth: 500 }, children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(HeadTableCell, { children: "NAME" }), _jsx(HeadTableCell, { children: "CREATED DATE" }), _jsx(HeadTableCell, { children: "AMOUNT" }), _jsx(HeadTableCell, { children: "ACTION" })] }) }), _jsx(TableBody, { children: DATA.map((item, index) => (_jsxs(TableRow, { children: [_jsx(BodyTableCell, { children: _jsxs(FlexBox, { gap: 1, children: [_jsx(Avatar, { variant: "rounded", src: item.user.image }), _jsxs("div", { children: [_jsx(Paragraph, { color: "text.primary", fontWeight: 500, children: item.user.name }), _jsx(Small, { children: item.user.id.substring(0, 10) })] })] }) }), _jsx(BodyTableCell, { children: format(new Date(item.createdAt), "dd MMM, yyyy") }), _jsx(BodyTableCell, { children: _jsxs(Paragraph, { color: "text.primary", fontWeight: 500, children: ["$", item.total] }) }), _jsx(BodyTableCell, { children: _jsx(MoreButton, {}) })] }, index))) })] }) })] }));
};
export default ExpenseHistory;

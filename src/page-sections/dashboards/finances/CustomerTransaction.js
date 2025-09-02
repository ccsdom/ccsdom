import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Table, Avatar, TableRow, TableBody, TableHead, IconButton, } from "@mui/material";
import { Schedule, Tune } from "@mui/icons-material";
import { nanoid } from "nanoid";
import { format } from "date-fns";
// CUSTOM COMPONENTS
import { Scrollbar } from "@/components/scrollbar";
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
        user: { id: nanoid(), name: "Arikunn", image: "/static/user/user-13.png" },
    },
    {
        id: nanoid(),
        total: 165.58,
        createdAt: new Date("August 30, 2022 13:30:00"),
        user: { id: nanoid(), name: "Ikauwis", image: "/static/user/user-14.png" },
    },
    {
        id: nanoid(),
        total: 463.25,
        createdAt: new Date("August 29, 2022 19:30:00"),
        user: { id: nanoid(), name: "Dayet", image: "/static/user/user-15.png" },
    },
    {
        id: nanoid(),
        total: 185.58,
        createdAt: new Date("August 28, 2022 16:30:00"),
        user: { id: nanoid(), name: "Ikauwis", image: "/static/user/user-13.png" },
    },
];
const CustomerTransaction = () => {
    const getColor = (index) => {
        return index % 2 === 1 ? "action.selected" : "transparent";
    };
    return (_jsxs(Card, { children: [_jsxs(FlexBetween, { p: 3, children: [_jsx(Paragraph, { fontSize: 18, fontWeight: 500, children: "Customer Transactions" }), _jsxs(FlexBox, { gap: 1, children: [_jsxs(Paragraph, { lineHeight: 1, sx: {
                                    gap: 1,
                                    display: "flex",
                                    borderRadius: 1.5,
                                    color: "grey.500",
                                    alignItems: "center",
                                    padding: ".25rem .5rem",
                                    backgroundColor: "action.selected",
                                }, children: [_jsx(Schedule, { fontSize: "small" }), " 24 Aug - 31 Aug"] }), _jsx(IconButton, { color: "secondary", children: _jsx(Tune, {}) })] })] }), _jsx(Scrollbar, { children: _jsxs(Table, { sx: { minWidth: 500 }, children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(HeadTableCell, { children: "TRANSACTION" }), _jsx(HeadTableCell, { children: "DATE" }), _jsx(HeadTableCell, { children: "TIME" }), _jsx(HeadTableCell, { children: "AMOUNT" })] }) }), _jsx(TableBody, { children: DATA.map((item, index) => (_jsxs(TableRow, { sx: { backgroundColor: getColor(index) }, children: [_jsx(BodyTableCell, { children: _jsxs(FlexBox, { gap: 1, children: [_jsx(Avatar, { variant: "rounded", src: item.user.image }), _jsxs("div", { children: [_jsx(Paragraph, { color: "text.primary", fontWeight: 500, children: item.user.name }), _jsx(Small, { children: item.user.id.substring(0, 10) })] })] }) }), _jsx(BodyTableCell, { children: format(new Date(item.createdAt), "dd MMM, yyyy") }), _jsx(BodyTableCell, { children: format(new Date(item.createdAt), "hh:mm a") }), _jsx(BodyTableCell, { children: _jsxs(Paragraph, { color: "text.primary", fontWeight: 500, children: ["$", item.total] }) })] }, index))) })] }) })] }));
};
export default CustomerTransaction;

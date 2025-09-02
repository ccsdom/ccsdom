import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Table, Avatar, TableRow, TableBody, TableHead, } from "@mui/material";
import { nanoid } from "nanoid";
// CUSTOM COMPONENTS
import { Scrollbar } from "@/components/scrollbar";
import { MoreButton } from "@/components/more-button";
import { StatusBadge } from "@/components/status-badge";
import { Paragraph, Small } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// CUSTOM UTILS METHOD
import { format } from "@/utils/currency";
// COMMON DASHBOARD RELATED COMPONENTS
import { BodyTableCell, HeadTableCell } from "../_common";
// CUSTOM DUMMY DATA
const DATA = [
    {
        id: nanoid(),
        dealValue: 203500,
        status: "Deal won",
        status_type: "success",
        company: "Absternet LLC",
        user: {
            name: "Astole Banne",
            designation: "Sales Manager",
            image: "/static/user/user-11.png",
        },
    },
    {
        id: nanoid(),
        dealValue: 283500,
        status: "Stuck",
        status_type: "error",
        company: "Nike",
        user: {
            name: "Lisa Bee",
            designation: "Sales Manager",
            image: "/static/user/user-11.png",
        },
    },
    {
        id: nanoid(),
        dealValue: 243500,
        status: "Pending",
        status_type: "warning",
        company: "Absternet LLC",
        user: {
            name: "Stuward Canne",
            designation: "Sales Manager",
            image: "/static/user/user-11.png",
        },
    },
];
const DealStatus = () => {
    return (_jsxs(Card, { sx: { height: "100%" }, children: [_jsxs(FlexBetween, { p: 3, children: [_jsx(Paragraph, { fontSize: 18, fontWeight: 500, children: "Deal Status" }), _jsx(MoreButton, { size: "small" })] }), _jsx(Scrollbar, { children: _jsxs(Table, { sx: { minWidth: 600 }, children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(HeadTableCell, { children: "SALES REPRESENTATIVE" }), _jsx(HeadTableCell, { children: "COMPANY NAME" }), _jsx(HeadTableCell, { children: "STATUS" }), _jsx(HeadTableCell, { children: "DEAL VALUE" })] }) }), _jsx(TableBody, { children: DATA.map(({ id, dealValue, company, status, user, status_type }) => (_jsxs(TableRow, { children: [_jsx(BodyTableCell, { children: _jsxs(FlexBox, { gap: 2, children: [_jsx(Avatar, { src: user.image }), _jsxs("div", { children: [_jsx(Paragraph, { color: "text.primary", fontWeight: 500, children: user.name }), _jsx(Small, { children: user.designation })] })] }) }), _jsx(BodyTableCell, { children: _jsx(Paragraph, { color: "text.primary", fontWeight: 500, children: company }) }), _jsx(BodyTableCell, { children: _jsx(StatusBadge, { type: status_type, children: status }) }), _jsx(BodyTableCell, { children: format(dealValue, "0a.00") })] }, id))) })] }) })] }));
};
export default DealStatus;

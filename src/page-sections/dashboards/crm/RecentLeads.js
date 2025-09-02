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
import { numberFormat } from "@/utils/numberFormat";
// COMMON DASHBOARD RELATED COMPONENTS
import { BodyTableCell, HeadTableCell } from "../_common";
// CUSTOM DUMMY DATA SET
const DATA = [
    {
        id: nanoid(),
        status: "Won Lead",
        status_type: "success",
        email: "astole@gmail.com",
        user: {
            name: "Astole Banne",
            balance: 25360.0,
            image: "/static/user/user-11.png",
        },
    },
    {
        id: nanoid(),
        status: "Cold Lead",
        status_type: "warning",
        email: "taslon@gmail.com",
        user: {
            name: "Taslon Abela",
            balance: 25360.0,
            image: "/static/user/user-17.png",
        },
    },
    {
        id: nanoid(),
        status: "New Lead",
        status_type: "error",
        email: "tofan@gmail.com",
        user: {
            name: "Tofan Andy",
            balance: 25360.0,
            image: "/static/user/user-18.png",
        },
    },
];
const RecentLeads = () => {
    return (_jsxs(Card, { sx: { height: "100%" }, children: [_jsxs(FlexBetween, { p: 3, children: [_jsx(Paragraph, { fontSize: 18, fontWeight: 500, children: "Recent Leads" }), _jsx(MoreButton, { size: "small" })] }), _jsx(Scrollbar, { children: _jsxs(Table, { sx: { minWidth: 600 }, children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(HeadTableCell, { children: "NAME" }), _jsx(HeadTableCell, { children: "EMAIL OR PHONE" }), _jsx(HeadTableCell, { children: "STATUS" }), _jsx(HeadTableCell, { children: "ACTION" })] }) }), _jsx(TableBody, { children: DATA.map(({ id, status, user, email, status_type }) => (_jsxs(TableRow, { children: [_jsx(BodyTableCell, { children: _jsxs(FlexBox, { gap: 2, children: [_jsx(Avatar, { src: user.image }), _jsxs("div", { children: [_jsx(Paragraph, { color: "text.primary", fontWeight: 500, children: user.name }), _jsxs(Small, { children: ["$", numberFormat(user.balance, {
                                                                    minimumFractionDigits: 2,
                                                                })] })] })] }) }), _jsx(BodyTableCell, { children: _jsx(Paragraph, { color: "text.primary", fontWeight: 500, children: email }) }), _jsx(BodyTableCell, { children: _jsx(StatusBadge, { type: status_type, children: status }) }), _jsx(BodyTableCell, { children: _jsx(MoreButton, { size: "small" }) })] }, id))) })] }) })] }));
};
export default RecentLeads;

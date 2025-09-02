import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Table, TableRow, TableBody, TableHead, } from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import { nanoid } from "nanoid";
// CUSTOM COMPONENTS
import { Scrollbar } from "@/components/scrollbar";
import { MoreButton } from "@/components/more-button";
import { StatusBadge } from "@/components/status-badge";
import { Paragraph, Small } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// COMMON DASHBOARD RELATED COMPONENTS
import { BodyTableCell, HeadTableCell } from "../_common";
// CUSTOM DUMMY DATA SET
const DATA = [
    {
        id: nanoid(),
        total: 678.5,
        status: "Pending",
        status_type: "warning",
        createdAt: Date.now() - 7 * 60 * 1000,
        payment: { type: "PayPal", image: "/static/payment/paypal.svg" },
    },
    {
        id: nanoid(),
        total: 165.58,
        status: "Shipped",
        status_type: "success",
        createdAt: Date.now() - 8 * 60 * 1000,
        payment: { type: "Card", image: "/static/payment/master-card.svg" },
    },
    {
        id: nanoid(),
        total: 463.25,
        status: "Confirmed",
        status_type: "primary",
        createdAt: Date.now() - 9 * 60 * 1000,
        payment: { type: "Skrill", image: "/static/payment/skrill.svg" },
    },
    {
        id: nanoid(),
        total: 363.25,
        status: "Rejected",
        status_type: "error",
        createdAt: Date.now() - 10 * 60 * 1000,
        payment: { type: "Visa Card", image: "/static/payment/visa-2.svg" },
    },
];
const RecentOrders = () => {
    return (_jsxs(Card, { sx: { height: "100%" }, children: [_jsxs(FlexBetween, { p: 3, children: [_jsx(Paragraph, { fontSize: 18, fontWeight: 500, children: "Recent Orders" }), _jsx(MoreButton, { size: "small" })] }), _jsx(Scrollbar, { children: _jsxs(Table, { sx: { minWidth: 500 }, children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(HeadTableCell, { children: "METHOD" }), _jsx(HeadTableCell, { children: "CREATED" }), _jsx(HeadTableCell, { children: "TOTAL" }), _jsx(HeadTableCell, { align: "center", children: "STATUS" })] }) }), _jsx(TableBody, { children: DATA.map((item, index) => (_jsxs(TableRow, { children: [_jsx(BodyTableCell, { children: _jsxs(FlexBox, { gap: 2, children: [_jsx(FlexBox, { alignItems: "center", minWidth: 35, children: _jsx("img", { src: item.payment.image, alt: item.payment.type }) }), _jsxs("div", { children: [_jsxs(Paragraph, { color: "text.primary", fontWeight: 500, children: ["#", item.id.substring(0, 5)] }), _jsxs(Small, { children: ["Paid by ", item.payment.type] })] })] }) }), _jsx(BodyTableCell, { children: formatDistanceToNow(new Date(item.createdAt), {
                                            addSuffix: true,
                                        }) }), _jsxs(BodyTableCell, { children: ["$", item.total] }), _jsx(BodyTableCell, { align: "center", children: _jsx(StatusBadge, { type: item.status_type, children: item.status }) })] }, index))) })] }) })] }));
};
export default RecentOrders;

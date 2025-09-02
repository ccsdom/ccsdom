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
// CUSTOM DUMMY DATA SET
const DATA = [
    {
        id: nanoid(),
        status: "Delivered",
        status_type: "success",
        title: "Apple Watch",
        address: "Rome, Italy.",
        image: "/static/products/apple-watch.png",
        user: { name: "Astole Banne", balance: 560 },
    },
    {
        id: nanoid(),
        status: "Shipping",
        status_type: "primary",
        title: "Nike Shoes",
        address: "Bangkok, Singapore",
        image: "/static/products/shoe-1.png",
        user: { name: "Talon Abela", balance: 250.5 },
    },
    {
        id: nanoid(),
        status: "Delayed",
        status_type: "error",
        title: "Ribbon Glass",
        address: "Paris, France",
        image: "/static/products/sunglass.png",
        user: { name: "Tofan Andy", balance: 150.25 },
    },
    {
        id: nanoid(),
        status: "Delivered",
        status_type: "success",
        title: "Apple Watch",
        address: "New York, USA",
        image: "/static/products/headset.png",
        user: { name: "Jhon Ables", balance: 799.25 },
    },
];
const ShipmentHistory = () => {
    return (_jsxs(Card, { sx: { height: "100%" }, children: [_jsxs(FlexBetween, { p: 3, children: [_jsxs("div", { children: [_jsx(Paragraph, { lineHeight: 1, fontSize: 18, fontWeight: 500, children: "Shipment History" }), _jsx(Small, { color: "text.secondary", children: "50+ Active Shipments" })] }), _jsx(MoreButton, { size: "small" })] }), _jsx(Scrollbar, { children: _jsxs(Table, { sx: { minWidth: 600, mt: 1 }, children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(HeadTableCell, { children: "NAME & ID" }), _jsx(HeadTableCell, { children: "CLIENTS NAME" }), _jsx(HeadTableCell, { align: "center", children: "ADDRESS" }), _jsx(HeadTableCell, { align: "center", children: "STATUS" })] }) }), _jsx(TableBody, { children: DATA.map((item, index) => (_jsxs(TableRow, { children: [_jsx(BodyTableCell, { children: _jsxs(FlexBox, { gap: 2, children: [_jsx(Avatar, { src: item.image, alt: item.title }), _jsxs("div", { children: [_jsx(Paragraph, { color: "text.primary", fontWeight: 500, children: item.title }), _jsxs(Small, { children: ["#", item.id.substring(0, 10)] })] })] }) }), _jsxs(BodyTableCell, { children: [_jsx(Paragraph, { fontWeight: 500, color: "text.primary", children: item.user.name }), _jsxs(Small, { children: ["$", format(item.user.balance, "0,0.00")] })] }), _jsx(BodyTableCell, { align: "center", children: item.address }), _jsx(BodyTableCell, { align: "center", children: _jsx(StatusBadge, { type: item.status_type, children: item.status }) })] }, index))) })] }) })] }));
};
export default ShipmentHistory;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, Grid, Stack, Table, Alert, Button, Avatar, Divider, TableRow, TableBody, TableHead, IconButton, AlertTitle, LinearProgress, Chip, } from "@mui/material";
import Info from "@mui/icons-material/Info";
// CUSTOM ICON COMPONENTS
import Edit from "@/icons/Edit";
import Delete from "@/icons/Delete";
// CUSTOM COMPONENTS
import { Scrollbar } from "@/components/scrollbar";
import { FlexBetween } from "@/components/flexbox";
import NewAddressCard from "./common/NewAddressCard";
import { H6, Paragraph } from "@/components/typography";
import BillingAddressListItem from "./common/BillingAddressListItem";
// COMMON STYLED COMPONENTS
import { BodyTableCell, BodyTableCellV2, BodyTableRow, HeadTableCell, } from "./common/styles";
const Billing = () => {
    return (_jsxs(Card, { children: [_jsx(H6, { fontSize: 14, p: 3, children: "Billing" }), _jsx(Divider, {}), _jsxs(Box, { padding: 3, children: [_jsxs(Alert, { severity: "info", variant: "outlined", icon: _jsx(Info, {}), action: _jsx(Button, { children: "Add Payment Method" }), children: [_jsx(AlertTitle, { children: "We Need Your Attention" }), "Your payment was declined. To start using tools, please add Payment Method"] }), _jsxs(Stack, { spacing: 2.5, maxWidth: 400, py: 4, children: [_jsxs("div", { children: [_jsxs(FlexBetween, { mb: 0.5, children: [_jsx(Paragraph, { fontWeight: 500, children: "Users" }), _jsx(Paragraph, { fontWeight: 500, color: "primary.main", children: "50%" })] }), _jsx(LinearProgress, { value: 50, variant: "determinate" }), _jsx(Paragraph, { fontSize: 13, mt: 1, color: "text.secondary", children: "14 Users remaining until your plan requires update" })] }), _jsxs("div", { children: [_jsx(Paragraph, { fontWeight: 500, children: "Active until Dec 09, 2021" }), _jsx(Paragraph, { fontSize: 13, mt: 0.5, color: "text.secondary", children: "We will send you a notification upon Subscription expiration" })] }), _jsxs("div", { children: [_jsx(Paragraph, { fontWeight: 500, children: "$24.99 Per Month" }), _jsx(Paragraph, { fontSize: 13, mt: 0.5, color: "text.secondary", children: "Extended Pro Package. Up to 100 Agents & 25 Projects" })] })] }), _jsxs(Stack, { direction: "row", spacing: 3, children: [_jsx(Button, { variant: "contained", children: "Upgrade Plan" }), _jsx(Button, { variant: "outlined", children: "Cancel" })] })] }), _jsxs(Box, { my: 2, children: [_jsx(H6, { fontSize: 14, p: 3, pt: 0, children: "Payment Methods" }), _jsx(Scrollbar, { autoHide: false, children: _jsxs(Table, { sx: { minWidth: 700 }, children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(HeadTableCell, { children: "Card" }), _jsx(HeadTableCell, { children: "Name" }), _jsx(HeadTableCell, { children: "Expire Date" }), _jsx(HeadTableCell, { children: "Action" })] }) }), _jsx(TableBody, { children: [1, 2, 3].map((item) => (_jsxs(BodyTableRow, { children: [_jsx(BodyTableCell, { children: _jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(Avatar, { src: "/static/payment/paypal-with-bg.svg", sx: { borderRadius: "4px", height: 27 } }), _jsx(Paragraph, { fontWeight: 500, children: "Paypal **** 1679" })] }) }), _jsx(BodyTableCellV2, { children: "Marcus Morris" }), _jsx(BodyTableCellV2, { children: "09/24/2022" }), _jsxs(BodyTableCellV2, { children: [_jsx(IconButton, { size: "small", color: "inherit", children: _jsx(Edit, { fontSize: "small" }) }), _jsx(IconButton, { color: "inherit", children: _jsx(Delete, { fontSize: "small" }) })] })] }, item))) })] }) })] }), _jsxs(Box, { padding: 3, children: [_jsx(H6, { fontSize: 14, mb: 3, children: "Billing Address" }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(BillingAddressListItem, {}) }), _jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(BillingAddressListItem, {}) }), _jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(BillingAddressListItem, {}) }), _jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(NewAddressCard, {}) })] })] }), _jsxs(Box, { mb: 2, children: [_jsx(H6, { fontSize: 14, padding: 3, pt: 2, children: "Billing History" }), _jsx(Scrollbar, { autoHide: false, children: _jsxs(Table, { sx: { minWidth: 700 }, children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(HeadTableCell, { children: "Description" }), _jsx(HeadTableCell, { children: "Amount" }), _jsx(HeadTableCell, { children: "Invoice" }), _jsx(HeadTableCell, { children: "Date" }), _jsx(HeadTableCell, { children: "Action" })] }) }), _jsx(TableBody, { children: billingHistory.map((item) => (_jsxs(BodyTableRow, { children: [_jsx(BodyTableCellV2, { children: item.description }), _jsxs(BodyTableCellV2, { children: ["$", item.amount] }), _jsx(BodyTableCellV2, { children: _jsx(Chip, { label: item.invoice, color: "secondary", size: "small" }) }), _jsx(BodyTableCellV2, { children: item.date }), _jsxs(BodyTableCellV2, { children: [_jsx(IconButton, { children: _jsx(Edit, { fontSize: "small", sx: { color: "text.secondary" } }) }), _jsx(IconButton, { children: _jsx(Delete, { fontSize: "small", sx: { color: "text.secondary" } }) })] })] }, item.id))) })] }) })] })] }));
};
const billingHistory = [
    {
        id: 1,
        amount: 890,
        invoice: "PDF",
        date: "Nov 12, 2021",
        description: "Invoice for Octavia",
    },
    {
        id: 2,
        amount: 420,
        invoice: "DOC",
        date: "Nov 10, 2021",
        description: "Invoice for Uko",
    },
    {
        id: 3,
        amount: 590,
        invoice: "PDF",
        date: "Nov 24, 2021",
        description: "Invoice for Stocky",
    },
    {
        id: 4,
        amount: 750,
        invoice: "DOC",
        date: "Nov 19, 2021",
        description: "Invoice for Aatrox",
    },
    {
        id: 5,
        amount: 890,
        invoice: "PDF",
        date: "Nov 12, 2021",
        description: "Invoice for Octavia",
    },
];
export default Billing;

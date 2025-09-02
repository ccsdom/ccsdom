import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Chip, Card, Grid, Stack, Table, Button, styled, Divider, TableRow, TableBody, TableCell, TableHead, } from "@mui/material";
// CUSTOM COMPONENTS
import { Link } from "@/components/link";
import { Scrollbar } from "@/components/scrollbar";
import FlexBetween from "@/components/flexbox/FlexBetween";
import { H6, Paragraph, Span } from "@/components/typography";
// CUSTOM ICON COMPONENT
import DownloadTo from "@/icons/DownloadTo";
// CUSTOM UTILS METHODS
import { isDark } from "@/utils/constants";
import { numberFormat } from "@/utils/numberFormat";
// STYLED COMPONENTS
const HeadTableCell = styled(TableCell)(({ theme }) => ({
    padding: 0,
    fontWeight: 400,
    paddingBottom: 5,
    color: theme.palette.text.secondary,
    borderBottom: `1px solid ${theme.palette.divider}`,
    "&:last-of-type": { textAlign: "right" },
}));
const BodyTableCell = styled(TableCell)(({ theme }) => ({
    padding: "10px 0",
    color: theme.palette.text.primary,
    "&:last-of-type": { textAlign: "right", fontWeight: 500 },
    "&:first-of-type": { fontWeight: 500 },
}));
const StyledBox = styled("div")(({ theme }) => ({
    padding: 24,
    height: "100%",
    borderRadius: 8,
    backgroundColor: theme.palette.grey[isDark(theme) ? 700 : 100],
}));
const InvoiceDetailsPageView = () => {
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsx(Card, { sx: { padding: 3 }, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsxs(Grid, { item: true, md: 7, xs: 12, children: [_jsxs(FlexBetween, { children: [_jsx(Box, { width: 60, children: _jsx("img", { src: "/static/payment/FedEx_Express.svg", height: "36px", alt: "" }) }), _jsxs(Stack, { textAlign: "right", children: [_jsx(H6, { fontSize: 16, children: "Invoice #" }), _jsx(Paragraph, { children: "3682303" })] })] }), _jsxs(FlexBetween, { my: 3, children: [_jsxs(Stack, { spacing: 0.5, children: [_jsx(Paragraph, { fontWeight: 600, children: "Bill To:" }), _jsx(H6, { fontSize: 16, children: "Pixy Krovasky" }), _jsxs(Paragraph, { color: "text.secondary", children: ["8692 Wild Rose Drive ", _jsx("br", {}), " Livonia, MI 48150"] })] }), _jsxs(Paragraph, { lineHeight: 1.6, textAlign: "right", children: ["45 Roker Terrace ", _jsx("br", {}), " Latheronwheel ", _jsx("br", {}), " KW5 8NW, London", " ", _jsx("br", {}), " United Kingdom"] })] }), _jsxs(H6, { fontSize: 14, mb: 1, children: ["Issue Date:", " ", _jsx(Span, { sx: { color: "text.secondary", fontWeight: 400 }, children: "03/10/2018" })] }), _jsxs(H6, { fontSize: 14, children: ["Due date:", " ", _jsx(Span, { sx: { color: "text.secondary", fontWeight: 400 }, children: "07/10/2018" })] }), _jsx(Scrollbar, { children: _jsxs(Table, { sx: { mt: 3, minWidth: 375 }, children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(HeadTableCell, { children: "Description" }), _jsx(HeadTableCell, { children: "Hours" }), _jsx(HeadTableCell, { children: "Rate" }), _jsx(HeadTableCell, { children: "Amount" })] }) }), _jsxs(TableBody, { children: [_jsxs(TableRow, { children: [_jsx(BodyTableCell, { children: "Minimal Design" }), _jsx(BodyTableCell, { children: "80" }), _jsx(BodyTableCell, { children: "$40.00" }), _jsx(BodyTableCell, { children: "$3200.00" })] }), _jsxs(TableRow, { children: [_jsx(BodyTableCell, { children: "Logo Design" }), _jsx(BodyTableCell, { children: "32" }), _jsx(BodyTableCell, { children: "$50.00" }), _jsx(BodyTableCell, { children: "$2200.00" })] })] })] }) }), _jsx(Divider, {}), _jsxs(Stack, { mt: 3, spacing: 1, maxWidth: 200, marginLeft: "auto", children: [_jsxs(FlexBetween, { children: [_jsx(Paragraph, { fontWeight: 500, children: "Subtotal:" }), _jsxs(Paragraph, { fontWeight: 500, children: ["$ ", numberFormat(20600.0)] })] }), _jsxs(FlexBetween, { children: [_jsx(Paragraph, { fontWeight: 500, children: "Vat 0%:" }), _jsx(Paragraph, { fontWeight: 500, children: "$ 00.00" })] }), _jsxs(FlexBetween, { children: [_jsx(Paragraph, { fontWeight: 500, children: "Sub total 0%:" }), _jsxs(Paragraph, { fontWeight: 500, children: ["$ ", numberFormat(20600.0)] })] }), _jsxs(FlexBetween, { children: [_jsx(Paragraph, { fontWeight: 500, children: "Total:" }), _jsxs(Paragraph, { fontWeight: 500, children: ["$ ", numberFormat(20600.0)] })] })] }), _jsxs(Stack, { direction: "row", justifyContent: "flex-end", mt: 4, spacing: 2, children: [_jsx(Button, { variant: "outlined", color: "secondary", startIcon: _jsx(DownloadTo, {}), children: "PDF" }), _jsx(Button, { children: "Print Invoice" })] })] }), _jsx(Grid, { item: true, md: 5, xs: 12, children: _jsxs(StyledBox, { children: [_jsxs(Stack, { spacing: 2, direction: "row", alignItems: "center", children: [_jsx(Chip, { size: "small", color: "success", label: "Approved" }), _jsx(Chip, { size: "small", label: "Pending Payment" })] }), _jsxs(Stack, { mt: 3, spacing: 2, children: [_jsx(H6, { fontSize: 16, children: "Payment Details:" }), _jsx(ListItem, { text: "Paypal:", description: "UI.lib@gmail.com" }), _jsx(ListItem, { text: "Account:", description: "Nl24IBAN34553477847370033 AMB NLANBZTC" }), _jsx(ListItem, { text: "Payment Term:", description: "14 Days . Due in 7 days" })] }), _jsxs(Stack, { mt: 3, spacing: 2, children: [_jsx(H6, { fontSize: 16, children: "Payment Overview:" }), _jsx(ListItem, { text: "Project Name:", description: _jsxs(_Fragment, { children: ["UI Lib Dashboard ", _jsx(Link, { href: "#", children: "View Project" })] }) }), _jsx(ListItem, { text: "Completed By:", description: "UI.lib" }), _jsx(ListItem, { text: "Time Spent:", description: "120 Hours . 20$ / h rate" })] })] }) })] }) }) }));
};
// ==============================================================
function ListItem({ text, description, }) {
    return (_jsxs(Paragraph, { color: "text.secondary", children: [text, " ", _jsx("br", {}), _jsx(Span, { fontWeight: 500, color: "text.primary", children: description })] }));
}
export default InvoiceDetailsPageView;

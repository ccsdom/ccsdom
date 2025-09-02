import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, Grid, Stack, Table, styled, Button, Avatar, TableRow, useTheme, TableBody, TableCell, TableHead, IconButton, } from "@mui/material";
// CUSTOM COMPONENTS
import { Counter } from "@/components/counter";
import { Scrollbar } from "@/components/scrollbar";
import FlexBox from "@/components/flexbox/FlexBox";
import { H6, Paragraph, Span } from "@/components/typography";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
// CUSTOM PAGE SECTION COMPONENTS
import Stepper from "../Stepper";
import OrderSummery from "../OrderSummery";
// CUSTOM ICON COMPONENTS
import Clear from "@/icons/Clear";
import ChevronLeft from "@/icons/ChevronLeft";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
// STYLED COMPONENTS
const HeadTableCell = styled(TableCell)({
    padding: "10px 16px",
    "&:first-of-type": { paddingLeft: 24 },
    "&:last-of-type": { paddingRight: 24 },
});
const BodyTableCell = styled(HeadTableCell)({
    padding: "24px 16px",
    ":nth-of-type(1)": { minWidth: 250 },
    ":nth-of-type(2)": { minWidth: 120 },
});
const CartPageView = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, children: _jsx(Box, { mt: 3, maxWidth: 700, children: _jsx(Stepper, { stepNo: 0 }) }) }), _jsxs(Grid, { item: true, md: 8, xs: 12, children: [_jsxs(Card, { children: [_jsxs(H6, { fontSize: 16, p: 3, children: ["Cart", " ", _jsx(Span, { color: "text.secondary", fontSize: 14, fontWeight: 400, children: "(3 item)" })] }), _jsx(Scrollbar, { autoHide: false, children: _jsxs(Table, { sx: { minWidth: 600 }, children: [_jsx(TableHead, { sx: {
                                                    backgroundColor: isDark(theme) ? "grey.700" : "grey.100",
                                                }, children: _jsxs(TableRow, { children: [_jsx(HeadTableCell, { children: "Product" }), _jsx(HeadTableCell, { children: "Quantity" }), _jsx(HeadTableCell, { children: "Price" }), _jsx(HeadTableCell, { children: "Action" })] }) }), _jsx(TableBody, { children: [1, 2, 3].map((item) => (_jsxs(TableRow, { children: [_jsx(BodyTableCell, { children: _jsxs(FlexBox, { gap: 1.5, alignItems: "center", children: [_jsx(Avatar, { src: "/static/products/shoe-2.png", sx: { width: 65, height: 65, borderRadius: "10%" } }), _jsxs(Stack, { spacing: 0.3, children: [_jsx(H6, { color: "text.primary", fontSize: 16, children: "Nike Air Jordan" }), _jsxs(Paragraph, { children: ["Color: ", _jsx(Span, { color: "text.primary", children: "White" })] }), _jsxs(Paragraph, { children: ["Size: ", _jsx(Span, { color: "text.primary", children: "09" })] })] })] }) }), _jsxs(BodyTableCell, { children: [_jsx(Counter, {}), _jsx(Paragraph, { mt: 0.5, children: "Available: 12" })] }), _jsx(BodyTableCell, { children: _jsx(Paragraph, { color: "text.primary", children: "$230" }) }), _jsx(BodyTableCell, { children: _jsx(IconButton, { children: _jsx(Clear, { sx: { color: "text.secondary" } }) }) })] }, item))) })] }) })] }), _jsx(Box, { mt: 2, children: _jsx(Button, { disableRipple: true, variant: "text", startIcon: _jsx(ChevronLeft, {}), onClick: () => navigate("/dashboards/shop"), children: "Continue Shopping" }) })] }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(OrderSummery, { showCoupon: true, buttonText: "Check Out Now", handleClick: () => navigate("/dashboards/billing-address") }) })] }) }));
};
export default CartPageView;

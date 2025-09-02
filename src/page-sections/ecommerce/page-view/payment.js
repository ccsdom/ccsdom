import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Button, Card, Divider, Grid, IconButton, Radio, TextField, } from "@mui/material";
// CUSTOM COMPONENTS
import { FlexBetween, FlexBox } from "@/components/flexbox";
import { H6, Paragraph, Span } from "@/components/typography";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
// CUSTOM ICON COMPONENTS
import Edit from "@/icons/Edit";
import ChevronLeft from "@/icons/ChevronLeft";
// CUSTOM PAGE SECTION COMPONENTS
import Stepper from "../Stepper";
import OrderSummery from "../OrderSummery";
const PaymentPageView = () => {
    const navigate = useNavigate();
    const [selectPaymentMethod, setSelectPaymentMethod] = useState("paypal");
    const handleChangePaymentMethod = (event) => {
        setSelectPaymentMethod(event.target.value);
    };
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, children: _jsx(Box, { mt: 3, maxWidth: 700, children: _jsx(Stepper, { stepNo: 2 }) }) }), _jsxs(Grid, { item: true, md: 8, xs: 12, children: [_jsxs(Card, { sx: { padding: 3 }, children: [_jsx(H6, { fontSize: 16, mb: 3, children: "Payment Method" }), _jsxs(FlexBox, { alignItems: "center", children: [_jsx(Radio, { value: "paypal", onChange: handleChangePaymentMethod, checked: selectPaymentMethod === "paypal", sx: { paddingLeft: 0 } }), _jsx("img", { src: "/static/payment/paypal-text.svg", alt: "Paypal" })] }), _jsx(Divider, { sx: { my: 2 } }), _jsxs(FlexBox, { alignItems: "center", children: [_jsx(Radio, { value: "card", sx: { paddingLeft: 0 }, onChange: handleChangePaymentMethod, checked: selectPaymentMethod === "card" }), _jsxs(FlexBetween, { flexGrow: 1, children: [_jsx(Paragraph, { fontWeight: 500, children: "Credit or debit card" }), _jsxs(FlexBox, { gap: 1, children: [_jsx("img", { src: "/static/payment/visa.svg", alt: "Visa Card" }), _jsx("img", { src: "/static/payment/MasterCard.svg", alt: "Master Card" }), _jsx("img", { src: "/static/payment/AmericanExpress.svg", alt: "American Express" })] })] })] }), _jsx(Box, { mt: 2, mb: 3, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { label: "Card Number", fullWidth: true }) }), _jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(TextField, { label: "Exp Date", fullWidth: true }) }), _jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(TextField, { label: "CVC", fullWidth: true }) })] }) }), _jsx(Divider, { sx: { my: 2 } }), _jsxs(FlexBox, { alignItems: "center", children: [_jsx(Radio, { value: "cash", sx: { paddingLeft: 0 }, onChange: handleChangePaymentMethod, checked: selectPaymentMethod === "cash" }), _jsx(Paragraph, { fontWeight: 500, children: "Cash on Delivery" })] })] }), _jsx(Box, { mt: 2, children: _jsx(Button, { disableRipple: true, variant: "text", startIcon: _jsx(ChevronLeft, {}), onClick: () => navigate("/dashboard/billing-address"), children: "Back" }) })] }), _jsxs(Grid, { item: true, md: 4, xs: 12, children: [_jsxs(Card, { sx: { padding: 3, mb: 3 }, children: [_jsxs(FlexBetween, { mb: 1.5, children: [_jsx(H6, { fontSize: 16, children: "Billing Address" }), _jsx(IconButton, { children: _jsx(Edit, { sx: { fontSize: 16, color: "text.secondary" } }) })] }), _jsxs(Paragraph, { mb: 0.5, children: ["Office UI lib ", _jsx(Span, { color: "text.secondary", children: "(Home)" })] }), _jsxs(Paragraph, { color: "text.secondary", children: ["Ap #285-7193 Ullamcorper Avenue ", _jsx("br", {}), " Amesbury HI 93373 ", _jsx("br", {}), " US"] })] }), _jsx(OrderSummery, { buttonText: "Place Order", handleClick: () => navigate("/dashboard/payment-complete") })] })] }) }));
};
export default PaymentPageView;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, Grid, Stack, styled, TextField } from "@mui/material";
// CUSTOM COMPONENTS
import { H6, Paragraph } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// CUSTOM ICON COMPONENTS
import CircleOutlined from "@/icons/CircleOutlined";
import CheckCircleOutline from "@/icons/CheckCircleOutline";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
// STYLED COMPONENTS
const StyledCard = styled(Card)(({ theme }) => ({
    padding: "3rem",
    boxShadow: theme.shadows[0],
    border: `1px solid ${theme.palette.grey[isDark(theme) ? 700 : 100]}`,
}));
const CardWrapper = styled(Box, {
    shouldForwardProp: (prop) => prop !== "active",
})(({ theme, active }) => ({
    padding: 16,
    borderRadius: 8,
    cursor: "pointer",
    border: `1px solid ${theme.palette.divider}`,
    ...(active && { boxShadow: theme.shadows[4], border: 0 }),
}));
// ==============================================================
const CheckoutForm = ({ handleSelectedPayment, activeMethod }) => {
    return (_jsx(StyledCard, { sx: { p: 3 }, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsxs(Grid, { item: true, lg: 6, xs: 12, children: [_jsx(H6, { fontSize: 24, mb: 4, children: "Billing Address" }), _jsxs(Stack, { spacing: 2, children: [_jsx(TextField, { placeholder: "Person Name" }), _jsx(TextField, { placeholder: "Email Address" }), _jsx(TextField, { placeholder: "Phone No." }), _jsx(TextField, { placeholder: "Address" })] })] }), _jsxs(Grid, { item: true, lg: 6, xs: 12, children: [_jsx(H6, { fontSize: 24, mb: 4, children: "Payment Method" }), _jsxs(Stack, { spacing: 2, children: [_jsxs(CardWrapper, { component: FlexBetween, active: activeMethod("paypal") ? 1 : 0, onClick: () => handleSelectedPayment("paypal"), children: [_jsxs(FlexBox, { gap: 1, alignItems: "center", children: [activeMethod("paypal") ? (_jsx(CheckCircleOutline, { color: "primary" })) : (_jsx(CircleOutlined, {})), _jsx(Paragraph, { fontWeight: 500, children: "PayPal" })] }), _jsx("img", { src: "/static/payment/paypal.svg", alt: "paypal" })] }), _jsxs(CardWrapper, { active: activeMethod("card") ? 1 : 0, onClick: () => handleSelectedPayment("card"), children: [_jsxs(FlexBetween, { children: [_jsxs(FlexBox, { gap: 1, alignItems: "center", children: [activeMethod("card") ? (_jsx(CheckCircleOutline, { color: "primary" })) : (_jsx(CircleOutlined, {})), _jsx(Paragraph, { fontWeight: 500, children: "Credit/Debit" })] }), _jsxs(FlexBox, { gap: 1, alignItems: "center", children: [_jsx("img", { src: "/static/payment/master-card.svg", alt: "Master Card" }), _jsx("img", { src: "/static/payment/visa.svg", alt: "Visa Card" })] })] }), activeMethod("card") && (_jsxs(Box, { pt: 3, children: [_jsx(TextField, { fullWidth: true, placeholder: "Card No" }), _jsxs(FlexBox, { mt: 2, gap: 2, children: [_jsx(TextField, { fullWidth: true, placeholder: "Expiry Date" }), _jsx(TextField, { fullWidth: true, placeholder: "Card CVC" })] })] }))] })] })] })] }) }));
};
export default CheckoutForm;

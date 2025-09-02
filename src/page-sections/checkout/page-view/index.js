import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment, useState } from "react";
import { Box, Grid, Divider, Container } from "@mui/material";
// CUSTOM COMPONENTS
import Summery from "../Summery";
import CheckoutForm from "../CheckoutForm";
import { H1, Paragraph } from "@/components/typography";
const CheckoutPageView = () => {
    const [selectedPayment, setSelectedPayment] = useState("card");
    const activeMethod = (method) => selectedPayment === method;
    const handleSelectedPayment = (method) => setSelectedPayment(method);
    return (_jsxs(Fragment, { children: [_jsxs(Container, { maxWidth: "lg", sx: { my: 10 }, children: [_jsxs(Box, { textAlign: "center", mb: 6, children: [_jsx(H1, { fontSize: { sm: 52, xs: 42 }, children: "Checkout" }), _jsx(Paragraph, { fontSize: 18, color: "text.primary", children: "Complete Your Transaction in Just a Few Clicks." })] }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, lg: 8, md: 7, xs: 12, children: _jsx(CheckoutForm, { activeMethod: activeMethod, handleSelectedPayment: handleSelectedPayment }) }), _jsx(Grid, { item: true, lg: 4, md: 5, xs: 12, children: _jsx(Summery, {}) })] })] }), _jsx(Divider, {})] }));
};
export default CheckoutPageView;

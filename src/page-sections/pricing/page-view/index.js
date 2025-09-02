import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment } from "react";
import { Box, Grid, Stack, Switch, Divider, Container } from "@mui/material";
// CUSTOM COMPONENTS
import PricingCard from "../PricingCard";
import { H1, Paragraph } from "@/components/typography";
// CUSTOM DUMMY DATA
import { DATA } from "../data";
const PricingPageView = () => {
    return (_jsxs(Fragment, { children: [_jsxs(Container, { maxWidth: "lg", sx: { my: 8 }, children: [_jsxs(Box, { textAlign: "center", children: [_jsx(H1, { mb: 2, fontSize: { sm: 52, xs: 42 }, children: "Our Flexible Price Plan" }), _jsxs(Paragraph, { fontSize: 18, color: "text.secondary", children: ["Our Free Plan lets you get going right away. Switch ", _jsx("br", {}), " to a Pro plan to get more features."] }), _jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", justifyContent: "center", py: 6, children: [_jsx(Paragraph, { fontSize: 16, fontWeight: 500, children: "MONTHLY" }), _jsx(Switch, {}), _jsx(Paragraph, { fontSize: 16, fontWeight: 500, children: "YEARLY (Save 15%)" })] })] }), _jsx(Grid, { container: true, spacing: 4, children: DATA.map((item) => (_jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: _jsx(PricingCard, { icon: item.icon, price: item.price, title: item.title, popular: item.popular, features: item.features }) }, item.id))) })] }), _jsx(Divider, {})] }));
};
export default PricingPageView;

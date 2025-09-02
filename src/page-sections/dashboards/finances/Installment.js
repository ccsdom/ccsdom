import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, LinearProgress, Link } from "@mui/material";
// CUSTOM COMPONENTS
import { FlexBetween } from "@/components/flexbox";
import { Link as RouterLink } from "@/components/link";
import { Paragraph, Span } from "@/components/typography";
const Installment = () => {
    return (_jsxs(Card, { sx: { p: 3 }, children: [_jsxs(FlexBetween, { mb: 2.5, children: [_jsx(Paragraph, { fontSize: 18, fontWeight: 500, children: "Installment" }), _jsx(Link, { component: RouterLink, href: "/", color: "grey.400", fontWeight: 400, children: "View all" })] }), _jsx(Paragraph, { color: "grey.500", mb: 1, children: "Electricity Installments" }), _jsx(LinearProgress, { value: 60, variant: "determinate", sx: { height: 8 } }), _jsxs(FlexBetween, { mt: 0.5, children: [_jsx(Paragraph, { children: "Collected" }), _jsxs(Paragraph, { children: [_jsx(Span, { color: "text.secondary", children: "$200.00" }), " / $300.00"] })] })] }));
};
export default Installment;

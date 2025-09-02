import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Container, Grid } from "@mui/material";
// CUSTOM COMPONENTS
import { H1, Paragraph, Span } from "@/components/typography";
const Section1 = () => {
    return (_jsxs(Box, { mt: { sm: 10, xs: 8 }, children: [_jsx(Container, { maxWidth: "lg", children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, lg: 6, md: 7, xs: 12, children: _jsxs(H1, { fontSize: { sm: 48, xs: 42 }, fontWeight: 900, lineHeight: 1.2, children: ["We build bridges between", " ", _jsx(Span, { fontWeight: 700, fontStyle: "italic", children: "Companies and Customers" })] }) }), _jsx(Grid, { item: true, lg: 6, md: 5, xs: 12, children: _jsx(Paragraph, { height: "100%", display: "flex", alignItems: "end", color: "text.secondary", fontSize: { sm: 18, xs: 16 }, children: "To build software that gives customer-facing teams at small-and medium-sized businesses the ability to create fruitful and enduring relationships with customer" }) })] }) }), _jsx(Box, { component: "img", src: "/static/cover/about-hero.png", sx: { mt: 7, width: "100%" } })] }));
};
export default Section1;

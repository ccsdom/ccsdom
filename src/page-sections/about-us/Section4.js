import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Container, useMediaQuery } from "@mui/material";
// CUSTOM COMPONENTS
import { Carousel } from "@/components/carousel";
import { H1, Paragraph } from "@/components/typography";
const Section4 = () => {
    const isSmallDevice = useMediaQuery((theme) => theme.breakpoints.down("sm"));
    return (_jsx(Box, { bgcolor: "grey.50", py: 10, children: _jsxs(Container, { maxWidth: "lg", children: [_jsx(H1, { textAlign: "center", fontSize: { sm: 52, xs: 42 }, mb: 6, children: "What Our Customer Says" }), _jsx(Carousel, { grabCursor: true, navigation: isSmallDevice ? false : true, slidesPerView: 1, children: [1, 2, 3, 4, 5].map((item) => (_jsxs(Box, { p: 2, textAlign: "center", maxWidth: 800, margin: "auto", children: [_jsx("img", { src: "/static/quotation.svg", alt: "Quotation" }), _jsx(Paragraph, { mt: 2, mb: 6, fontWeight: 500, fontSize: { sm: 24, xs: 18 }, children: "Essence Admin Template is a user-friendly website template with a modern design and responsive layout. It offers pre-built customizable components and modules to create a unique admin interface for your web applications." }), _jsx(Box, { margin: "auto", boxShadow: 2, mb: 4, width: 100, height: 100, borderRadius: "50%", children: _jsx("img", { src: "/static/user/user-24.png", alt: "Quotation", width: "100%" }) }), _jsx(Paragraph, { fontWeight: 600, fontSize: 18, children: "Lucian Obrien" }), _jsx(Paragraph, { color: "text.secondary", children: "UX Designer" })] }, item))) })] }) }));
};
export default Section4;

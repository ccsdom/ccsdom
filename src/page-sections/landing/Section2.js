import { createElement as _createElement } from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, Container, Grid, Stack } from "@mui/material";
// CUSTOM COMPONENTS
import { H2, H6, Paragraph } from "@/components/typography";
// DUMMY DATA
const LIST_1 = [
    {
        id: 1,
        image: "/static/landing/icons/award.svg",
        title: "Crafted by Professionals",
        description: `Expertly crafted by professionals with an in-depth understanding of developer challenges.`,
    },
    {
        id: 2,
        image: "/static/landing/icons/logos.svg",
        title: "Modern Technologies",
        description: `Expertly crafted by professionals with an in-depth understanding of developer challenges.`,
    },
    {
        id: 3,
        image: "/static/landing/icons/check_bucket.svg",
        title: "Clean Code",
        description: `Expertly crafted by professionals with an in-depth understanding of developer challenges.`,
    },
];
const LIST_2 = [
    {
        id: 1,
        image: "/static/landing/icons/brush.svg",
        title: "Design Files",
        description: `Expertly crafted by professionals with an in-depth understanding of developer challenges.`,
    },
    {
        id: 2,
        image: "/static/landing/icons/recovery.svg",
        title: "Flexible Structure",
        description: `Expertly crafted by professionals with an in-depth understanding of developer challenges.`,
    },
    {
        id: 3,
        image: "/static/landing/icons/paint_bucket.svg",
        title: "Easy to Customize",
        description: `Expertly crafted by professionals with an in-depth understanding of developer challenges.`,
    },
];
const Section2 = () => {
    return (_jsx(Container, { maxWidth: "lg", sx: { mt: { sm: 12, xs: 6 } }, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, lg: 5, children: _jsxs(Box, { maxWidth: 450, position: "sticky", top: 0, pt: 4, children: [_jsx(H2, { fontSize: 36, children: "Core Features" }), _jsx(Paragraph, { mt: 1, fontSize: 18, color: "text.secondary", children: "Save thousands of development hours with Essence\u2019s well crafted features and clean code" })] }) }), _jsxs(Grid, { lg: 7, container: true, item: true, spacing: 4, children: [_jsx(Grid, { item: true, lg: 6, xs: 12, children: _jsx(Stack, { mt: { lg: 12, xs: 6 }, spacing: { md: 4, xs: 3 }, direction: { lg: "column", md: "row", xs: "column" }, children: LIST_1.map((item) => (_createElement(FeatureCard, { ...item, key: item.id }))) }) }), _jsx(Grid, { item: true, lg: 6, xs: 12, children: _jsx(Stack, { spacing: { md: 4, xs: 3 }, direction: { lg: "column", md: "row", xs: "column" }, children: LIST_2.map((item) => (_createElement(FeatureCard, { ...item, key: item.id }))) }) })] })] }) }));
};
// ==============================================================
function FeatureCard(props) {
    return (_jsxs(Card, { sx: { padding: { xl: 6, lg: 5, md: 4, xs: 6 }, textAlign: "center" }, children: [_jsx(Box, { component: "img", src: props.image, alt: "award", py: 6 }), _jsx(H6, { fontSize: 18, children: props.title }), _jsx(Paragraph, { fontSize: 16, color: "grey.500", mt: 2, children: props.description })] }));
}
export default Section2;

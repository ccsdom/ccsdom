import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, Grid, styled } from "@mui/material";
import { KeyboardArrowRight } from "@mui/icons-material";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
// CUSTOM COMPONENTS
import { H1, Paragraph } from "@/components/typography";
import { FlexBox, FlexRowAlign } from "@/components/flexbox";
// STYLED COMPONENT
const ProgressWrapper = styled(FlexBox)(({ theme }) => ({
    "& .CircularProgressbar": {
        ".CircularProgressbar-path": { stroke: theme.palette.grey[500] },
        ".CircularProgressbar-trail": { stroke: theme.palette.grey[200] },
        ".CircularProgressbar-text": {
            fontWeight: 600,
            fill: theme.palette.grey[900],
            fontFamily: theme.typography.fontFamily,
        },
    },
}));
const Section2 = () => {
    return (_jsx(Box, { bgcolor: "white", py: 10, children: _jsxs(Grid, { container: true, spacing: 3, alignItems: "center", children: [_jsxs(Grid, { item: true, xl: 5, lg: 4, children: [_jsx(H1, { fontSize: { sm: 52, xs: 42 }, mb: 3, children: "Who we are?" }), _jsx(Paragraph, { fontSize: 16, color: "text.secondary", pr: 7, children: "Essence is a pre-designed UI used to build web app front-ends. It includes ready-to-use components like menus, charts, tables, and forms for efficient UI design and development." }), _jsxs(ProgressWrapper, { my: 6, alignItems: "center", gap: 4, children: [_jsxs(FlexRowAlign, { flexDirection: "column", gap: 1, maxWidth: 80, children: [_jsx(CircularProgressbar, { value: 70, text: `${70}%`, maxValue: 100, strokeWidth: 6 }), _jsx(Paragraph, { fontWeight: 500, children: "Design" })] }), _jsxs(FlexRowAlign, { flexDirection: "column", gap: 1, maxWidth: 80, children: [_jsx(CircularProgressbar, { value: 56, text: `${56}%`, maxValue: 100, strokeWidth: 6 }), _jsx(Paragraph, { fontWeight: 500, children: "Development" })] }), _jsxs(FlexRowAlign, { flexDirection: "column", gap: 1, maxWidth: 80, children: [_jsx(CircularProgressbar, { value: 30, text: `${30}%`, maxValue: 100, strokeWidth: 6 }), _jsx(Paragraph, { fontWeight: 500, children: "Marketing" })] })] }), _jsxs(Button, { variant: "outlined", color: "primary", children: ["Check our Work ", _jsx(KeyboardArrowRight, {})] })] }), _jsx(Grid, { item: true, xl: 7, lg: 8, children: _jsxs(FlexBox, { alignItems: "end", gap: 3, flexWrap: { md: "nowrap", xs: "wrap" }, children: [_jsx(Box, { alt: "about", width: "100%", component: "img", borderRadius: 4, src: "/static/cover/about-1.jpg" }), _jsx(Box, { alt: "about", width: "100%", component: "img", borderRadius: 4, src: "/static/cover/about-2.jpg" })] }) })] }) }));
};
export default Section2;

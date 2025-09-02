import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, Card, Grid } from "@mui/material";
// CUSTOM COMPONENTS
import { FlexBox } from "@/components/flexbox";
import { Paragraph } from "@/components/typography";
const QuickGuide = () => {
    return (_jsx(Card, { sx: { p: 3 }, children: _jsxs(Grid, { container: true, spacing: 3, alignItems: "center", children: [_jsx(Grid, { item: true, sm: 5, xs: 12, children: _jsx(Box, { maxWidth: 260, margin: "auto", children: _jsx(Box, { width: "100%", display: "block", component: "img", src: "/static/illustration/quick-gude.svg" }) }) }), _jsx(Grid, { item: true, sm: 7, xs: 12, children: _jsxs(Box, { p: 2, children: [_jsx(Paragraph, { lineHeight: 1.3, fontSize: 22, fontWeight: 600, children: "Logistics is simple but not easy." }), _jsx(Paragraph, { mt: 1, color: "text.secondary", children: "The information about package is as important as the delivery package itself." }), _jsxs(FlexBox, { mt: 6, gap: 2, children: [_jsx(Button, { children: "Start Now" }), _jsx(Button, { color: "secondary", children: "Quick Guide" })] })] }) })] }) }));
};
export default QuickGuide;

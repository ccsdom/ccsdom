import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, LinearProgress, Rating, Stack } from "@mui/material";
// CUSTOM COMPONENTS
import { Paragraph } from "@/components/typography";
import { FlexBetween, FlexBox, FlexRowAlign } from "@/components/flexbox";
const CustomerReview = () => {
    return (_jsxs(Card, { sx: { p: 3, height: "100%" }, children: [_jsxs(FlexRowAlign, { p: 3, borderRadius: 2, flexDirection: "column", bgcolor: "action.selected", children: [_jsx(Rating, { size: "large", name: "read-only", value: 4.5, precision: 0.5, readOnly: true }), _jsx(Paragraph, { py: 1, lineHeight: 1, fontWeight: 600, fontSize: 20, children: "4.5/5" }), _jsx(Paragraph, { color: "text.secondary", children: "Total 650 customer review" })] }), _jsx(Stack, { spacing: 3, mt: 4, children: [5, 4, 3, 2, 1].map((item) => (_jsxs(FlexBetween, { gap: 4, children: [_jsxs(FlexBox, { gap: 1, flex: 1, alignItems: "center", children: [_jsxs(Paragraph, { color: "text.secondary", lineHeight: 1, children: [item, " Star"] }), _jsx(LinearProgress, { value: item * 20, variant: "determinate" })] }), _jsxs(Paragraph, { lineHeight: 1, color: "text.secondary", children: [item, "0%"] })] }, item))) })] }));
};
export default CustomerReview;

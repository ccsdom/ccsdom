import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, LinearProgress } from "@mui/material";
// CUSTOM COMPONENTS
import { Percentage } from "@/components/percentage";
import { FlexBetween, FlexBox } from "@/components/flexbox";
import { H6, Paragraph, Span } from "@/components/typography";
// CUSTOM UTILS METHOD
import { numberFormat } from "@/utils/numberFormat";
const Earnings = () => {
    return (_jsxs(Card, { sx: {
            padding: 3,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
        }, children: [_jsxs("div", { children: [_jsxs(FlexBox, { alignItems: "center", gap: 1, children: [_jsxs(H6, { children: [_jsx(Span, { fontWeight: 500, fontSize: 18, color: "grey.400", children: "$" }), numberFormat(20360)] }), _jsx(Percentage, { type: "error", children: "-2.2%" })] }), _jsx(Paragraph, { color: "text.secondary", children: "Monthly Earnings" })] }), _jsxs(Box, { mt: 7, children: [_jsxs(FlexBetween, { mb: 1, children: [_jsx(Paragraph, { fontWeight: 600, children: "$25,000 to Goal" }), _jsx(Paragraph, { color: "text.secondary", children: "78%" })] }), _jsx(LinearProgress, { value: 60, variant: "determinate", sx: { height: 8 } })] })] }));
};
export default Earnings;

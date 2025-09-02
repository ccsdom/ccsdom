import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, LinearProgress } from "@mui/material";
// CUSTOM COMPONENTS
import { Percentage } from "@/components/percentage";
import { H6, Paragraph } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// CUSTOM UTILS METHOD
import { numberFormat } from "@/utils/numberFormat";
const Order = () => {
    return (_jsxs(Card, { sx: {
            padding: 3,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
        }, children: [_jsxs("div", { children: [_jsxs(FlexBox, { alignItems: "center", gap: 1, children: [_jsx(H6, { children: numberFormat(1352) }), _jsx(Percentage, { type: "error", children: "-2.2%" })] }), _jsx(Paragraph, { color: "text.secondary", children: "Order This Month" })] }), _jsxs(Box, { mt: 7, children: [_jsxs(FlexBetween, { mb: 1, children: [_jsx(Paragraph, { fontWeight: 600, children: "1,500 to Goal" }), _jsx(Paragraph, { color: "text.secondary", children: "75%" })] }), _jsx(LinearProgress, { value: 60, color: "success", variant: "determinate", sx: { height: 8 } })] })] }));
};
export default Order;

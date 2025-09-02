import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { alpha, Card, IconButton, LinearProgress, Stack, } from "@mui/material";
// CUSTOM COMPONENTS
import { H3, H6, Paragraph } from "@/components/typography";
import { FlexBetween, FlexBox, FlexRowAlign } from "@/components/flexbox";
// CUSTOM ICON COMPONENT
import MoreHorizontal from "@/icons/MoreHorizontal";
// CUSTOM UTILS METHOD
import { numberFormat } from "@/utils/numberFormat";
// ====================================================================
const CampaignCard = ({ Icon, title, color, amount, impression, progressValue, }) => {
    return (_jsxs(Card, { sx: { padding: 3 }, children: [_jsxs(FlexBetween, { children: [_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(FlexRowAlign, { width: 30, height: 30, borderRadius: 1, bgcolor: alpha(color, 0.1), children: _jsx(Icon, { sx: { fontSize: 18, color } }) }), _jsx(H6, { fontSize: 14, color: "text.secondary", children: title })] }), _jsx(IconButton, { children: _jsx(MoreHorizontal, { fontSize: "small", sx: { color: "text.secondary" } }) })] }), _jsxs(FlexBetween, { my: 2, children: [_jsxs(H3, { fontSize: 24, children: ["$", numberFormat(amount)] }), _jsxs(FlexBox, { alignItems: "center", gap: 1, children: [_jsxs(Paragraph, { fontWeight: 600, color: impression > 0 ? "success.main" : "error.main", children: [impression, "%"] }), _jsx(Paragraph, { color: "text.secondary", children: "Subscriber growth" })] })] }), _jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, children: [_jsx(LinearProgress, { value: progressValue, variant: "determinate", sx: { "& .MuiLinearProgress-bar": { backgroundColor: color } } }), _jsxs(H6, { fontSize: 14, children: [progressValue, "%"] })] })] }));
};
export default CampaignCard;

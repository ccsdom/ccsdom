import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, Button, Card, Stack } from "@mui/material";
import Add from "@mui/icons-material/Add";
// CUSTOM COMPONENTS
import { H6, Small } from "@/components/typography";
import FlexBetween from "@/components/flexbox/FlexBetween";
// CUSTOM ICON COMPONENTS
import ChartBar4 from "@/icons/ChartBar4";
import DollarOutlined from "@/icons/DollarOutlined";
import { numberFormat } from "@/utils/numberFormat";
// ====================================================================
const ConnectionCard = ({ img, name, position, connected, }) => {
    return (_jsxs(Card, { sx: {
            padding: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        }, children: [_jsx(Avatar, { src: img }), _jsx(H6, { fontSize: 14, mt: 1.5, children: name }), _jsx(Small, { color: "text.secondary", children: position }), _jsxs(Stack, { width: "100%", maxWidth: "80%", children: [_jsxs(FlexBetween, { mb: 3, children: [_jsx(AmountCard, { Icon: DollarOutlined, title: "Avg Income", amount: 14500 }), _jsx(AmountCard, { Icon: ChartBar4, title: "Avg Income", amount: 26500 })] }), _jsx(Button, { fullWidth: true, color: connected ? "primary" : "secondary", variant: connected ? "contained" : "outlined", startIcon: _jsx(Add, {}), children: connected ? "Connected" : "Connect" })] })] }));
};
export default ConnectionCard;
// =====================================================================
function AmountCard({ Icon, amount, title }) {
    return (_jsxs(Stack, { mt: 2, alignItems: "center", sx: {
            padding: 2,
            width: "47%",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
        }, children: [_jsx(Icon, { sx: { color: "text.secondary" } }), _jsxs(H6, { fontSize: 14, mt: 0.5, children: ["$", numberFormat(amount)] }), _jsx(Small, { color: "grey.500", children: title })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Chip, Stack, Button, Divider } from "@mui/material";
import GppGoodOutlined from "@mui/icons-material/GppGoodOutlined";
// CUSTOM COMPONENTS
import { H6, Paragraph } from "@/components/typography";
import { FlexBetween } from "@/components/flexbox";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
const Summery = () => {
    return (_jsxs(Card, { sx: {
            padding: 4,
            boxShadow: 0,
            backgroundColor: (theme) => (isDark(theme) ? "grey.800" : "grey.100"),
        }, children: [_jsx(H6, { fontSize: 24, mb: 2.5, children: "Summary" }), _jsxs(Stack, { spacing: 1.7, mb: 3, children: [_jsx(ListItem, { title: "Subscription", value: _jsx(Chip, { label: "Starter" }) }), _jsx(ListItem, { title: "Billed in month", value: "$14.00" }), _jsx(Divider, {}), _jsx(ListItem, { title: "Total Bill", value: "$14.00" }), _jsx(ListItem, { title: "Taxes", value: "$1.00" }), _jsx(Divider, {}), _jsx(ListItem, { title: "Total Billed", value: _jsx(Paragraph, { fontSize: 24, fontWeight: 600, children: "$15.00" }) })] }), _jsx(Button, { fullWidth: true, children: "Upgrade Plan" }), _jsxs(Paragraph, { pt: 3, pb: 1, gap: 0.5, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", children: [_jsx(GppGoodOutlined, { sx: { fontSize: 16, color: "success.main" } }), " Secure credit card payment"] }), _jsx(Paragraph, { textAlign: "center", color: "text.secondary", children: "This is a secure encrypted payment" })] }));
};
export default Summery;
function ListItem({ title, value, }) {
    return (_jsxs(FlexBetween, { children: [_jsx(Paragraph, { fontSize: 16, fontWeight: 500, color: "text.secondary", children: title }), typeof value === "string" ? (_jsx(Paragraph, { fontSize: 16, fontWeight: 500, children: value })) : (value)] }));
}

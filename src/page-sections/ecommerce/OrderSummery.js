import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Card, Divider, IconButton, Stack, TextField, } from "@mui/material";
// CUSTOM COMPONENTS
import { FlexBetween, FlexBox } from "@/components/flexbox";
import { H6, Paragraph } from "@/components/typography";
// CUSTOM ICON COMPONENTS
import ShoppingCart from "@/icons/ShoppingCart";
import Edit from "@/icons/Edit";
// ===================================================================
const OrderSummery = ({ showCoupon, showEditBtn, buttonText, handleClick, }) => {
    return (_jsxs(Card, { sx: { padding: 3 }, children: [_jsxs(FlexBetween, { mb: 4, children: [_jsx(H6, { fontSize: 16, children: "Order Summery" }), showEditBtn && (_jsx(IconButton, { children: _jsx(Edit, { sx: { fontSize: 16, color: "text.secondary" } }) }))] }), _jsxs(Stack, { spacing: 1.5, mb: 5, children: [_jsx(ListItem, { title: "Items", value: 230 }), _jsx(ListItem, { title: "VATS 0%", value: 0 }), _jsx(ListItem, { title: "Sub Total", value: 230 }), _jsx(Divider, {}), _jsx(ListItem, { title: "Total", value: 230, valueColor: "error.main" })] }), showCoupon && (_jsxs(FlexBox, { gap: 1, mb: 3, children: [_jsx(TextField, { size: "small", placeholder: "Apply Coupon", fullWidth: true }), _jsx(Button, { sx: { px: 4 }, children: "Apply" })] })), _jsx(Button, { variant: "contained", startIcon: _jsx(ShoppingCart, {}), fullWidth: true, onClick: handleClick, children: buttonText })] }));
};
export default OrderSummery;
// -----------------------------------------------------------------------------
function ListItem({ title, value, valueColor }) {
    return (_jsxs(FlexBetween, { children: [_jsx(Paragraph, { children: title }), _jsxs(Paragraph, { color: valueColor, children: ["$", value] })] }));
}

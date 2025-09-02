import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, IconButton, Stack } from "@mui/material";
// CUSTOM COMPONENTS
import { Paragraph } from "@/components/typography";
// CUSTOM ICON COMPONENTS
import Edit from "@/icons/Edit";
import Delete from "@/icons/Delete";
import HomeOutlined from "@/icons/HomeOutlined";
const BillingAddressListItem = () => {
    return (_jsxs(Card, { sx: {
            border: 1,
            padding: 2,
            display: "flex",
            boxShadow: "none",
            alignItems: "center",
            borderColor: "divider",
            justifyContent: "space-between",
        }, children: [_jsxs(Box, { maxWidth: "60%", children: [_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(HomeOutlined, { sx: { color: "grey.400" } }), _jsx(Paragraph, { fontWeight: 500, children: "Home" })] }), _jsx(Paragraph, { mt: 1, color: "grey.500", children: "Ap #285-7193 Ullamcorper Avenue Amesbury HI 93373 US" })] }), _jsxs(Stack, { direction: "row", children: [_jsx(IconButton, { children: _jsx(Edit, { fontSize: "small", sx: { color: "text.secondary" } }) }), _jsx(IconButton, { children: _jsx(Delete, { fontSize: "small", sx: { color: "text.secondary" } }) })] })] }));
};
export default BillingAddressListItem;

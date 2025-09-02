import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, IconButton } from "@mui/material";
// CUSTOM COMPONENTS
import FlexBox from "@/components/flexbox/FlexBox";
import { H6, Paragraph } from "@/components/typography";
// CUSTOM ICON COMPONENTS
import City from "@/icons/City";
import Delete from "@/icons/Delete";
import CheckmarkCircle from "@/icons/CheckmarkCircle";
// ===================================================================
const BillingAddressCard = ({ selected }) => {
    return (_jsxs(Card, { sx: {
            padding: 2,
            display: "flex",
            alignItems: "center",
            borderColor: "primary.main",
            justifyContent: "space-between",
            border: selected ? "1px solid" : 0,
        }, children: [_jsxs("div", { children: [_jsxs(FlexBox, { alignItems: "center", gap: 1, mb: 1, children: [_jsx(City, { sx: { color: selected ? "primary.main" : "text.secondary" } }), _jsx(H6, { fontSize: 16, children: "Office" })] }), _jsxs(Paragraph, { color: "text.secondary", lineHeight: 1.8, children: ["Ap #285-7193 Ullamcorper Avenue ", _jsx("br", {}), " Amesbury HI 93373 ", _jsx("br", {}), " USA"] })] }), selected ? (_jsx(Box, { padding: 1, children: _jsx(CheckmarkCircle, { sx: { color: "primary.main" } }) })) : (_jsx(IconButton, { children: _jsx(Delete, { sx: { color: "text.secondary" } }) }))] }));
};
export default BillingAddressCard;

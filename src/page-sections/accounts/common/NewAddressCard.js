import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Card, Box, useTheme } from "@mui/material";
// CUSTOM COMPONENTS
import { H6, Small } from "@/components/typography";
const NewAddressCard = () => {
    const { palette } = useTheme();
    return (_jsxs(Card, { sx: {
            padding: 2,
            height: "100%",
            minHeight: 100,
            display: "flex",
            boxShadow: "none",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: palette.mode === "dark" ? "grey.700" : "grey.100",
        }, children: [_jsxs(Box, { maxWidth: "60%", children: [_jsx(H6, { fontSize: 14, children: "Enter a new address" }), _jsx(Small, { color: "grey.500", children: "Add your new destination.." })] }), _jsx(Button, { variant: "contained", children: "New Address" })] }));
};
export default NewAddressCard;

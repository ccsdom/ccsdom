import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Card, CardContent, CardMedia, Checkbox, IconButton, styled, } from "@mui/material";
// CUSTOM COMPONENTS
import { FlexBetween, FlexBox } from "@/components/flexbox";
import { H6, Paragraph } from "@/components/typography";
// CUSTOM ICON COMPONENTS
import Delete from "@/icons/Delete";
import Edit from "@/icons/Edit";
// STYLED COMPONENT
const StyledIconButton = styled(IconButton)(({ theme }) => {
    const backgroundColor = theme.palette.background.default;
    return { backgroundColor, "&:hover": { backgroundColor } };
});
// ==============================================================
const ProductCard = ({ item }) => {
    const [checked, setChecked] = useState(false);
    const handleChange = (event) => {
        setChecked(event.target.checked);
    };
    return (_jsxs(Card, { sx: { position: "relative" }, children: [_jsx(Box, { sx: {
                    height: 200,
                    width: "100%",
                    overflow: "hidden",
                    position: "relative",
                    "& img": { transition: "all 0.3s" },
                    "&:hover img": { transform: "scale(1.2)" },
                    "&::after": {
                        top: 0,
                        opacity: 0.5,
                        width: "100%",
                        content: '""',
                        height: "100%",
                        position: "absolute",
                        transition: "background-color 0.2s",
                        backgroundColor: checked ? "primary.100" : "transparent",
                    },
                }, children: _jsx(CardMedia, { component: "img", alt: "Product Image", image: item.image, width: "100%", height: "100%" }) }), _jsxs(FlexBetween, { alignItems: "flex-start", sx: { position: "absolute", width: "100%", top: 0, padding: 1.5 }, children: [_jsx(Checkbox, { checked: checked, onChange: handleChange }), checked && (_jsxs(FlexBox, { gap: 1, children: [_jsx(StyledIconButton, { children: _jsx(Edit, { sx: { fontSize: 12, color: "text.secondary" } }) }), _jsx(StyledIconButton, { children: _jsx(Delete, { sx: { fontSize: 12, color: "text.secondary" } }) })] }))] }), _jsxs(CardContent, { sx: { textAlign: "center", "&:last-child": { pb: 2 } }, children: [_jsx(H6, { fontSize: 14, mb: 0.5, children: item.name }), _jsxs(Paragraph, { color: "text.secondary", children: ["$", item.price] })] })] }));
};
export default ProductCard;

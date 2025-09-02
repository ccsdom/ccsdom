import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Card, Chip, Grid, Stack, Button, styled, TextField, IconButton, RadioGroup, } from "@mui/material";
import { CarouselProvider, Dot, Image, Slide, Slider, } from "pure-react-carousel";
// CUSTOM COMPONENTS
import { Counter } from "@/components/counter";
import FlexBox from "@/components/flexbox/FlexBox";
import { ColorRadio } from "@/components/color-radio";
import { H2, H6, Paragraph } from "@/components/typography";
// CUSTOM ICON COMPONENTS
import Heart from "@/icons/Heart";
import Twitter from "@/icons/Twitter";
import Facebook from "@/icons/Facebook";
import Instagram from "@/icons/Instagram";
import ChevronDown from "@/icons/ChevronDown";
// STYLED COMPONENTS
const StyledCarouselProvider = styled(CarouselProvider)(({ theme }) => ({
    display: "flex",
    position: "relative",
    "& .carousel__slider": { flexGrow: 1, marginLeft: 10 },
    "& .carousel__slide-focus-ring": { display: "none" },
    "& button": { border: "none !important", opacity: 0.5 },
    "& button:disabled": {
        opacity: 1,
        position: "relative",
        "&::after": {
            left: 0,
            height: 3,
            bottom: -6,
            content: '""',
            width: "100%",
            position: "absolute",
            backgroundColor: theme.palette.primary.main,
        },
    },
    [theme.breakpoints.down("sm")]: {
        flexDirection: "column-reverse",
        "& .carousel__slider": { marginLeft: 0 },
    },
}));
const StyledStack = styled(Stack)(({ theme }) => ({
    [theme.breakpoints.down("sm")]: {
        marginTop: 10,
        flexDirection: "row",
        "& .carousel__dot": { marginTop: 0, marginRight: 8 },
    },
}));
const StyledIconButton = styled(IconButton)(({ theme }) => ({
    top: 10,
    right: 10,
    position: "absolute",
    backgroundColor: theme.palette.grey[400],
    "&:hover": { backgroundColor: theme.palette.grey[400] },
}));
const ProductViewCard = () => {
    const [colorSelect, setColorSelect] = useState("red");
    // HANDLE CHANGE PRODUCT COLOR
    const handleChangeColor = (event) => {
        setColorSelect(event.target.value);
    };
    return (_jsx(Card, { sx: { padding: 2 }, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, md: 7, xs: 12, children: _jsxs(StyledCarouselProvider, { totalSlides: 3, dragEnabled: false, naturalSlideWidth: 100, naturalSlideHeight: 75, children: [_jsx(StyledStack, { spacing: 3, children: [0, 1, 2].map((item) => (_jsx(Dot, { slide: item, style: { width: 60, height: 55 }, children: _jsx(Box, { component: Image, hasMasterSpinner: true, src: "/static/products/shoe-10.png", sx: { objectFit: "cover", borderRadius: 1 } }) }, item))) }), _jsx(Slider, { children: [0, 1, 2].map((item) => (_jsx(Slide, { index: item, className: "slide", children: _jsx(Box, { component: Image, hasMasterSpinner: true, src: "/static/products/shoe-10.png", sx: { objectFit: "cover", borderRadius: 2 } }) }, item))) }), _jsx(StyledIconButton, { children: _jsx(Heart, {}) })] }) }), _jsxs(Grid, { item: true, md: 5, children: [_jsx(Chip, { color: "success", size: "small", label: "In Stock" }), _jsx(Paragraph, { color: "text.secondary", mt: 2, children: "NIKE" }), _jsx(H6, { children: "Air Jordan 270" }), _jsx(H2, { color: "primary.main", my: 2, children: "$350" }), _jsxs(FlexBox, { alignItems: "center", gap: 3, children: [_jsx(H6, { fontSize: 16, children: "Colors:" }), _jsxs(RadioGroup, { row: true, value: colorSelect, onChange: handleChangeColor, sx: { gap: 1 }, children: [_jsx(ColorRadio, { value: "red", icon_color: "#FF316F" }), _jsx(ColorRadio, { value: "pumpkin", icon_color: "#FE8969" }), _jsx(ColorRadio, { value: "purple", icon_color: "#8C8DFF" }), _jsx(ColorRadio, { value: "green", icon_color: "#27CE88" })] })] }), _jsxs(FlexBox, { alignItems: "center", gap: 3, mt: 3, children: [_jsx(H6, { fontSize: 16, children: "Select size:" }), _jsxs(TextField, { select: true, size: "small", variant: "outlined", SelectProps: { native: true, IconComponent: ChevronDown }, sx: { ".MuiNativeSelect-select": { lineHeight: 1 } }, children: [_jsx("option", { value: "42", children: "42" }), _jsx("option", { value: "41", children: "41" }), _jsx("option", { value: "40", children: "40" })] })] }), _jsxs(FlexBox, { alignItems: "center", gap: 3, mt: 3, children: [_jsx(H6, { fontSize: 16, children: "Quantity:" }), _jsx(Counter, {}), _jsx(Paragraph, { color: "text.secondary", children: "Available: 12" })] }), _jsxs(FlexBox, { alignItems: "center", gap: 3, mt: 3, children: [_jsx(Button, { variant: "contained", children: "Add to cart" }), _jsx(Button, { variant: "contained", color: "success", children: "Buy Now" })] }), _jsxs(FlexBox, { mt: 2, children: [_jsx(IconButton, { children: _jsx(Facebook, { sx: { color: "text.secondary" } }) }), _jsx(IconButton, { children: _jsx(Instagram, { sx: { color: "text.secondary" } }) }), _jsx(IconButton, { children: _jsx(Twitter, { sx: { color: "text.secondary" } }) })] })] })] }) }));
};
export default ProductViewCard;

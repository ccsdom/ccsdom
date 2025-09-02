import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Avatar, Button, styled, Divider, useTheme, IconButton, useMediaQuery, } from "@mui/material";
import { AddToDrive, FileDownload } from "@mui/icons-material";
// CUSTOM COMPONENTS
import { MoreButton } from "@/components/more-button";
import { H6, Paragraph } from "@/components/typography";
import { FlexBetween, FlexBox, FlexRowAlign } from "@/components/flexbox";
// CUSTOM LAYOUT COMPONENT
import Layout from "../Layout";
// CUSTOM ICON COMPONENTS
import Reply from "@/icons/duotone/Reply";
import Forward from "@/icons/duotone/Forward";
// STYLED COMPONENTS
const ImageBox = styled("div")({
    width: 210,
    height: 130,
    borderRadius: 8,
    cursor: "pointer",
    overflow: "hidden",
    position: "relative",
    ":before": {
        top: 0,
        left: 0,
        opacity: 0,
        content: "''",
        width: "100%",
        height: "100%",
        position: "absolute",
        transition: "all 300ms",
        backgroundColor: "black",
    },
    img: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    ":hover": {
        ":before": { opacity: 0.6 },
        "& .actions": { opacity: 1 },
    },
});
const IconWrapper = styled(FlexRowAlign)({
    inset: 0,
    opacity: 0,
    width: "100%",
    height: "100%",
    margin: "auto",
    position: "absolute",
    transition: "all 300ms",
});
const MailDetailsPageView = () => {
    const { direction } = useTheme();
    const upSm = useMediaQuery((theme) => theme.breakpoints.up("sm"));
    const ICON_STYLE = {
        mr: 1,
        fontSize: 14,
        color: "grey.500",
        rotate: direction === "rtl" ? "180deg" : 0,
    };
    return (_jsx(Layout, { children: _jsxs(Box, { p: 3, children: [_jsxs(FlexBetween, { gap: 2, children: [_jsxs(FlexBox, { alignItems: "center", gap: 1, children: [_jsx(Avatar, { src: "/static/user/user-11.png", sx: { width: 45, height: 45 } }), _jsxs("div", { children: [_jsx(Paragraph, { fontSize: 16, fontWeight: 600, children: "Penni Nojel" }), _jsx(Paragraph, { color: "text.secondary", children: "penninojel@gmail.com" })] })] }), _jsxs(FlexBox, { alignItems: "center", gap: 2, children: [upSm && (_jsx(Paragraph, { color: "text.secondary", children: "Dec 15, 2022, 1:45 PM" })), _jsx(MoreButton, { size: "small" })] })] }), _jsx(H6, { fontSize: 16, mt: 5, children: "How to Choose the Perfect Shopify Theme and Build Your Online Store Fast!" }), _jsx(Paragraph, { color: "text.secondary", textAlign: "justify", lineHeight: 1.9, my: 3, children: "Learn how to build a branded design system as a solo designer\u2014and everything else you need to know about the design systems landscape. Plus, discover how AI-generated art can help you deliver better designs in a fraction of the time. Wondering how to build a branded design system without a dedicated team? Using MUI components of course! Here's a step-by-step breakdown from a senior product designer who did just that\u2014as a solo designer at a startup." }), _jsx(Paragraph, { color: "text.secondary", textAlign: "justify", lineHeight: 1.9, children: "Learn how to build a branded design system as a solo designer\u2014and everything else you need to know about the design systems landscape. Plus, discover how AI-generated art can help you deliver better designs in a fraction of the time. Wondering how to build a branded design system without a dedicated team? Using MUI components of course! Here's a step-by-step breakdown from a senior product designer who did just that\u2014as a solo designer at a startup." }), _jsx(Divider, { sx: { my: 4 } }), _jsx(H6, { fontSize: 16, children: "2 Attachments available" }), _jsxs(FlexBox, { gap: 2, flexWrap: "wrap", mt: 2, children: [_jsxs(ImageBox, { children: [_jsx("img", { src: "/static/thumbnail/thumbnail-8.png", alt: "" }), _jsxs(IconWrapper, { className: "actions", children: [_jsx(IconButton, { children: _jsx(FileDownload, { sx: { color: "white" } }) }), _jsx(IconButton, { children: _jsx(AddToDrive, { sx: { color: "white" } }) })] })] }), _jsxs(ImageBox, { children: [_jsx("img", { src: "/static/thumbnail/thumbnail-8.png", alt: "" }), _jsxs(IconWrapper, { className: "actions", children: [_jsx(IconButton, { children: _jsx(FileDownload, { sx: { color: "white" } }) }), _jsx(IconButton, { children: _jsx(AddToDrive, { sx: { color: "white" } }) })] })] })] }), _jsxs(FlexBox, { mt: 4, gap: 2, children: [_jsxs(Button, { color: "secondary", variant: "outlined", children: [_jsx(Reply, { sx: ICON_STYLE }), " Reply"] }), _jsxs(Button, { color: "secondary", variant: "outlined", children: [_jsx(Forward, { sx: ICON_STYLE }), " Forward"] })] })] }) }));
};
export default MailDetailsPageView;

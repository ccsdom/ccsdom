import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, Card, IconButton, Link, styled } from "@mui/material";
import { FacebookRounded, GitHub, LinkedIn, Twitter, } from "@mui/icons-material";
// CUSTOM COMPONENTS
import { FlexBox } from "@/components/flexbox";
import { Paragraph } from "@/components/typography";
import { Link as RouterLink } from "@/components/link";
// STYLED COMPONENT
const StyledCard = styled(Card)(({ theme }) => ({
    gap: 16,
    padding: 24,
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    "& .buttons": { textAlign: "right" },
    [theme.breakpoints.down(655)]: {
        justifyContent: "center",
        textAlign: "center",
    },
}));
const Footer = () => {
    return (_jsxs(StyledCard, { children: [_jsxs("div", { children: [_jsx(Paragraph, { fontSize: 20, fontWeight: 600, children: "Essence Admin Template" }), _jsx(Paragraph, { color: "text.secondary", mb: 3, children: "Clean UI design & Well documentation" }), _jsx(Button, { children: "Buy Now" })] }), _jsxs("div", { children: [_jsxs(FlexBox, { alignItems: "center", gap: 2, children: [_jsx(Link, { component: RouterLink, href: "#", children: "About" }), _jsx(Link, { component: RouterLink, href: "#", children: "Support" }), _jsx(Link, { component: RouterLink, href: "#", children: "Terms & Conditions" })] }), _jsxs(Box, { className: "buttons", mt: 1, children: [_jsx(IconButton, { children: _jsx(Twitter, {}) }), _jsx(IconButton, { children: _jsx(LinkedIn, {}) }), _jsx(IconButton, { children: _jsx(FacebookRounded, {}) }), _jsx(IconButton, { children: _jsx(GitHub, {}) })] })] })] }));
};
export default Footer;

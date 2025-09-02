import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Grid, Button, Container, Card, Stack } from "@mui/material";
import KeyboardTab from "@mui/icons-material/KeyboardTab";
// CUSTOM COMPONENTS
import { H2, Paragraph } from "@/components/typography";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
const Section4 = () => {
    const navigate = useNavigate();
    return (_jsx(Container, { maxWidth: "lg", sx: { mb: 8, mt: { sm: 24, xs: 12 } }, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, lg: 5, md: 6, xs: 12, children: _jsxs(Box, { maxWidth: 450, position: "sticky", top: 0, pt: 4, mb: { xs: 4, mb: 0 }, children: [_jsxs(H2, { fontSize: 36, children: ["Ready to use ", _jsx("br", {}), " apps and pages"] }), _jsx(Paragraph, { mt: 1, mb: 3, fontSize: 18, color: "text.secondary", children: "Save thousands of development hours with Essence\u2019s well crafted features and clean code" }), _jsx(Button, { color: "secondary", variant: "outlined", startIcon: _jsx(KeyboardTab, {}), onClick: () => navigate("/dashboard/product-list"), children: "Browse pages & apps" })] }) }), _jsx(Grid, { item: true, lg: 7, md: 6, xs: 12, children: _jsxs(Stack, { spacing: 6, children: [_jsx(Card, { component: "img", src: "/static/landing/profile.jpg", alt: "profile" }), _jsx(Card, { component: "img", src: "/static/landing/email.jpg", alt: "dashboard 2" }), _jsx(Card, { component: "img", src: "/static/landing/chat.jpg", alt: "dashboard 2" }), _jsx(Card, { component: "img", src: "/static/landing/users.jpg", alt: "user list" })] }) })] }) }));
};
export default Section4;

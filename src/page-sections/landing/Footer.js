import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, Container, useTheme } from "@mui/material";
// CUSTOM COMPONENTS
import { H6, Paragraph } from "@/components/typography";
import { FlexBox } from "@/components/flexbox";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
const Footer = () => {
    const theme = useTheme();
    return (_jsxs(Box, { component: "footer", children: [_jsx(Box, { sx: { backgroundColor: "#1C113D" }, children: _jsxs(Container, { maxWidth: "xl", sx: { position: "relative" }, children: [_jsxs(Box, { pt: { sm: 12, xs: 8 }, pb: { sm: 24, xs: 20 }, children: [_jsxs(H6, { fontSize: { sm: 36, xs: 27 }, fontWeight: 700, lineHeight: 1.4, color: "white", mb: 4, children: ["Streamline your workflow ", _jsx("br", {}), " with Essence"] }), _jsxs(FlexBox, { alignItems: "center", gap: 2, children: [_jsx(Button, { color: "inherit", size: "large", sx: {
                                                backgroundColor: "white",
                                                color: "grey.900",
                                                ":hover": { backgroundColor: "#eee" },
                                            }, children: "Buy Now" }), _jsx(Button, { size: "large", color: "inherit", variant: "outlined", sx: { borderColor: "white", color: "white" }, LinkComponent: "a", href: "/dashboard", children: "Live Preview" })] })] }), _jsx(Box, { alt: "footer", component: "img", src: "/static/landing/illustration.svg", sx: {
                                position: "absolute",
                                right: 0,
                                bottom: 0,
                                display: { md: "block", xs: "none" },
                            } })] }) }), _jsx(Container, { children: _jsxs(Box, { px: 4, py: 5, zIndex: 1, boxShadow: 2, marginTop: -10, borderRadius: 4, textAlign: "center", position: "relative", bgcolor: isDark(theme) ? "grey.800" : "white", children: [_jsx(Paragraph, { fontSize: { sm: 24, xs: 18 }, fontWeight: 600, mb: 3, children: "Have any questions about our template?" }), _jsxs(FlexBox, { justifyContent: "center", alignItems: "center", gap: 2, children: [_jsx(Button, { LinkComponent: "a", href: "https://support.ui-lib.com/", target: "_blank", children: "Submit Ticket" }), _jsx(Button, { variant: "outlined", LinkComponent: "a", href: "mailto:support@ui-lib.com?subject=Essence React Query", target: "_blank", children: "Send an email" })] })] }) }), _jsxs(Paragraph, { fontSize: 16, textAlign: "center", py: 6, children: ["Copyright \u00A9", " ", _jsx(Box, { component: "a", href: "https://ui-lib.com", target: "_blank", children: "UI Lib" }), ". All rights reserved"] })] }));
};
export default Footer;

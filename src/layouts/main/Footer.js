import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Container, Divider, Grid, styled } from "@mui/material";
// CUSTOM COMPONENTS
import { Link } from "@/components/link";
import { FlexBox } from "@/components/flexbox";
import { Paragraph } from "@/components/typography";
// styled component
const LinkList = styled(FlexBox)(({ theme }) => ({
    a: {
        color: theme.palette.mode === "dark"
            ? theme.palette.grey[300]
            : theme.palette.grey[700],
    },
}));
const Footer = () => {
    return (_jsxs(Box, { pt: 12, children: [_jsx(Container, { maxWidth: "lg", children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsxs(Grid, { item: true, xs: 12, md: 4, children: [_jsxs(FlexBox, { alignItems: "center", gap: 1, mb: 2, children: [_jsx(Box, { alt: "logo", width: 40, height: 40, component: "img", src: "/static/logo/logo-svg.svg" }), _jsx(Paragraph, { fontSize: 28, fontWeight: 600, children: "Essence" })] }), _jsx(Paragraph, { fontSize: 16, lineHeight: 1.7, fontWeight: 500, 
                                    // textAlign="justify"
                                    color: "text.secondary", pr: { lg: 5, md: 2, xs: 0 }, children: "Essence SaaS template is a powerful and versatile software application that provides a comprehensive framework for building and delivering cloud-based solutions." })] }), _jsxs(Grid, { item: true, xs: 12, sm: 4, md: 3, children: [_jsx(Paragraph, { mb: 3, fontSize: 20, fontWeight: 600, children: "Products" }), _jsxs(LinkList, { flexDirection: "column", gap: 1.5, children: [_jsx(Link, { href: "#", children: "Project Management" }), _jsx(Link, { href: "#", children: "Multi-tenancy" }), _jsx(Link, { href: "#", children: "Scalability" }), _jsx(Link, { href: "#", children: "Customization" }), _jsx(Link, { href: "#", children: "Integration" }), _jsx(Link, { href: "#", children: "Mobile accessibility" }), _jsx(Link, { href: "#", children: "Analytics and reporting" })] })] }), _jsxs(Grid, { item: true, xs: 12, sm: 4, md: 3, children: [_jsx(Paragraph, { mb: 3, fontSize: 20, fontWeight: 600, children: "Features" }), _jsxs(LinkList, { flexDirection: "column", gap: 1.5, children: [_jsx(Link, { href: "#", children: "User management" }), _jsx(Link, { href: "#", children: "Workflow automation" }), _jsx(Link, { href: "#", children: "API access" }), _jsx(Link, { href: "#", children: "Data visualization" }), _jsx(Link, { href: "#", children: "Version control" }), _jsx(Link, { href: "#", children: "Upgrades" }), _jsx(Link, { href: "#", children: "Billing and invoicing" })] })] }), _jsxs(Grid, { item: true, xs: 12, sm: 4, md: 2, children: [_jsx(Paragraph, { mb: 3, fontSize: 20, fontWeight: 600, children: "Explore" }), _jsxs(LinkList, { flexDirection: "column", gap: 1.5, children: [_jsx(Link, { href: "#", children: "Docs" }), _jsx(Link, { href: "#", children: "Pricing" }), _jsx(Link, { href: "#", children: "Integrations" }), _jsx(Link, { href: "#", children: "Blog" }), _jsx(Link, { href: "#", children: "About" })] })] })] }) }), _jsx(Divider, { sx: { mt: 12 } }), _jsxs(Paragraph, { py: 5, textAlign: "center", fontSize: 16, fontWeight: 500, children: ["Copyright \u00A9 2023", " ", _jsx("a", { href: "https://ui-lib.com", target: "_blank", rel: "noreferrer", children: "UI-Lib" }), ". All rights reserved"] })] }));
};
export default Footer;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/page-sections/error/UnauthorizedPageView.tsx
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { H1, Paragraph } from "@/components/typography";
import useNavigate from "@/hooks/useNavigate";
const UnauthorizedPageView = () => {
    const navigate = useNavigate();
    return (_jsx(Container, { children: _jsxs(Box, { textAlign: "center", py: 6, children: [_jsx(H1, { fontSize: { sm: 52, xs: 42 }, children: "Acc\u00E8s refus\u00E9" }), _jsxs(Paragraph, { mt: 1, fontSize: 18, color: "text.secondary", children: ["Vous n'avez pas les permissions n\u00E9cessaires pour acc\u00E9der \u00E0 cette page.", _jsx("br", {}), _jsx("br", {}), " ", _jsx("strong", { children: "#403NonAutoris\u00E9" })] }), _jsx(Box, { py: 10, maxWidth: 600, mx: "auto", children: _jsx("img", { src: "/static/pages/unauthorized.svg", alt: "Acc\u00E8s refus\u00E9", width: "100%" }) }), _jsx(Button, { size: "large", onClick: () => navigate("/"), children: "Retour \u00E0 l'accueil" })] }) }));
};
export default UnauthorizedPageView;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/page-sections/error/ErrorPageView.tsx
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { H1, Paragraph } from "@/components/typography";
import useNavigate from "@/hooks/useNavigate";
const ErrorPageView = () => {
    const navigate = useNavigate();
    return (_jsx(Container, { children: _jsxs(Box, { textAlign: "center", py: 6, children: [_jsx(H1, { fontSize: { sm: 52, xs: 42 }, children: "Page non trouv\u00E9e !" }), _jsxs(Paragraph, { mt: 1, fontSize: 18, color: "text.secondary", children: ["Oups ! Il semblerait que cette page ait \u00E9t\u00E9 d\u00E9branch\u00E9e par erreur. \uD83D\uDD0C\uD83D\uDE48", _jsx("br", {}), _jsx("br", {}), " ", _jsx("strong", { children: "#404NonTrouv\u00E9e" })] }), _jsx(Box, { py: 10, maxWidth: 600, mx: "auto", children: _jsx("img", { src: "/static/pages/error.svg", alt: "Erreur 404", width: "100%" }) }), _jsx(Button, { size: "large", onClick: () => navigate("/"), children: "Retour \u00E0 l'accueil" })] }) }));
};
export default ErrorPageView;

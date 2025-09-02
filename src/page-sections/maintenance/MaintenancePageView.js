import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, Container } from "@mui/material";
// CUSTOM COMPONENTS
import { H1, Paragraph } from "@/components/typography";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
const MaintenancePageView = () => {
    const navigate = useNavigate();
    return (_jsx(Container, { children: _jsxs(Box, { textAlign: "center", py: 6, children: [_jsx(H1, { fontSize: { sm: 52, xs: 42 }, children: "Maintenance underway" }), _jsx(Paragraph, { mt: 0.5, fontSize: 18, color: "text.secondary", children: "Essence is Undergoing maintenance for future growth." }), _jsx(Box, { py: 8, maxWidth: 600, margin: "auto", children: _jsx("img", { src: "/static/pages/maintenance.svg", alt: "maintenance", width: "100%" }) }), _jsx(Button, { onClick: () => navigate("/"), children: "Go Home" })] }) }));
};
export default MaintenancePageView;

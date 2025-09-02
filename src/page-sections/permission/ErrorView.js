import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
// CUSTOM COMPONENTS
import { H1, Paragraph } from "@/components/typography";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
const UserPermissionView = () => {
    const navigate = useNavigate();
    return (_jsx(Container, { children: _jsxs(Box, { textAlign: "center", py: 6, children: [_jsx(H1, { fontSize: { sm: 52, xs: 42 }, children: "Permission Denied!" }), _jsx(Paragraph, { mt: 1, fontSize: 18, color: "text.secondary", children: "Sorry! You do not have permission to access this page" }), _jsx(Box, { py: 10, maxWidth: 600, margin: "auto", children: _jsx("img", { src: "/static/pages/error.svg", alt: "error", width: "100%" }) }), _jsx(Button, { onClick: () => navigate("/"), children: "Go Home" })] }) }));
};
export default UserPermissionView;

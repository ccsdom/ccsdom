import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext } from "react";
import { Box, Button } from "@mui/material";
// CUSTOM LAYOUT COMPONENT
import Layout from "@/page-sections/sessions/Layout";
// CUSTOM COMPONENTS
import { Link } from "@/components/link";
import { H5, Paragraph } from "@/components/typography";
// AUTH0 CONTEXT FILE
import { AuthContext } from "@/contexts/auth0Context";
const LoginView = () => {
    const { isAuthenticated, isInitialized, user, loginWithPopup, logout } = useContext(AuthContext);
    const handleSingIn = () => {
        loginWithPopup();
    };
    const handleSingOut = () => {
        logout();
    };
    console.log({
        isAuthenticated,
        isInitialized,
        user,
    });
    return (_jsx(Layout, { login: true, children: _jsxs(Box, { maxWidth: 550, p: 4, width: "100%", children: [isAuthenticated ? (_jsx(H5, { fontSize: { sm: 30, xs: 25 }, children: "Welcome Back" })) : (_jsx(H5, { fontSize: { sm: 30, xs: 25 }, children: "S'Identifier" })), isAuthenticated ? (_jsxs(Paragraph, { mt: 1, mb: 6, color: "text.secondary", children: ["Hello! ", user?.email] })) : (_jsxs(Paragraph, { mt: 1, mb: 6, color: "text.secondary", children: ["New user?", " ", _jsx(Box, { fontWeight: 500, component: Link, href: "/register", children: "Create an Account" })] })), isAuthenticated ? (_jsx(Button, { fullWidth: true, size: "large", color: "error", onClick: handleSingOut, children: "Sign Out" })) : (_jsx(Button, { fullWidth: true, size: "large", onClick: handleSingIn, children: "Sign In" }))] }) }));
};
export default LoginView;

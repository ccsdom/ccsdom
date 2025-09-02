import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
// CUSTOM COMPONENTS
import { Paragraph } from "@/components/typography";
import { FlexRowAlign } from "@/components/flexbox";
import { AvatarLoading } from "@/components/avatar-loading";
import useAuth from "@/hooks/useAuth";
const UserAccount = () => {
    const { user } = useAuth();
    if (!user) {
        return null; // ou un loader
    }
    return (_jsxs(FlexRowAlign, { flexDirection: "column", py: 5, children: [_jsx(AvatarLoading, { alt: user.name || "user", src: user.avatar || "/static/user/user-11.png", sx: { width: 50, height: 50 } }), _jsxs(Box, { textAlign: "center", pt: 2, pb: 3, children: [_jsx(Paragraph, { fontSize: 16, fontWeight: 600, mt: 2, children: user.name || "Utilisateur" }), _jsx(Paragraph, { fontSize: 13, fontWeight: 500, color: "text.secondary", mt: 0.5, children: user.email || "email@example.com" })] }), _jsx(Button, { variant: "contained", color: "primary", size: "small", component: RouterLink, to: "/dashboard/profil", children: "Mon compte" })] }));
};
export default UserAccount;

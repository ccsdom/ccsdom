import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment, useRef, useState } from "react";
import { Box, styled, Avatar, Divider, ButtonBase } from "@mui/material";
import PopoverLayout from "./PopoverLayout";
import { FlexBox } from "@/components/flexbox";
import { AvatarLoading } from "@/components/avatar-loading";
import { H6, Paragraph, Small } from "@/components/typography";
import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom"; // si tu utilises react-router
import { isDark } from "@/utils/constants";
const StyledButtonBase = styled(ButtonBase)(({ theme }) => ({
    marginLeft: 8,
    borderRadius: 30,
    border: `1px solid ${theme.palette.grey[isDark(theme) ? 800 : 200]}`,
    "&:hover": { backgroundColor: theme.palette.action.hover },
}));
const StyledSmall = styled(Paragraph)(({ theme }) => ({
    fontSize: 13,
    display: "block",
    cursor: "pointer",
    padding: "5px 1rem",
    "&:hover": { backgroundColor: theme.palette.action.hover },
}));
const ProfilePopover = () => {
    const anchorRef = useRef(null);
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    if (!user) {
        return null; // ou loader si besoin
    }
    const handleMenuItem = (path) => () => {
        navigate(path);
        setOpen(false);
    };
    const handleLogout = () => {
        logout();
        setOpen(false);
        navigate("/login"); // redirection après déconnexion
    };
    return (_jsxs(Fragment, { children: [_jsx(StyledButtonBase, { ref: anchorRef, onClick: () => setOpen(true), children: _jsx(AvatarLoading, { alt: user.name || "Utilisateur", percentage: 60, src: user.avatar || "/static/user/user-11.png", sx: { width: 35, height: 35 } }) }), _jsx(PopoverLayout, { hiddenViewButton: true, maxWidth: 230, minWidth: 200, popoverOpen: open, anchorRef: anchorRef, popoverClose: () => setOpen(false), title: _jsxs(FlexBox, { alignItems: "center", gap: 1, children: [_jsx(Avatar, { src: user.avatar || "/static/user/user-11.png", sx: { width: 35, height: 35 }, alt: user.name || "Utilisateur" }), _jsxs("div", { children: [_jsx(H6, { fontSize: 14, children: user.name || "Utilisateur" }), _jsx(Small, { color: "text.secondary", display: "block", children: user.email || "email@example.com" })] })] }), children: _jsxs(Box, { pt: 1, children: [_jsx(StyledSmall, { onClick: handleMenuItem("/client/profil/informations"), children: "Informations" }), _jsx(StyledSmall, { onClick: handleMenuItem("/client/profil/documents"), children: "Documents" }), _jsx(StyledSmall, { onClick: handleMenuItem("/client/profil/parametres"), children: "Param\u00E8tres" }), _jsx(Divider, { sx: { my: 1 } }), _jsx(StyledSmall, { onClick: handleLogout, children: "D\u00E9connexion" })] }) })] }));
};
export default ProfilePopover;

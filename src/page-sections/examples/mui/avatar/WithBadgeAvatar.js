import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, Badge, Stack, styled } from "@mui/material";
const AvatarBadge = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
        backgroundColor: theme.palette.success.main,
        color: theme.palette.success.main,
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        "&::after": {
            top: 0,
            left: 0,
            content: '""',
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            position: "absolute",
            border: "1px solid currentColor",
        },
    },
}));
const SmallAvatar = styled(Avatar)(({ theme }) => ({
    width: 22,
    height: 22,
    border: `2px solid ${theme.palette.background.paper}`,
}));
const WithBadgeAvatar = () => {
    return (_jsxs(Stack, { direction: "row", spacing: 2, justifyContent: "center", children: [_jsx(AvatarBadge, { variant: "dot", overlap: "circular", anchorOrigin: { vertical: "bottom", horizontal: "right" }, children: _jsx(Avatar, { alt: "Remy Sharp", src: "/static/user/user-10.png" }) }), _jsx(Badge, { overlap: "circular", anchorOrigin: { vertical: "bottom", horizontal: "right" }, badgeContent: _jsx(SmallAvatar, { alt: "Travis Howard", src: "/static/user/user-11.png" }), children: _jsx(Avatar, { alt: "Cindy Baker", src: "/static/user/user-13.png" }) })] }));
};
export default WithBadgeAvatar;

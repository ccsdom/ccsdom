import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, Box, Card, IconButton } from "@mui/material";
import { Add, MoreVert } from "@mui/icons-material";
// CUSTOM COMPONENTS
import { FlexBetween } from "@/components/flexbox";
import { Paragraph, Small } from "@/components/typography";
const DebitCard = () => {
    return (_jsxs(Card, { sx: {
            p: 3,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
        }, children: [_jsxs(FlexBetween, { mb: 2, children: [_jsx(Paragraph, { fontSize: 18, fontWeight: 500, children: "Your Card" }), _jsx(IconButton, { size: "small", children: _jsx(MoreVert, { sx: { color: "grey.300" } }) })] }), _jsx(Box, { component: "img", src: "/static/debit-card.png", alt: "debit-card", width: "100%" }), _jsxs(FlexBetween, { mt: 2, flexWrap: "wrap", children: [_jsx(Small, { fontWeight: 500, children: "Receivers:" }), _jsx(Avatar, { variant: "bordered", src: "/static/user/user-11.png", sx: { width: 35, height: 35 } }), _jsx(Avatar, { variant: "bordered", src: "/static/user/user-10.png", sx: { width: 35, height: 35 } }), _jsx(Avatar, { variant: "bordered", src: "/static/user/user-9.png", sx: { width: 35, height: 35 } }), _jsx(Avatar, { variant: "bordered", src: "/static/user/user-8.png", sx: { width: 35, height: 35 } }), _jsx(Avatar, { variant: "bordered", src: "/static/user/avatar.png", sx: { width: 35, height: 35 } }), _jsx(IconButton, { size: "small", sx: { border: "1px dashed", borderColor: "divider", flexShrink: 0 }, children: _jsx(Add, {}) })] })] }));
};
export default DebitCard;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, Badge, Card, Stack } from "@mui/material";
import { nanoid } from "nanoid";
// CUSTOM COMPONENTS
import { MoreButton } from "@/components/more-button";
import { Paragraph, Small } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// CUSTOM UTILS METHODS
import { format } from "@/utils/currency";
import { numberFormat } from "@/utils/numberFormat";
// CUSTOM DUMMY DATA
const DATA = [
    {
        id: nanoid(),
        totalSold: 13440,
        totalAmount: 350000,
        country: "/static/flags/usa-round.png",
        user: { name: "Gage Paquette", image: "/static/user/user-11.png" },
    },
    {
        id: nanoid(),
        totalSold: 10240,
        totalAmount: 148000,
        country: "/static/flags/uk-round.png",
        user: { name: "Lara Harvey", image: "/static/user/user-16.png" },
    },
    {
        id: nanoid(),
        totalSold: 10240,
        totalAmount: 148000,
        country: "/static/flags/germany-round.png",
        user: { name: "Evan Scott", image: "/static/user/user-17.png" },
    },
    {
        id: nanoid(),
        totalSold: 10240,
        totalAmount: 148000,
        country: "/static/flags/spain-round.png",
        user: { name: "Benja Johnston", image: "/static/user/user-18.png" },
    },
];
const TopSeller = () => {
    return (_jsxs(Card, { sx: { p: 3, height: "100%" }, children: [_jsxs(FlexBetween, { children: [_jsx(Paragraph, { fontSize: 18, fontWeight: 500, children: "Top Seller" }), _jsx(MoreButton, { size: "small" })] }), _jsxs(FlexBetween, { mt: 3, mb: 2, children: [_jsx(Paragraph, { color: "text.secondary", fontWeight: 500, children: "Profile" }), _jsx(Paragraph, { color: "text.secondary", fontWeight: 500, children: "Items sold" })] }), _jsx(Stack, { spacing: 2.5, children: DATA.map((item) => (_jsxs(FlexBetween, { children: [_jsxs(FlexBox, { gap: 1.5, children: [_jsx(Badge, { overlap: "circular", anchorOrigin: { vertical: "bottom", horizontal: "right" }, badgeContent: _jsx(Avatar, { alt: "Remy Sharp", src: item.country, sx: { all: "unset", width: 17, height: 17 } }), children: _jsx(Avatar, { alt: item.user.name, src: item.user.image, sx: { width: 45, height: 45 } }) }), _jsxs("div", { children: [_jsxs(Small, { fontWeight: 500, color: "text.secondary", children: ["$", format(item.totalAmount)] }), _jsx(Paragraph, { lineHeight: 1, fontWeight: 600, children: item.user.name })] })] }), _jsx(Paragraph, { fontWeight: 500, color: "text.secondary", children: numberFormat(item.totalSold) })] }, item.id))) })] }));
};
export default TopSeller;

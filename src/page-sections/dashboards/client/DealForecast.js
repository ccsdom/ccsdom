import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, Card, Stack } from "@mui/material";
import { nanoid } from "nanoid";
// CUSTOM COMPONENTS
import { MoreButton } from "@/components/more-button";
import { Paragraph, Small } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// CUSTOM UTILS METHOD
import { numberFormat } from "@/utils/numberFormat";
// CUSTOM DUMMY DATA
const DATA = [
    {
        id: nanoid(),
        dealWon: 25000,
        balance: 25360.0,
        owner: { name: "Astole Banne", image: "/static/user/user-11.png" },
    },
    {
        id: nanoid(),
        dealWon: 25000,
        balance: 25360.0,
        owner: { name: "Jhone Abela", image: "/static/user/user-16.png" },
    },
    {
        id: nanoid(),
        dealWon: 25000,
        balance: 25360.0,
        owner: { name: "Lisa Been", image: "/static/user/user-17.png" },
    },
];
const DealForecast = () => {
    return (_jsxs(Card, { sx: { p: 3, height: "100%" }, children: [_jsxs(FlexBetween, { children: [_jsx(Paragraph, { ellipsis: true, fontSize: 18, fontWeight: 500, children: "Deal Forecast by Owner" }), _jsx(MoreButton, { size: "small" })] }), _jsxs(FlexBetween, { mt: 3, mb: 2, children: [_jsx(Paragraph, { color: "text.secondary", fontWeight: 500, children: "Owner" }), _jsx(Paragraph, { color: "text.secondary", fontWeight: 500, children: "Deal Won" })] }), _jsx(Stack, { spacing: 2.5, children: DATA.map(({ balance, dealWon, id, owner }) => (_jsxs(FlexBetween, { children: [_jsxs(FlexBox, { gap: 1.5, children: [_jsx(Avatar, { alt: owner.name, src: owner.image, sx: { width: 35, height: 35 } }), _jsxs("div", { children: [_jsx(Paragraph, { lineHeight: 1, fontWeight: 600, children: owner.name }), _jsxs(Small, { fontWeight: 500, color: "text.secondary", children: ["$", numberFormat(balance)] })] })] }), _jsxs(Paragraph, { fontWeight: 500, color: "text.secondary", children: ["$", numberFormat(dealWon)] })] }, id))) })] }));
};
export default DealForecast;

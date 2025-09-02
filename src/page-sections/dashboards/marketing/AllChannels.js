import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, Box, Card, Stack } from "@mui/material";
import { North, South } from "@mui/icons-material";
import { nanoid } from "nanoid";
// CUSTOM COMPONENTS
import { Percentage } from "@/components/percentage";
import { MoreButton } from "@/components/more-button";
import { Paragraph, Small } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// CUSTOM DUMMY DATA SET
const DATA = [
    {
        value: 4.67,
        id: nanoid(),
        title: "Twitter",
        subtitle: "Social Media",
        image: "/static/social-media/twitter.svg",
    },
    {
        value: 3.37,
        error: true,
        id: nanoid(),
        title: "Linked In",
        subtitle: "Social Media",
        image: "/static/social-media/027-linkedin.svg",
    },
    {
        value: 2.19,
        id: nanoid(),
        title: "Dribble",
        subtitle: "Community",
        image: "/static/social-media/dribble.svg",
    },
    {
        value: 2.68,
        error: true,
        id: nanoid(),
        title: "Facebook",
        subtitle: "Social Media",
        image: "/static/social-media/036-facebook.svg",
    },
    {
        value: 3.33,
        id: nanoid(),
        title: "Instagram",
        subtitle: "Community",
        image: "/static/social-media/029-instagram.svg",
    },
];
const AllChannels = () => {
    return (_jsxs(Card, { sx: { p: 3, height: "100%" }, children: [_jsxs(FlexBetween, { mb: 4, children: [_jsxs("div", { children: [_jsx(Paragraph, { ellipsis: true, lineHeight: 1.3, fontSize: 18, fontWeight: 500, children: "All Channels" }), _jsx(Paragraph, { color: "text.secondary", children: "Users from all channels" })] }), _jsx(MoreButton, { size: "small" })] }), _jsx(Stack, { spacing: 4, children: DATA.map(({ id, image, title, subtitle, value, error }) => (_jsxs(FlexBetween, { children: [_jsxs(FlexBox, { gap: 1.5, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", children: [_jsx(Avatar, { variant: "rounded", alt: title, src: image }), _jsxs(Box, { textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", children: [_jsx(Paragraph, { ellipsis: true, fontSize: 16, lineHeight: 1, fontWeight: 600, children: title }), _jsx(Small, { ellipsis: true, fontWeight: 500, color: "text.secondary", children: subtitle })] })] }), _jsxs(Percentage, { gap: 0.3, display: "flex", lineHeight: 1.2, alignItems: "center", type: error ? "error" : "success", children: [error ? (_jsx(South, { sx: { fontSize: 11 } })) : (_jsx(North, { sx: { fontSize: 11 } })), " ", value, "%"] })] }, id))) })] }));
};
export default AllChannels;

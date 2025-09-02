import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, Box, Card, Stack } from "@mui/material";
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
        title: "Ships",
        weight: 50368258,
        total: "500 ships",
        image: "/static/transportation/1.png",
    },
    {
        id: nanoid(),
        title: "Planes",
        weight: 2336569,
        total: "25 planes",
        image: "/static/transportation/2.png",
    },
    {
        id: nanoid(),
        title: "Trucks",
        weight: 36566547,
        total: "2500 Trucks",
        image: "/static/transportation/3.png",
    },
    {
        id: nanoid(),
        title: "Trains",
        weight: 10236482,
        total: "1000 trains",
        image: "/static/transportation/4.png",
    },
];
const OurTransportation = () => {
    return (_jsxs(Card, { sx: { p: 3, height: "100%" }, children: [_jsxs(FlexBetween, { mb: 4, children: [_jsxs("div", { children: [_jsx(Paragraph, { ellipsis: true, lineHeight: 1.3, fontSize: 18, fontWeight: 500, children: "Our Transportation" }), _jsx(Small, { fontWeight: 500, color: "text.secondary", children: "Total 5,200 vehicles" })] }), _jsx(MoreButton, { size: "small" })] }), _jsx(Stack, { spacing: 3, children: DATA.map(({ id, image, title, total, weight }) => (_jsxs(FlexBetween, { children: [_jsxs(FlexBox, { gap: 1.5, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", children: [_jsx(Avatar, { variant: "rounded", alt: title, src: image }), _jsxs(Box, { textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", children: [_jsx(Paragraph, { ellipsis: true, fontSize: 16, lineHeight: 1, fontWeight: 600, children: title }), _jsx(Small, { ellipsis: true, fontWeight: 500, color: "text.secondary", children: total })] })] }), _jsxs(Box, { textAlign: "end", children: [_jsx(Paragraph, { fontWeight: 500, children: numberFormat(weight) }), _jsx(Small, { fontWeight: 500, color: "text.secondary", children: "Tons" })] })] }, id))) })] }));
};
export default OurTransportation;

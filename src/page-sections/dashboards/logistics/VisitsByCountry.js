import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, Box, Card, Stack } from "@mui/material";
import { nanoid } from "nanoid";
// CUSTOM COMPONENTS
import { MoreButton } from "@/components/more-button";
import { Paragraph, Small } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// CUSTOM UTILS METHOD
import { numberFormat } from "@/utils/numberFormat";
// CUSTOM DUMMY DATA SET
const DATA = [
    {
        id: nanoid(),
        name: "USA",
        total: 68258,
        percentage: 4.67,
        subtitle: "30% visits",
        image: "/static/flags/usa-round.png",
    },
    {
        id: nanoid(),
        name: "UK",
        total: 50683,
        percentage: 2.59,
        subtitle: "20% visits",
        image: "/static/flags/uk-round.png",
    },
    {
        id: nanoid(),
        name: "Germany",
        total: 62053,
        percentage: -1.18,
        subtitle: "28% visits",
        image: "/static/flags/germany-round.png",
    },
    {
        id: nanoid(),
        name: "Spain",
        total: 40369,
        percentage: -2.98,
        subtitle: "18% visits",
        image: "/static/flags/spain-round.png",
    },
    {
        id: nanoid(),
        total: 3258,
        name: "China",
        percentage: 1.22,
        subtitle: "4% visits",
        image: "/static/flags/china-round.png",
    },
];
const VisitsByCountry = () => {
    return (_jsxs(Card, { sx: { p: 3, height: "100%" }, children: [_jsxs(FlexBetween, { mb: 4, children: [_jsxs("div", { children: [_jsx(Paragraph, { ellipsis: true, lineHeight: 1.3, fontSize: 18, fontWeight: 500, children: "Visits by country" }), _jsx(Small, { fontWeight: 500, color: "text.secondary", children: "Total 200 countries visits" })] }), _jsx(MoreButton, { size: "small" })] }), _jsx(Stack, { spacing: 2, children: DATA.map(({ id, image, name, total, subtitle, percentage }) => (_jsxs(FlexBetween, { children: [_jsxs(FlexBox, { gap: 1.5, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", children: [_jsx(Avatar, { variant: "rounded", alt: name, src: image }), _jsxs(Box, { textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", children: [_jsx(Paragraph, { ellipsis: true, fontSize: 16, lineHeight: 1, fontWeight: 600, children: name }), _jsx(Small, { ellipsis: true, fontWeight: 500, color: "text.secondary", children: subtitle })] })] }), _jsxs(Box, { textAlign: "end", children: [_jsx(Paragraph, { fontWeight: 500, children: numberFormat(total) }), _jsx(Small, { fontWeight: 500, color: percentage < 0 ? "error.main" : "success.main", children: percentage })] })] }, id))) })] }));
};
export default VisitsByCountry;

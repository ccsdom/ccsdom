import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, Chip, Grid, useTheme, Accordion, AccordionDetails, AccordionSummary, } from "@mui/material";
import { H6 } from "@/components/typography";
import ExpandMore from "@mui/icons-material/ExpandMore";
// CUSTOM COMPONENTS
import { FlexBetween } from "@/components/flexbox";
import { MoreButton } from "@/components/more-button";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
// CUSTOM DUMMY DATA
import { OVERVIEW_DATA, SUPPORT_1, SUPPORT_2, SUPPORT_3 } from "./data";
const Overview = () => {
    const theme = useTheme();
    return (_jsxs(Grid, { container: true, spacing: 3, children: [OVERVIEW_DATA.map(({ id, title, items }) => (_jsx(Grid, { item: true, md: 6, xs: 12, children: _jsxs(Card, { sx: { p: 3 }, children: [_jsxs(FlexBetween, { mb: 3, children: [_jsx(H6, { fontSize: 18, children: title }), _jsx(MoreButton, { size: "small" })] }), items.map((item, i) => (_jsxs(Accordion, { defaultExpanded: i === 0, children: [_jsxs(AccordionSummary, { expandIcon: _jsx(ExpandMore, {}), children: [item.title, " ", item?.tag && (_jsx(Chip, { size: "small", color: "default", label: item.tag, sx: {
                                                ml: 1,
                                                fontSize: 12,
                                                borderRadius: 1,
                                                color: "text.secondary",
                                                backgroundColor: isDark(theme)
                                                    ? "grey.700"
                                                    : "grey.100",
                                            } }))] }), _jsx(AccordionDetails, { children: "By Uko to save tons and more to time money projects are listed and outstanding." })] }, item.id)))] }) }, id))), _jsx(Grid, { item: true, xs: 12, children: _jsxs(Card, { sx: { position: "relative", minHeight: 300, p: 3 }, children: [_jsx(Box, { position: "absolute", right: 0, bottom: 0, children: _jsx("img", { src: "/static/illustration/support-2.svg", alt: "" }) }), _jsx(H6, { fontSize: 18, mb: 3, children: "Products Documentations" }), _jsxs(Box, { sx: {
                                gap: 2,
                                display: "grid",
                                gridTemplateColumns: {
                                    md: "repeat(3, 1fr)",
                                    sm: "1fr 1fr",
                                    xs: "1fr",
                                },
                            }, children: [_jsx(Box, { component: "ul", pl: 3, children: SUPPORT_1.map((item) => (_jsx(Box, { pb: 1, component: "li", color: "grey.500", sx: { "::marker": { color: "grey.500", fontSize: "140%" } }, children: item }, item))) }), _jsx(Box, { component: "ul", pl: 3, children: SUPPORT_2.map((item) => (_jsx(Box, { pb: 1, component: "li", color: "grey.500", sx: { "::marker": { color: "grey.500", fontSize: "140%" } }, children: item }, item))) }), _jsx(Box, { component: "ul", pl: 3, children: SUPPORT_3.map((item) => (_jsx(Box, { pb: 1, component: "li", color: "grey.500", sx: { "::marker": { color: "grey.500", fontSize: "140%" } }, children: item }, item))) })] })] }) })] }));
};
export default Overview;

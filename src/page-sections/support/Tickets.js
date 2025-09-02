import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Chip, Grid, Stack, Button, styled, useTheme, Accordion, Pagination, AccordionDetails, AccordionSummary, } from "@mui/material";
import ExpandMore from "@mui/icons-material/ExpandMore";
// CUSTOM COMPONENTS
import MoreChannel from "./MoreChannel";
import Documentation from "./Documentation";
import { H6 } from "@/components/typography";
import { MoreButton } from "@/components/more-button";
import { SearchInput } from "@/components/search-input";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// CUSTOM ICON COMPONENT
import Filter from "@/icons/Filter";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
// CUSTOM DUMMY DATA
import { TICKETS } from "./data";
// STYLED COMPONENT
const FilterButton = styled(Button)(({ theme }) => ({
    borderRadius: 8,
    padding: ".3rem 1rem",
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.grey[isDark(theme) ? 700 : 100],
    ":hover": { backgroundColor: theme.palette.grey[isDark(theme) ? 700 : 100] },
}));
const Tickets = () => {
    const theme = useTheme();
    return (_jsx("div", { children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xl: 9, md: 8, xs: 12, children: _jsxs(Card, { sx: { p: 3 }, children: [_jsxs(FlexBetween, { children: [_jsx(SearchInput, { placeholder: "Search" }), _jsxs(FlexBox, { alignItems: "center", gap: 1, children: [_jsx(FilterButton, { variant: "text", startIcon: _jsx(Filter, {}), children: "Filter" }), _jsx(MoreButton, { size: "small" })] })] }), _jsx(H6, { fontSize: 18, mt: 4, mb: 2, children: "All Tickets" }), TICKETS.map((item, i) => (_jsxs(Accordion, { defaultExpanded: i === 0, children: [_jsxs(AccordionSummary, { expandIcon: _jsx(ExpandMore, {}), sx: { fontWeight: 500 }, children: [item.title, " ", item?.tag && (_jsx(Chip, { size: "small", color: "default", label: item.tag, sx: {
                                                    ml: 1,
                                                    fontSize: 12,
                                                    borderRadius: 1,
                                                    color: "text.secondary",
                                                    backgroundColor: isDark(theme)
                                                        ? "grey.700"
                                                        : "grey.100",
                                                } }))] }), _jsx(AccordionDetails, { children: "By Uko to save tons and more to time money projects are listed and outstanding. By Uko to save tons and more to time money projects are listed and outstanding." })] }, item.id))), _jsx(Stack, { mt: 3, direction: "row", justifyContent: "center", children: _jsx(Pagination, { count: 5, shape: "rounded" }) })] }) }), _jsxs(Grid, { item: true, xl: 3, md: 4, xs: 12, children: [_jsx(MoreChannel, {}), _jsx(Documentation, {})] })] }) }));
};
export default Tickets;

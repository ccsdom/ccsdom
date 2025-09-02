import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Add, Download, FavoriteBorder } from "@mui/icons-material";
import { Button, Card, CardMedia, Grid, styled, Box, IconButton, CardContent, Chip, } from "@mui/material";
// CUSTOM COMPONENTS
import { FlexBox, FlexBetween } from "@/components/flexbox";
import { H6, Small } from "@/components/typography";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
const StyledIconButton = styled(IconButton)(({ theme }) => ({
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`,
}));
const DateWrapper = styled(FlexBox)(({ theme }) => ({
    top: 10,
    right: 10,
    width: 40,
    height: 50,
    borderRadius: "4px",
    alignItems: "center",
    position: "absolute",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: isDark(theme)
        ? theme.palette.grey[800]
        : theme.palette.common.white,
}));
const Portfolio = () => {
    return (_jsxs(Card, { sx: { padding: 3 }, children: [_jsxs(FlexBetween, { mb: 3, children: [_jsx(H6, { fontSize: 16, children: "Portfolio" }), _jsx(Button, { color: "secondary", variant: "outlined", startIcon: _jsx(Add, {}), children: "Add New" })] }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, lg: 4, md: 6, xs: 12, children: _jsx(SinglePortfolio, { tag: "Minimal", title: "Hollow Purple", date: "12.00 Nov 21, 2021", imgLink: "/static/portfolio/1.png" }) }), _jsx(Grid, { item: true, lg: 4, md: 6, xs: 12, children: _jsx(SinglePortfolio, { tag: "Dark", title: "Red Blood", date: "12.00 Nov 21, 2021", imgLink: "/static/portfolio/2.png" }) }), _jsx(Grid, { item: true, lg: 4, md: 6, xs: 12, children: _jsx(SinglePortfolio, { tag: "Light", title: "Lime Blue", date: "12.00 Nov 21, 2021", imgLink: "/static/portfolio/3.png" }) })] })] }));
};
export default Portfolio;
// ==============================================================================================
function SinglePortfolio({ tag, date, title, imgLink }) {
    return (_jsxs(Card, { sx: { position: "relative", borderRadius: 2, boxShadow: 0 }, children: [_jsx(CardMedia, { component: "img", image: imgLink, height: 152 }), _jsxs(DateWrapper, { children: [_jsx(Small, { fontWeight: 600, children: "12" }), _jsx(Small, { color: "text.secondary", children: "Jan" })] }), _jsxs(CardContent, { sx: { paddingBottom: "16px !important" }, children: [_jsxs(FlexBetween, { children: [_jsx(Chip, { label: tag, size: "small" }), _jsxs("div", { children: [_jsx(StyledIconButton, { size: "small", disableRipple: true, sx: { mr: 1 }, children: _jsx(Download, { color: "primary" }) }), _jsx(StyledIconButton, { size: "small", disableRipple: true, children: _jsx(FavoriteBorder, { color: "action" }) })] })] }), _jsxs(Box, { mt: 1.5, children: [_jsx(H6, { fontSize: 14, lineHeight: 1, children: title }), _jsx(Small, { color: "text.secondary", children: date })] })] })] }));
}

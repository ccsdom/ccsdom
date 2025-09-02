import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, styled } from "@mui/material";
// CUSTOM COMPONENTS
import { MoreButton } from "@/components/more-button";
import { Paragraph, Small } from "@/components/typography";
import { FlexBetween, FlexRowAlign } from "@/components/flexbox";
// CUSTOM UTILS METHODS
import { numberFormat } from "@/utils/numberFormat";
import { isDark } from "@/utils/constants";
// STYLED COMPONENTS
const AsiaBox = styled(FlexRowAlign)(({ theme }) => ({
    width: 180,
    height: 180,
    color: "white",
    margin: "auto",
    borderRadius: "50%",
    position: "relative",
    flexDirection: "column",
    border: "1.5px solid white",
    boxShadow: theme.shadows[1],
    backgroundColor: theme.palette.primary.main,
}));
const EuropeBox = styled(FlexRowAlign)(({ theme }) => ({
    width: 120,
    height: 120,
    top: "60%",
    right: "60%",
    borderRadius: "50%",
    position: "absolute",
    flexDirection: "column",
    border: "1.5px solid white",
    boxShadow: theme.shadows[1],
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.grey[isDark(theme) ? 500 : 200],
}));
const AfricaBox = styled(FlexRowAlign)(({ theme }) => ({
    width: 90,
    height: 90,
    top: "90%",
    borderRadius: "50%",
    position: "absolute",
    flexDirection: "column",
    border: "1.5px solid white",
    boxShadow: theme.shadows[1],
    backgroundColor: theme.palette.grey[700],
}));
const TopActivity = () => {
    return (_jsxs(Card, { sx: { p: 3, minHeight: 370, height: "100%" }, children: [_jsxs(FlexBetween, { children: [_jsx(Paragraph, { fontSize: 18, fontWeight: 500, children: "Top Activity" }), _jsx(MoreButton, { size: "small" })] }), _jsx(Box, { pl: 3, width: "100%", mt: 3, children: _jsxs(AsiaBox, { children: [_jsxs(Paragraph, { fontSize: 16, fontWeight: 500, children: ["$", numberFormat(1725258.69)] }), _jsx(Small, { children: "Asia" }), _jsxs(EuropeBox, { children: [_jsxs(Paragraph, { fontSize: 16, fontWeight: 500, children: ["$", numberFormat(2525.25)] }), _jsx(Small, { children: "Europe" })] }), _jsxs(AfricaBox, { children: [_jsxs(Paragraph, { fontSize: 16, fontWeight: 500, children: ["$", numberFormat(525)] }), _jsx(Small, { children: "Africa" })] })] }) })] }));
};
export default TopActivity;

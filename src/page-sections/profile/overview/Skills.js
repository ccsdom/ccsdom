import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ButtonBase, ButtonGroup, Card, Grid, styled } from "@mui/material";
// CUSTOM COMPONENTS
import { H6 } from "@/components/typography";
import { FlexBetween } from "@/components/flexbox";
import { MoreButton } from "@/components/more-button";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
// STYLED COMPONENTS
const ButtonOne = styled(ButtonBase)(({ theme }) => ({
    fontSize: 14,
    width: "100%",
    cursor: "auto",
    fontWeight: 500,
    overflow: "hidden",
    whiteSpace: "nowrap",
    padding: ".8rem 1rem",
    textOverflow: "ellipsis",
    borderRadius: "8px 0 0 8px",
    backgroundColor: theme.palette.grey[isDark(theme) ? 600 : 100],
}));
const ButtonTwo = styled(ButtonBase)(({ theme }) => ({
    fontSize: 14,
    cursor: "auto",
    fontWeight: 600,
    padding: ".8rem 1rem",
    borderRadius: "0 8px 8px 0",
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.divider,
}));
// CUSTOM DUMMY DATA LIST
const LIST = [
    { id: 1, title: "Graphic Design", amount: 40 },
    { id: 2, title: "Font End Dev", amount: 32 },
    { id: 3, title: "Figma Design", amount: 50 },
    { id: 4, title: "Figma Design", amount: 50, complete: true },
    { id: 5, title: "Graphic Design", amount: 40 },
    { id: 6, title: "Font End Dev", amount: 32 },
];
const Skills = () => {
    return (_jsxs(Card, { sx: { padding: 3 }, children: [_jsxs(FlexBetween, { mb: 3, children: [_jsx(H6, { fontSize: 16, children: "Skills" }), _jsx(MoreButton, { size: "small" })] }), _jsx(Grid, { container: true, spacing: 2, children: LIST.map((item) => (_jsx(Grid, { item: true, xl: 3, lg: 4, sm: 6, xs: 12, children: _jsxs(ButtonGroup, { fullWidth: true, children: [_jsx(ButtonOne, { disableRipple: true, children: item.title }), _jsx(ButtonTwo, { disableRipple: true, children: item.amount })] }) }, item.id))) })] }));
};
export default Skills;

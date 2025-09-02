import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Stack, Button, styled, Chip } from "@mui/material";
// CUSTOM COMPONENTS
import FeatureListItem from "./FeatureListItem";
import { H1, Paragraph, Span } from "@/components/typography";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
// STYLED COMPONENTS
const StyledCard = styled(Card, {
    shouldForwardProp: (prop) => prop !== "active",
})(({ theme, active }) => ({
    padding: "3rem",
    boxShadow: theme.shadows[0],
    border: `1px solid ${theme.palette.grey[isDark(theme) ? 700 : 100]}`,
    ...(active && {
        position: "relative",
        border: `1px solid ${theme.palette.primary.main}`,
    }),
}));
const StyledChip = styled(Chip)({
    top: 20,
    right: 20,
    position: "absolute",
});
// ==============================================================
const PricingCard = ({ title, price, popular, icon, features }) => {
    return (_jsxs(StyledCard, { active: popular ? 1 : 0, children: [popular && _jsx(StyledChip, { label: "POPULAR" }), _jsx(Paragraph, { fontWeight: 600, fontSize: 16, color: "text.secondary", textTransform: "uppercase", children: title }), price ? (_jsxs(H1, { pt: 2, pb: 4, fontSize: 48, children: ["$", price, _jsx(Span, { fontSize: 16, fontWeight: 500, color: "text.secondary", children: "/month" })] })) : (_jsx(H1, { pt: 2, pb: 4, fontSize: 48, children: "Free" })), _jsx("img", { src: icon, alt: "shape" }), _jsx(Stack, { spacing: 2, mt: 5, mb: 6, children: features.map((item) => (_jsx(FeatureListItem, { title: item }, item))) }), _jsx(Button, { fullWidth: true, color: popular ? "primary" : "secondary", children: "Choose Plan" })] }));
};
export default PricingCard;

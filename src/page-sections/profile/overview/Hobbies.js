import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Chip, Stack } from "@mui/material";
// CUSTOM COMPONENTS
import { H6 } from "@/components/typography";
import { MoreButton } from "@/components/more-button";
import FlexBetween from "@/components/flexbox/FlexBetween";
const Hobbies = () => {
    return (_jsxs(Card, { sx: { padding: 3 }, children: [_jsxs(FlexBetween, { mb: 3, children: [_jsx(H6, { fontSize: 16, children: "Hobbies" }), _jsx(MoreButton, { size: "small" })] }), _jsxs(Stack, { direction: "row", gap: 2, flexWrap: "wrap", children: [_jsx(Chip, { color: "secondary", label: "Dota 2" }), _jsx(Chip, { color: "secondary", label: "Dog" }), _jsx(Chip, { color: "secondary", label: "Basketball" }), _jsx(Chip, { color: "secondary", label: "Football" }), _jsx(Chip, { color: "secondary", label: "Cricket" }), _jsx(Chip, { color: "secondary", label: "Skateboarding" }), _jsx(Chip, { color: "secondary", label: "Rock Climbing" }), _jsx(Chip, { color: "secondary", label: "Painting" }), _jsx(Chip, { color: "secondary", label: "Cars" }), _jsx(Chip, { color: "secondary", label: "Video Games" }), _jsx(Chip, { color: "secondary", label: "Climbing" }), _jsx(Chip, { color: "secondary", label: "Hockey" }), _jsx(Chip, { color: "secondary", label: "Table Tennis" })] })] }));
};
export default Hobbies;

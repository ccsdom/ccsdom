import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, Card, Chip, Container, Grid, Stack, styled, } from "@mui/material";
// CUSTOM COMPONENTS
import { H1, H6, Paragraph } from "@/components/typography";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
// CUSTOM DUMMY DATA
import { JOBS } from "./data";
// STYLED COMPONENT
const StyledCard = styled(Card)(({ theme }) => ({
    padding: "1.5rem",
    transition: "all 300ms",
    boxShadow: theme.shadows[0],
    border: `1px solid ${theme.palette.grey[isDark(theme) ? 700 : 100]}`,
    ":hover": {
        boxShadow: theme.shadows[4],
        borderColor: theme.palette.primary.main,
    },
}));
const Section2 = () => {
    return (_jsxs(Container, { maxWidth: "lg", sx: { my: 10 }, children: [_jsxs(Box, { textAlign: "center", mb: 6, children: [_jsx(H1, { fontSize: { sm: 52, xs: 42 }, children: "Available Jobs" }), _jsx(Paragraph, { color: "text.secondary", fontSize: 18, children: "Join our dynamic team of professionals and shape the future of IT Industry." })] }), _jsx(Grid, { container: true, spacing: 3, children: JOBS.map(({ id, title }) => (_jsx(Grid, { item: true, lg: 4, sm: 6, xs: 12, children: _jsxs(StyledCard, { children: [_jsx(H6, { mb: 2, fontSize: 24, children: title }), _jsx(Paragraph, { mb: 6, fontSize: 16, color: "text.secondary", children: "We are actively seeking a talented and passionate software engineer to join our team." }), _jsxs(Stack, { mb: 3, direction: "row", spacing: 1, alignItems: "center", children: [_jsx(Chip, { color: "secondary", label: "Full-time" }), _jsx(Chip, { color: "secondary", label: "Remote" }), _jsx(Chip, { color: "secondary", label: "$500/monthly" })] }), _jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [_jsx(Button, { variant: "outlined", children: "View Details" }), _jsx(Button, { children: "Apply this job" })] })] }) }, id))) })] }));
};
export default Section2;

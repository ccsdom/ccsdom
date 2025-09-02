import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Box, Card, Grid, Button, Accordion, AccordionDetails, AccordionSummary, } from "@mui/material";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
// CUSTOM COMPONENTS
import { FlexBox } from "@/components/flexbox";
import { H6, Paragraph } from "@/components/typography";
// CUSTOM DUMMY DATA SET
import { CAREER_1_DATA } from "../data";
const Career1PageView = () => {
    const navigate = useNavigate();
    return (_jsxs(Box, { py: 3, children: [_jsx(H6, { fontSize: 18, children: "Career List" }), _jsx(Paragraph, { color: "text.secondary", mb: 3, children: "You sit down. You stare at your screen. The cursor blinks" }), _jsx(Grid, { container: true, spacing: 3, children: CAREER_1_DATA.map(({ id, title, description, items }) => (_jsx(Grid, { item: true, md: 6, xs: 12, children: _jsxs(Card, { sx: { p: 3 }, children: [_jsx(H6, { fontSize: 16, children: title }), _jsx(Paragraph, { color: "text.secondary", mb: 4, children: description }), items.map((item, i) => (_jsxs(Accordion, { defaultExpanded: i === 0, children: [_jsx(AccordionSummary, { expandIcon: _jsx(ExpandMore, {}), children: item }), _jsx(AccordionDetails, { children: _jsxs(Box, { component: "ul", pl: 2, children: [_jsx(Box, { component: "li", pb: 1, children: "Experience with JavaScript." }), _jsx(Box, { component: "li", pb: 1, children: "Good time-management skills." }), _jsx(Box, { component: "li", pb: 1, children: "Experience with React." }), _jsx(Box, { component: "li", pb: 1, children: "Experience with HTML / CSS." }), _jsx(Box, { component: "li", pb: 1, children: "Experience with REST API." }), _jsx(Box, { component: "li", pb: 1, children: "Git knowledge is a plus." })] }) })] }, item))), _jsxs(FlexBox, { alignItems: "center", gap: 2, mt: 3, children: [_jsx(Button, { size: "small", onClick: () => navigate("/dashboard/career-apply"), children: "Apply" }), _jsx(Button, { size: "small", variant: "outlined", color: "secondary", children: "Cancel" })] })] }) }, id))) })] }));
};
export default Career1PageView;

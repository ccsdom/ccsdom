import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, LinearProgress } from "@mui/material";
// CUSTOM COMPONENTS
import { Title } from "@/components/title";
import { FlexBetween } from "@/components/flexbox";
import { Paragraph } from "@/components/typography";
const YearlyRevenue = () => {
    return (_jsxs(Card, { sx: {
            padding: 3,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
        }, children: [_jsx("div", { children: _jsx(Title, { title: 5103, titlePrefix: "$", percentage: "-1.25%", percentageType: "error", subtitle: "Yearly Revenue" }) }), _jsxs(Box, { mt: 7, children: [_jsxs(FlexBetween, { mb: 1, children: [_jsx(Paragraph, { fontWeight: 600, children: "$6,000 to Target" }), _jsx(Paragraph, { color: "text.secondary", children: "65%" })] }), _jsx(LinearProgress, { value: 65, color: "primary", variant: "determinate", sx: { height: 8 } })] })] }));
};
export default YearlyRevenue;

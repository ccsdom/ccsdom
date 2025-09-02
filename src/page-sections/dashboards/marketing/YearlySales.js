import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, LinearProgress } from "@mui/material";
// CUSTOM COMPONENTS
import { Title } from "@/components/title";
import { FlexBetween } from "@/components/flexbox";
import { Paragraph } from "@/components/typography";
const YearlySales = () => {
    return (_jsxs(Card, { sx: {
            padding: 3,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
        }, children: [_jsx("div", { children: _jsx(Title, { title: 51352, titlePrefix: "$", percentage: "-1.25%", percentageType: "error", subtitle: "Yearly Sales" }) }), _jsxs(Box, { mt: 7, children: [_jsxs(FlexBetween, { mb: 1, children: [_jsx(Paragraph, { fontWeight: 600, children: "$60,000 to Target" }), _jsx(Paragraph, { color: "text.secondary", children: "79%" })] }), _jsx(LinearProgress, { value: 79, color: "success", variant: "determinate", sx: { height: 8 } })] })] }));
};
export default YearlySales;

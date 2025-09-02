import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, Card } from "@mui/material";
// CUSTOM COMPONENTS
import { Paragraph } from "@/components/typography";
const CheckUpdate = () => {
    return (_jsxs(Card, { sx: { p: 4, textAlign: "center" }, children: [_jsx(Box, { mb: 1, width: "100%", maxWidth: 200, component: "img", src: "/static/illustration/check-update.svg" }), _jsx(Paragraph, { pt: 2, pb: 3, fontSize: 20, margin: "auto", fontWeight: 600, maxWidth: { xl: "60%" }, children: "We have big update for you!" }), _jsx(Button, { children: "Check Update" })] }));
};
export default CheckUpdate;

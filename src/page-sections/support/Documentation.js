import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, Stack } from "@mui/material";
// CUSTOM COMPONENTS
import { H6, Paragraph } from "@/components/typography";
import { FlexBox } from "@/components/flexbox";
// CUSTOM DUMMY DATA
import { DOCUMENTATIONS } from "./data";
const Documentation = () => {
    return (_jsxs(Card, { sx: { p: 3, mt: 3 }, children: [_jsx(H6, { fontSize: 18, mb: 3, children: "Documentations" }), _jsx(Stack, { spacing: 2.5, children: DOCUMENTATIONS.map((item) => (_jsxs(FlexBox, { alignItems: "center", gap: 1, children: [_jsx(Box, { width: 8, height: 8, borderRadius: "50%", bgcolor: "grey.300" }), _jsx(Paragraph, { color: "grey.500", fontWeight: 500, children: item })] }, item))) })] }));
};
export default Documentation;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TimelineDot, TimelineItem, TimelineContent, TimelineSeparator, TimelineConnector, } from "@mui/lab";
import { Avatar, Stack } from "@mui/material";
import { Paragraph, Small } from "@/components/typography";
import Pin from "@/icons/Pin";
const PinItem = () => {
    return (_jsxs(TimelineItem, { sx: { "&::before": { display: "none" } }, children: [_jsxs(TimelineSeparator, { children: [_jsx(TimelineDot, { children: _jsx(Pin, { sx: { fontSize: 16 } }) }), _jsx(TimelineConnector, {})] }), _jsxs(TimelineContent, { sx: { pb: 3 }, children: [_jsx(Paragraph, { fontWeight: 600, children: "Invitation for crafting engaging designs that speak human workshop" }), _jsxs(Stack, { mt: 0.5, direction: "row", alignItems: "center", spacing: 1, children: [_jsx(Small, { color: "text.secondary", children: "Added at 4.23 PM by" }), _jsx(Avatar, { src: "/static/user/user-11.png", sx: { width: 17, height: 17 } })] })] })] }));
};
export default PinItem;

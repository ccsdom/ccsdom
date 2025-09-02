import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TimelineDot, TimelineItem, TimelineContent, TimelineSeparator, TimelineConnector, } from "@mui/lab";
import { Avatar, Stack } from "@mui/material";
// CUSTOM COMPONENTS
import { H6, Small, Span } from "@/components/typography";
// CUSTOM ICON COMPONENT
import Layers from "@/icons/Layers";
const LayerItem = () => {
    return (_jsxs(TimelineItem, { sx: { "&::before": { display: "none" } }, children: [_jsxs(TimelineSeparator, { children: [_jsx(TimelineDot, { children: _jsx(Layers, { sx: { fontSize: 16 } }) }), _jsx(TimelineConnector, {})] }), _jsxs(TimelineContent, { sx: { pb: 3 }, children: [_jsxs(H6, { fontSize: 14, mb: 0.5, children: ["Task ", _jsx(Span, { color: "primary.main", children: "#45890" }), " merged with", " ", _jsx(Span, { color: "primary.main", children: "#45890" }), " in \u201CAds Pro Admin Dashboard project:"] }), _jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(Small, { color: "text.secondary", children: "Added at 4.23 PM by" }), _jsx(Avatar, { src: "/static/user/user-11.png", sx: { width: 17, height: 17 } })] })] })] }));
};
export default LayerItem;

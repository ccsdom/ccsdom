import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Stack, Box, Avatar } from "@mui/material";
import { TimelineDot, TimelineItem, TimelineContent, TimelineSeparator, TimelineConnector, } from "@mui/lab";
// CUSTOM COMPONENT
import { H6, Small } from "@/components/typography";
// CUSTOM ICON COMPONENT
import Edit from "@/icons/Edit";
const EditItem = () => {
    return (_jsxs(TimelineItem, { sx: { "&::before": { display: "none" } }, children: [_jsxs(TimelineSeparator, { children: [_jsx(TimelineDot, { children: _jsx(Edit, { sx: { fontSize: 16 } }) }), _jsx(TimelineConnector, {})] }), _jsxs(TimelineContent, { children: [_jsx(H6, { fontSize: 14, mb: 0.5, children: "3 new application design concepts added:" }), _jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(Small, { color: "text.secondary", children: "Created at 4.30 by" }), _jsx(Avatar, { src: "/static/user/user-10.png", sx: { width: 17, height: 17 } })] }), _jsxs(Stack, { spacing: 2, direction: "row", sx: {
                            padding: 2,
                            marginTop: 2,
                            borderRadius: 4,
                            border: "1px solid",
                            borderColor: "divider",
                        }, children: [_jsx(Box, { sx: { width: 235 }, children: _jsx("img", { src: "/static/post/1.png", width: "100%", alt: "Post" }) }), _jsx(Box, { sx: { width: 235 }, children: _jsx("img", { src: "/static/post/2.png", width: "100%", alt: "Post" }) }), _jsx(Box, { sx: { width: 235 }, children: _jsx("img", { src: "/static/post/3.png", width: "100%", alt: "Post" }) })] })] })] }));
};
export default EditItem;

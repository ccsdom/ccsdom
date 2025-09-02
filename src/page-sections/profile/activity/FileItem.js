import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TimelineDot, TimelineItem, TimelineContent, TimelineSeparator, TimelineConnector, } from "@mui/lab";
import { Stack, Box, Avatar } from "@mui/material";
// CUSTOM COMPONENTS
import { H6, Paragraph, Small } from "@/components/typography";
// CUSTOM ICON COMPONENT
import Link from "@/icons/Link";
const FileItem = () => {
    return (_jsxs(TimelineItem, { sx: { "&::before": { display: "none" } }, children: [_jsxs(TimelineSeparator, { children: [_jsx(TimelineDot, { children: _jsx(Link, { sx: { fontSize: 16 } }) }), _jsx(TimelineConnector, {})] }), _jsxs(TimelineContent, { sx: { pb: 3 }, children: [_jsx(H6, { fontSize: 14, mb: 0.5, children: "Invitation for crafting engaging designs that speak human workshop" }), _jsxs(Stack, { mt: 0.5, direction: "row", alignItems: "center", spacing: 1, children: [_jsx(Small, { color: "text.secondary", children: "Added at 4.23 PM by" }), _jsx(Avatar, { src: "/static/user/user-9.png", sx: { width: 17, height: 17 } })] }), _jsxs(Stack, { direction: "row", sx: {
                            marginTop: 2,
                            borderRadius: 4,
                            border: "1px solid",
                            padding: ".7rem 1rem",
                            borderColor: "divider",
                        }, children: [_jsx(ListItem, { title: "Finance KPI App", icon: "/static/files-icon/pdf.svg", size: 90 }), _jsx(ListItem, { title: "Css File Yoga App", icon: "/static/files-icon/css.svg", size: 90 }), _jsx(ListItem, { title: "All JPGS From Yoga App", icon: "/static/files-icon/jpg.svg", size: 90 })] })] })] }));
};
export default FileItem;
// ===================================================================================
function ListItem({ title, icon, size }) {
    return (_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, mr: 6, children: [_jsx(Box, { sx: { width: 40, flexShrink: 0 }, children: _jsx("img", { src: icon, width: "100%", alt: title }) }), _jsxs("div", { children: [_jsx(Paragraph, { lineHeight: 1, fontWeight: 500, color: "primary.main", children: title }), _jsxs(Small, { color: "grey.500", children: [size, " mb"] })] })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Timeline from "@mui/lab/Timeline";
import { Card, Divider, Box, Select, MenuItem } from "@mui/material";
// CUSTOM COMPONENTS
import { H6, Span } from "@/components/typography";
import { Scrollbar } from "@/components/scrollbar";
import FlexBetween from "@/components/flexbox/FlexBetween";
// CUSTOM SECTION COMPONENTS
import PinItem from "./PinItem";
import ChatItem from "./ChatItem";
import EditItem from "./EditItem";
import FileItem from "./FileItem";
import LayerItem from "./LayerItem";
const Activity = () => {
    return (_jsx(Box, { py: 3, children: _jsx(Scrollbar, { autoHide: false, children: _jsxs(Box, { component: Card, minWidth: 900, children: [_jsxs(FlexBetween, { flexWrap: "wrap", p: 3, children: [_jsxs(H6, { fontSize: 16, children: ["My Connections", " ", _jsx(Span, { fontSize: 14, fontWeight: 400, color: "text.secondary", children: "(100+ Resources)" })] }), _jsxs(Select, { defaultValue: "today", size: "small", children: [_jsx(MenuItem, { value: "today", children: "Today" }), _jsx(MenuItem, { value: "month", children: "Month" }), _jsx(MenuItem, { value: "year", children: "Year" })] })] }), _jsx(Divider, {}), _jsx(Box, { my: 2, children: _jsxs(Timeline, { children: [_jsx(ChatItem, {}), _jsx(PinItem, {}), _jsx(FileItem, {}), _jsx(LayerItem, {}), _jsx(EditItem, {})] }) })] }) }) }));
};
export default Activity;

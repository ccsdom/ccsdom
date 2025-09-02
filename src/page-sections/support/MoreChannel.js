import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Stack } from "@mui/material";
// CUSTOM COMPONENTS
import { Link } from "@/components/link";
import { FlexBox } from "@/components/flexbox";
import { H6, Paragraph } from "@/components/typography";
// CUSTOM DUMMY DATA
import { CHANNELS } from "./data";
const MoreChannel = () => {
    return (_jsxs(Card, { sx: { p: 3 }, children: [_jsx(H6, { fontSize: 18, mb: 3, children: "More Channel" }), _jsx(Stack, { spacing: 2, children: CHANNELS.map(({ id, image, title }) => (_jsxs(FlexBox, { alignItems: "center", gap: 1.5, children: [_jsx(FlexBox, { alignItems: "center", width: 25, children: _jsx("img", { src: image, alt: "", width: "100%", height: "100%" }) }), _jsxs("div", { children: [_jsx(Paragraph, { fontSize: 16, children: title }), _jsxs(Paragraph, { color: "text.secondary", children: ["Follow us at ", _jsx(Link, { href: "#", children: "UI-Lib" })] })] })] }, id))) })] }));
};
export default MoreChannel;

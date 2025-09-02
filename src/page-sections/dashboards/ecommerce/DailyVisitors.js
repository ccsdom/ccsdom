import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, AvatarGroup, Box, Card } from "@mui/material";
// CUSTOM COMPONENTS
import { FlexBox } from "@/components/flexbox";
import { Percentage } from "@/components/percentage";
import { H6, Paragraph } from "@/components/typography";
// CUSTOM UTILS METHOD
import { numberFormat } from "@/utils/numberFormat";
const DailyVisitors = () => {
    return (_jsxs(Card, { sx: { p: 3 }, children: [_jsxs("div", { children: [_jsxs(FlexBox, { alignItems: "center", gap: 1, children: [_jsx(H6, { children: numberFormat(1352) }), _jsx(Percentage, { type: "primary", children: "+12.5%" })] }), _jsx(Paragraph, { color: "text.secondary", children: "Daily Visitors" })] }), _jsxs(Box, { mt: 7, children: [_jsx(Paragraph, { mb: 0.5, fontWeight: 500, children: "Top Visitors" }), _jsxs(AvatarGroup, { max: 4, children: [_jsx(Avatar, { alt: "Remy Sharp", src: "/static/user/user-11.png" }), _jsx(Avatar, { alt: "Travis Howard", src: "/static/user/user-10.png" }), _jsx(Avatar, { alt: "Cindy Baker", src: "/static/user/user-13.png" }), _jsx(Avatar, { alt: "Agnes Walker", src: "/static/user/user-14.png" }), _jsx(Avatar, { alt: "Trevor Henderson", src: "/static/user/user-15.png" })] })] })] }));
};
export default DailyVisitors;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Stack, Button, Box } from "@mui/material";
import Add from "@mui/icons-material/Add";
// CUSTOM COMPONENTS
import { FlexBetween, FlexBox } from "@/components/flexbox";
import { H6, Paragraph, Small } from "@/components/typography";
// CUSTOM ICON COMPONENT
import DateRange from "@/icons/DateRange";
const Post = () => {
    return (_jsxs(Card, { sx: { padding: 3 }, children: [_jsxs(FlexBetween, { flexWrap: "wrap", gap: 1, children: [_jsx(H6, { fontSize: 16, children: "Post" }), _jsx(Button, { color: "secondary", variant: "outlined", startIcon: _jsx(Add, {}), children: "Create a post" })] }), _jsxs(Stack, { spacing: 3, mt: 2, children: [_jsx(SinglePost, { category: "Esports", date: "Nov 21, 2021", imgLink: "/static/post/1.png", title: "The International on the way 2021" }), _jsx(SinglePost, { category: "Environment", date: "Aug 21, 2021", imgLink: "/static/post/2.png", title: "Global Warming Conclusion" }), _jsx(SinglePost, { category: "Environment", date: "Jun 21, 2021", imgLink: "/static/post/3.png", title: "Crypto is the future" })] })] }));
};
export default Post;
// =======================================================================================
function SinglePost({ date, title, imgLink, category }) {
    return (_jsxs(FlexBetween, { children: [_jsxs(Stack, { spacing: 0.5, children: [_jsx(H6, { fontSize: 14, children: title }), _jsx(Paragraph, { color: "grey.500", children: category }), _jsxs(FlexBox, { gap: 0.5, alignItems: "center", color: "text.secondary", children: [_jsx(DateRange, { sx: { fontSize: 20 } }), _jsxs(Small, { lineHeight: 1, children: ["Publish on ", date] })] })] }), _jsx(Box, { sx: { width: 125, height: 75, borderRadius: "4px", overflow: "hidden" }, children: _jsx("img", { src: imgLink, width: "100%", alt: "Post" }) })] }));
}

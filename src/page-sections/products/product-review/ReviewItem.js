import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Star from "@mui/icons-material/Star";
import { Stack, Avatar, Rating } from "@mui/material";
// CUSTOM COMPONENTS
import { H6, Paragraph } from "@/components/typography";
// CUSTOM ICON COMPONENTS
import ThumbsUp from "@/icons/ThumbsUp";
// ==============================================================
const ReviewItem = ({ liked, rating, comment, createdAt, user }) => {
    return (_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 5, children: [_jsxs(Stack, { alignItems: "center", flexShrink: 0, children: [_jsx(Avatar, { src: user.image, sx: { width: 60, height: 60 } }), _jsx(H6, { fontSize: 14, mt: 2, children: user.name }), _jsx(Paragraph, { color: "text.secondary", children: createdAt })] }), _jsxs(Stack, { spacing: 1, maxWidth: 460, children: [_jsx(Rating, { readOnly: true, value: rating, emptyIcon: _jsx(Star, { sx: { opacity: 0.4, fontSize: "inherit" } }), sx: { color: "warning.main", fontSize: 24 } }), _jsx(Paragraph, { lineHeight: 1.9, children: comment }), _jsxs(Stack, { direction: "row", alignItems: "flex-end", spacing: 1, children: [_jsx(ThumbsUp, { sx: { color: "primary.main" } }), _jsxs(H6, { color: "primary.main", fontSize: 12, children: ["Thank(", liked, ")"] })] })] })] }));
};
export default ReviewItem;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Star from "@mui/icons-material/Star";
import { Box, Grid, Stack, Button, Rating, styled, TextField, } from "@mui/material";
// CUSTOM COMPONENTS
import ReviewItem from "./ReviewItem";
import RatingDetails from "./RatingDetails";
import { H5, H6, Paragraph } from "@/components/typography";
// CUSTOM ICON COMPONENTS
import Edit from "@/icons/Edit";
// STYLED COMPONENTS
const ContainerGrid = styled(Grid)(({ theme }) => ({
    [theme.breakpoints.down("md")]: { flexDirection: "column-reverse" },
}));
const FirstGrid = styled(Grid)(({ theme }) => ({
    [theme.breakpoints.up("md")]: {
        borderRight: `1px solid ${theme.palette.divider}`,
    },
    [theme.breakpoints.down("md")]: {
        marginTop: 24,
        borderTop: `1px solid ${theme.palette.grey[300]}`,
    },
}));
const ProductReviews = () => {
    const [rating, setRating] = useState(2);
    return (_jsx(Box, { padding: 3, children: _jsxs(ContainerGrid, { container: true, spacing: 3, children: [_jsx(FirstGrid, { item: true, md: 8, xs: 12, children: _jsxs(Stack, { spacing: 4, children: [_jsx(ReviewItem, { liked: 234, rating: 4, createdAt: "14 Nov, 2021", user: {
                                    name: "Christina Perry",
                                    image: "/static/user/user-11.png",
                                }, comment: "Thank you very fast shipping from Poland only 3days. Very Grateful. Was this review helpful to you?." }), _jsx(ReviewItem, { liked: 234, rating: 4, createdAt: "14 Nov, 2021", user: {
                                    name: "Christina Perry",
                                    image: "/static/user/user-11.png",
                                }, comment: "Thank you very fast shipping from Poland only 3days. Very Grateful. Was this review helpful to you?." }), _jsx(ReviewItem, { liked: 234, rating: 4, createdAt: "14 Nov, 2021", user: {
                                    name: "Christina Perry",
                                    image: "/static/user/user-11.png",
                                }, comment: "Thank you very fast shipping from Poland only 3days. Very Grateful. Was this review helpful to you?." })] }) }), _jsxs(Grid, { item: true, md: 4, xs: 12, children: [_jsxs(Stack, { alignItems: "center", children: [_jsx(H6, { fontSize: 16, children: "Average rating" }), _jsx(H5, { color: "primary.main", my: 1.5, children: "4/5" }), _jsx(Rating, { readOnly: true, value: 4, emptyIcon: _jsx(Star, { sx: { opacity: 0.4, fontSize: "inherit" } }) }), _jsx(Paragraph, { color: "text.secondary", children: "(8.24k reviews)" })] }), _jsxs(Box, { maxWidth: 300, margin: "auto", pt: 4, children: [_jsxs(Stack, { spacing: 1, children: [_jsx(RatingDetails, { title: "5 star", progressValue: 74, totalReview: 32000 }), _jsx(RatingDetails, { title: "4 star", progressValue: 54, totalReview: 54000 }), _jsx(RatingDetails, { title: "3 star", progressValue: 34, totalReview: 37000 }), _jsx(RatingDetails, { title: "2 star", progressValue: 24, totalReview: 42000 }), _jsx(RatingDetails, { title: "1 star", progressValue: 14, totalReview: 65000 })] }), _jsx(Button, { fullWidth: true, color: "secondary", variant: "outlined", startIcon: _jsx(Edit, {}), sx: { mt: 4 }, children: "Write Your review" })] })] }), _jsx(Grid, { item: true, xs: 12, children: _jsxs(Box, { sx: { padding: 2 }, children: [_jsx(H6, { fontSize: 16, mb: 1, children: "Add Review" }), _jsxs(Stack, { direction: "row", spacing: 1, children: [_jsx(Paragraph, { children: "Your review about this product:" }), _jsx(Rating, { value: rating, onChange: (_, newValue) => setRating(newValue), emptyIcon: _jsx(Star, { sx: { opacity: 0.4, fontSize: "inherit" } }), sx: { color: "warning.main", fontSize: 18 } })] }), _jsxs("form", { children: [_jsxs(Stack, { spacing: 2, mt: 3, children: [_jsx(TextField, { rows: 4, multiline: true, placeholder: "Review", fullWidth: true }), _jsx(TextField, { placeholder: "Name", fullWidth: true }), _jsx(TextField, { placeholder: "Email", fullWidth: true })] }), _jsxs(Stack, { direction: "row", spacing: 2, mt: 2, justifyContent: "end", children: [_jsx(Button, { variant: "outlined", color: "secondary", children: "Cancel" }), _jsx(Button, { children: "Post Review" })] })] })] }) })] }) }));
};
export default ProductReviews;

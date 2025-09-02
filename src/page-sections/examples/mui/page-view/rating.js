import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Grid, Stack, Rating } from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
// CUSTOM COMPONENTS
import ComponentPageLayout from "../../ComponentPageLayout";
import { Block } from "@/components/block";
const MuiRatingPageView = () => {
    const [rating, setRating] = useState(3);
    return (_jsx(ComponentPageLayout, { title: "Rating", children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, lg: 4, md: 6, xs: 12, children: _jsx(Block, { title: "Controlled", children: _jsx(Rating, { value: rating, name: "controlled", onChange: (_, newValue) => setRating(newValue) }) }) }), _jsx(Grid, { item: true, lg: 4, md: 6, xs: 12, children: _jsx(Block, { title: "Read Only", children: _jsx(Rating, { name: "read-only", value: rating, readOnly: true }) }) }), _jsx(Grid, { item: true, lg: 4, md: 6, xs: 12, children: _jsx(Block, { title: "Disabled", children: _jsx(Rating, { name: "read-only", value: rating, disabled: true }) }) }), _jsx(Grid, { item: true, lg: 4, md: 6, xs: 12, children: _jsx(Block, { title: "Rating Precision", children: _jsx(Rating, { name: "precision", value: rating, precision: 0.5 }) }) }), _jsx(Grid, { item: true, lg: 4, md: 6, xs: 12, children: _jsx(Block, { title: "Custom Icon", children: _jsx(Rating, { value: rating, name: "custom-icon", icon: _jsx(Favorite, { fontSize: "inherit" }), emptyIcon: _jsx(FavoriteBorder, { fontSize: "inherit" }) }) }) }), _jsx(Grid, { item: true, lg: 4, md: 6, xs: 12, children: _jsx(Block, { title: "Sizes", children: _jsxs(Stack, { spacing: 2, children: [_jsx(Rating, { value: rating, size: "large" }), _jsx(Rating, { value: rating, size: "medium" }), _jsx(Rating, { value: rating, size: "small" })] }) }) })] }) }));
};
export default MuiRatingPageView;

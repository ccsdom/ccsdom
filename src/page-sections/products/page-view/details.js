import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Card, Grid, Tab } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
// CUSTOM PAGE SECTION COMPONENTS
import ProductView from "../ProductView";
import { ProductReviews } from "../product-review";
import ProductDescription from "../ProductDescription";
const ProductDetailsPageView = () => {
    const [tab, setTab] = useState("1");
    const tabChange = (_, value) => setTab(value);
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, children: _jsx(ProductView, {}) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Card, { children: _jsxs(TabContext, { value: tab, children: [_jsxs(TabList, { onChange: tabChange, sx: { pl: 3, minHeight: 50, pt: 0.5 }, children: [_jsx(Tab, { disableRipple: true, label: "Description", value: "1" }), _jsx(Tab, { disableRipple: true, label: "Reviews", value: "2" })] }), _jsx(TabPanel, { value: "1", children: _jsx(ProductDescription, {}) }), _jsx(TabPanel, { value: "2", children: _jsx(ProductReviews, {}) })] }) }) })] }) }));
};
export default ProductDetailsPageView;

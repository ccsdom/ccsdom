import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { TabContext, TabList } from "@mui/lab";
import { Button, Grid, Tab, Box, styled } from "@mui/material";
// CUSTOM COMPONENTS
import ProductCard from "../ProductCard";
import { H6 } from "@/components/typography";
import { IconWrapper } from "@/components/icon-wrapper";
import { FlexBetween, FlexBox, FlexRowAlign } from "@/components/flexbox";
// CUSTOM ICON COMPONENTS
import Add from "@/icons/Add";
import ShoppingBasket from "@/icons/ShoppingBasket";
import SearchArea from "@/page-sections/users/SearchArea";
// CUSTOM DUMMY DATA
import { PRODUCTS } from "@/__fakeData__/products";
// STYLED COMPONENT
const HeadingWrapper = styled(FlexBetween)(({ theme }) => ({
    gap: 8,
    flexWrap: "wrap",
    [theme.breakpoints.down(453)]: {
        "& .MuiButton-root": { order: 2 },
        "& .MuiTabs-root": {
            order: 3,
            width: "100%",
            "& .MuiTabs-flexContainer": { justifyContent: "space-between" },
        },
    },
}));
const ProductGridPageView = () => {
    const [pageSize] = useState(8);
    const [pageIndex, setPageIndex] = useState(1);
    const [selectTab, setSelectTab] = useState("1");
    const [searchValue, setSearchValue] = useState("");
    const handleChangeTab = (_, newTab) => setSelectTab(newTab);
    const FILTER_PRODUCTS = PRODUCTS.slice(0, pageSize * pageIndex).filter((item) => item.name.includes(searchValue));
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsxs(TabContext, { value: selectTab, children: [_jsxs(HeadingWrapper, { children: [_jsxs(FlexBox, { gap: 0.5, alignItems: "center", children: [_jsx(IconWrapper, { children: _jsx(ShoppingBasket, { sx: { color: "primary.main" } }) }), _jsx(H6, { fontSize: 16, children: "Products" })] }), _jsxs(TabList, { onChange: handleChangeTab, children: [_jsx(Tab, { disableRipple: true, label: "Active", value: "1" }), _jsx(Tab, { disableRipple: true, label: "Draft", value: "2" }), _jsx(Tab, { disableRipple: true, label: "Assembly", value: "3" })] }), _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), children: "Add Product" })] }), _jsx(SearchArea, { value: searchValue, onChange: (e) => setSearchValue(e.target.value), gridRoute: "/dashboard/product-grid", listRoute: "/dashboard/product-list" }), _jsxs(Grid, { container: true, spacing: 3, children: [FILTER_PRODUCTS.map((item) => (_jsx(Grid, { item: true, md: 3, sm: 6, xs: 12, children: _jsx(ProductCard, { item: item }) }, item.id))), _jsx(Grid, { item: true, xs: 12, children: _jsx(FlexRowAlign, { mt: 2, children: _jsx(Button, { onClick: () => setPageIndex((state) => state + 1), disabled: PRODUCTS.length === FILTER_PRODUCTS.length, children: "Load More Products" }) }) })] })] }) }));
};
export default ProductGridPageView;

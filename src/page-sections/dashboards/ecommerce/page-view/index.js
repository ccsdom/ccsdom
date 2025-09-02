import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Grid } from "@mui/material";
// CUSTOM PAGE SECTION COMPONENTS
import Order from "../Order";
import Sales from "../Sales";
import Footer from "../../_common/Footer";
import Earnings from "../Earnings";
import TopSeller from "../TopSeller";
import DailySales from "../DailySales";
import ReturnRate from "../ReturnRate";
import TopProducts from "../TopProducts";
import RecentOrders from "../RecentOrders";
import DailyVisitors from "../DailyVisitors";
import CustomerReview from "../CustomerReview";
const EcommercePageView = () => {
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, lg: 3, sm: 6, xs: 12, children: _jsx(DailyVisitors, {}) }), _jsx(Grid, { item: true, lg: 3, sm: 6, xs: 12, children: _jsx(DailySales, {}) }), _jsx(Grid, { item: true, lg: 3, sm: 6, xs: 12, children: _jsx(Order, {}) }), _jsx(Grid, { item: true, lg: 3, sm: 6, xs: 12, children: _jsx(Earnings, {}) }), _jsx(Grid, { item: true, md: 8, xs: 12, children: _jsx(Sales, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(CustomerReview, {}) }), _jsx(Grid, { item: true, md: 8, xs: 12, children: _jsx(RecentOrders, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(TopSeller, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(ReturnRate, {}) }), _jsx(Grid, { item: true, md: 8, xs: 12, children: _jsx(TopProducts, {}) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Footer, {}) })] }) }));
};
export default EcommercePageView;

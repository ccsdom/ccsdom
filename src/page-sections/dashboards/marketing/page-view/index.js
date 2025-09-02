import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Grid } from "@mui/material";
// CUSTOM PAGE SECTION COMPONENTS
import Footer from "../../_common/Footer";
import TotalItems from "../TotalItems";
import TotalOrder from "../TotalOrder";
import YearlySales from "../YearlySales";
import AllChannels from "../AllChannels";
import CheckUpdate from "../CheckUpdate";
import ChartFilters from "../ChartFilters";
import AllCampaigns from "../AllCampaigns";
import YearlyRevenue from "../YearlyRevenue";
import YoutubeCampaign from "../YoutubeCampaign";
import ShipmentHistory from "../../logistics/ShipmentHistory";
const MarketingPageView = () => {
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, lg: 3, sm: 6, xs: 12, children: _jsx(TotalItems, {}) }), _jsx(Grid, { item: true, lg: 3, sm: 6, xs: 12, children: _jsx(YearlySales, {}) }), _jsx(Grid, { item: true, lg: 3, sm: 6, xs: 12, children: _jsx(TotalOrder, {}) }), _jsx(Grid, { item: true, lg: 3, sm: 6, xs: 12, children: _jsx(YearlyRevenue, {}) }), _jsx(Grid, { item: true, md: 8, xs: 12, children: _jsx(ChartFilters, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(AllChannels, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(YoutubeCampaign, {}) }), _jsx(Grid, { item: true, md: 8, xs: 12, children: _jsx(AllCampaigns, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(CheckUpdate, {}) }), _jsx(Grid, { item: true, md: 8, xs: 12, children: _jsx(ShipmentHistory, {}) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Footer, {}) })] }) }));
};
export default MarketingPageView;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Grid } from "@mui/material";
// CUSTOM PAGE SECTION COMPONENTS
import Cards from "../Cards";
import Footer from "../../_common/Footer";
import TodoList from "../TodoList";
import DealType from "../DealType";
import MostLeads from "../MostLeads";
import DealStatus from "../DealStatus";
import RecentLeads from "../RecentLeads";
import ChartFilters from "../ChartFilters";
import DealForecast from "../DealForecast";
import SalesForecast from "../SalesForecast";
import AvgCallDuration from "../AvgCallDuration";
const CrmPageView = () => {
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, children: _jsx(Cards, {}) }), _jsx(Grid, { item: true, md: 8, xs: 12, children: _jsx(ChartFilters, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(MostLeads, {}) }), _jsx(Grid, { item: true, md: 8, xs: 12, children: _jsx(DealStatus, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(DealType, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(AvgCallDuration, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(SalesForecast, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(DealForecast, {}) }), _jsx(Grid, { item: true, md: 8, xs: 12, children: _jsx(RecentLeads, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(TodoList, {}) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Footer, {}) })] }) }));
};
export default CrmPageView;

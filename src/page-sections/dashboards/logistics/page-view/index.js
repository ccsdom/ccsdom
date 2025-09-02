import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Grid, Stack } from "@mui/material";
// CUSTOM PAGE SECTION COMPONENTS
import Footer from "../../_common/Footer";
import Shipments from "../Shipments";
import QuickGuide from "../QuickGuide";
import ShippingOrders from "../ShippingOrders";
import RoleManagement from "../RoleManagement";
import CompanyProgress from "../CompanyProgress";
import VisitsByCountry from "../VisitsByCountry";
import ShipmentHistory from "../ShipmentHistory";
import OurTransportation from "../OurTransportation";
import TopSellingCategories from "../TopSellingCategories";
const LogisticsPageView = () => {
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, lg: 5, md: 12, xs: 12, children: _jsx(Shipments, {}) }), _jsx(Grid, { item: true, lg: 7, md: 12, xs: 12, children: _jsxs(Stack, { spacing: 3, children: [_jsx(ShippingOrders, {}), _jsx(QuickGuide, {})] }) }), _jsx(Grid, { item: true, md: 8, xs: 12, children: _jsx(CompanyProgress, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(RoleManagement, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(OurTransportation, {}) }), _jsx(Grid, { item: true, md: 8, xs: 12, children: _jsx(TopSellingCategories, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(VisitsByCountry, {}) }), _jsx(Grid, { item: true, md: 8, xs: 12, children: _jsx(ShipmentHistory, {}) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Footer, {}) })] }) }));
};
export default LogisticsPageView;

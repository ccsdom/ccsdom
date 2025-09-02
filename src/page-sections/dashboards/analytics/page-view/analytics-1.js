import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Grid, Stack } from "@mui/material";
// CUSTOM PAGE SECTION COMPONENTS
import Footer from "../../_common/Footer";
import LiveUser from "../LiveUser";
import TopQueries from "../TopQueries";
import TopReferral from "../TopReferral";
import ChartFilters from "../ChartFilters";
import CompleteGoal from "../CompleteGoal";
import CompleteRate from "../CompleteRate";
import TopPerforming from "../TopPerforming";
import SessionBrowser from "../SessionBrowser";
import SalesByCountry from "../SalesByCountry";
const Analytics1PageView = () => {
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, md: 8, xs: 12, children: _jsx(ChartFilters, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(LiveUser, {}) }), _jsx(Grid, { item: true, md: 8, xs: 12, children: _jsx(TopReferral, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(SessionBrowser, {}) }), _jsx(Grid, { item: true, lg: 3, xs: 12, children: _jsxs(Stack, { spacing: 3, sx: { "& > div": { flex: 1 } }, direction: { lg: "column", sm: "row", xs: "column" }, children: [_jsx(CompleteGoal, {}), _jsx(CompleteRate, {})] }) }), _jsx(Grid, { item: true, lg: 9, xs: 12, children: _jsx(SalesByCountry, {}) }), _jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(TopPerforming, {}) }), _jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(TopQueries, {}) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Footer, {}) })] }) }));
};
export default Analytics1PageView;

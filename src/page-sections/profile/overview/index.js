import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Grid, Stack, Box } from "@mui/material";
// CUSTOM COMPONENTS
import Post from "./Post";
import Teams from "./Teams";
import Skills from "./Skills";
import Hobbies from "./Hobbies";
import Summery from "./Summery";
import Portfolio from "./Portfolio";
import MyConnections from "./MyConnections";
import AdditionalDetails from "./AdditionalDetails";
const Overview = () => {
    return (_jsx(Box, { mt: 3, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, lg: 9, md: 8, xs: 12, children: _jsxs(Stack, { spacing: 3, children: [_jsx(Summery, {}), _jsx(Skills, {}), _jsx(Teams, {}), _jsx(Hobbies, {}), _jsx(Post, {}), _jsx(Portfolio, {})] }) }), _jsx(Grid, { item: true, lg: 3, md: 4, xs: 12, children: _jsxs(Stack, { spacing: 3, children: [_jsx(MyConnections, {}), _jsx(AdditionalDetails, {})] }) })] }) }));
};
export default Overview;

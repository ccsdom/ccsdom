import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Box from "@mui/material/Box";
import { TabContext, TabPanel } from "@mui/lab";
// CUSTOM PAGE SECTION COMPONENTS
import Layout from "../Layout";
import Overview from "../overview";
import Projects from "../projects";
import Activity from "../activity";
import Campaigns from "../campaigns";
import Documents from "../documents";
import Connections from "../connections";
const ProfilePageView = () => {
    const [tabValue, setTabValue] = useState("1");
    const handleTabChange = (_, value) => setTabValue(value);
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsx(TabContext, { value: tabValue, children: _jsxs(Layout, { handleTabList: handleTabChange, children: [_jsx(TabPanel, { value: "1", children: _jsx(Overview, {}) }), _jsx(TabPanel, { value: "2", children: _jsx(Projects, {}) }), _jsx(TabPanel, { value: "3", children: _jsx(Campaigns, {}) }), _jsx(TabPanel, { value: "4", children: _jsx(Documents, {}) }), _jsx(TabPanel, { value: "5", children: _jsx(Connections, {}) }), _jsx(TabPanel, { value: "6", children: _jsx(Activity, {}) })] }) }) }));
};
export default ProfilePageView;

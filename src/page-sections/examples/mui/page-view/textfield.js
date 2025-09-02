import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Tab from "@mui/material/Tab";
import { TabContext, TabList, TabPanel } from "@mui/lab";
// CUSTOM COMPONENTS
import Filled from "../text-fields/Filled";
import Outlined from "../text-fields/Outlined";
import Standard from "../text-fields/Standard";
import ComponentPageLayout from "../../ComponentPageLayout";
const MuiTextFieldPageView = () => {
    const [value, setValue] = useState("1");
    const handleChange = (_, newValue) => setValue(newValue);
    return (_jsx(ComponentPageLayout, { title: "Textfield", fullLink: "https://mui.com/components/text-fields", children: _jsxs(TabContext, { value: value, children: [_jsxs(TabList, { onChange: handleChange, children: [_jsx(Tab, { value: "1", label: "Outlined" }), _jsx(Tab, { value: "2", label: "Filled" }), _jsx(Tab, { value: "3", label: "Standard" })] }), _jsx(TabPanel, { value: "1", children: _jsx(Outlined, {}) }), _jsx(TabPanel, { value: "2", children: _jsx(Filled, {}) }), _jsx(TabPanel, { value: "3", children: _jsx(Standard, {}) })] }) }));
};
export default MuiTextFieldPageView;

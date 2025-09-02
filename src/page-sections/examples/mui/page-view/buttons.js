import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Tab, Stack, IconButton } from "@mui/material";
import Folder from "@mui/icons-material/Folder";
import Start from "@mui/icons-material/Start";
import { LoadingButton, TabContext, TabList, TabPanel } from "@mui/lab";
// CUSTOM COMPONENTS
import { Block } from "@/components/block";
import ComponentPageLayout from "../../ComponentPageLayout";
import FabSizes from "../Fab/FabSizes";
import DefaultFab from "../Fab/DefaultFab";
import ExtendedFab from "../Fab/ExtendedFab";
import TextButton from "../button/TextButton";
import ButtonSizes from "../button/ButtonSizes";
import WithIconButton from "../button/WithIconButton";
import OutlinedButton from "../button/OutlinedButton";
import ContainedButton from "../button/ContainedButton";
import TextButtonGroup from "../button-group/TextButtonGroup";
import ButtonGroupSizes from "../button-group/ButtonGroupSizes";
import OutlinedButtonGroup from "../button-group/OutlinedButtonGroup";
import ContainedButtonGroup from "../button-group/ContainedButtonGroup";
const MuiButtonsPageView = () => {
    const [value, setValue] = useState("1");
    const handleChange = (_, newValue) => setValue(newValue);
    return (_jsx(ComponentPageLayout, { title: "Buttons", fullLink: "https://mui.com/material-ui/react-button", children: _jsxs(TabContext, { value: value, children: [_jsxs(TabList, { onChange: handleChange, children: [_jsx(Tab, { value: "1", label: "Buttons" }), _jsx(Tab, { value: "2", label: "Loading Button" }), _jsx(Tab, { value: "3", label: "Floating Action Button" }), _jsx(Tab, { value: "4", label: "Group Buttons" })] }), _jsx(TabPanel, { value: "1", children: _jsxs(Stack, { mt: 5, spacing: 4, children: [_jsx(Block, { title: "Contained Button", children: _jsx(ContainedButton, {}) }), _jsx(Block, { title: "Outlined Button", children: _jsx(OutlinedButton, {}) }), _jsx(Block, { title: "Text Button", children: _jsx(TextButton, {}) }), _jsx(Block, { title: "With Icon", children: _jsx(WithIconButton, {}) }), _jsx(Block, { title: "Icon Button", children: _jsxs(Stack, { direction: "row", flexWrap: "wrap", gap: 3, children: [_jsx(IconButton, { children: _jsx(Folder, {}) }), _jsx(IconButton, { color: "primary", children: _jsx(Folder, {}) }), _jsx(IconButton, { color: "secondary", children: _jsx(Folder, {}) }), _jsx(IconButton, { color: "success", children: _jsx(Folder, {}) }), _jsx(IconButton, { color: "warning", children: _jsx(Folder, {}) }), _jsx(IconButton, { color: "error", children: _jsx(Folder, {}) }), _jsx(IconButton, { color: "info", children: _jsx(Folder, {}) })] }) }), _jsx(Block, { title: "Sizes", children: _jsx(ButtonSizes, {}) })] }) }), _jsx(TabPanel, { value: "2", children: _jsxs(Stack, { mt: 5, spacing: 4, children: [_jsx(Block, { title: "Contained", children: _jsxs(Stack, { direction: "row", gap: 3, children: [_jsx(LoadingButton, { loading: true, variant: "contained", children: "Submit" }), _jsx(LoadingButton, { loading: true, loadingIndicator: "Loading\u2026", variant: "contained", children: "Fetch data" }), _jsx(LoadingButton, { loading: true, loadingPosition: "start", startIcon: _jsx(Start, {}), children: "Start" }), _jsx(LoadingButton, { loading: true, loadingPosition: "end", endIcon: _jsx(Start, {}), children: "End" })] }) }), _jsx(Block, { title: "Outlined", children: _jsxs(Stack, { direction: "row", gap: 3, children: [_jsx(LoadingButton, { loading: true, variant: "outlined", children: "Submit" }), _jsx(LoadingButton, { loading: true, loadingIndicator: "Loading\u2026", variant: "outlined", children: "Fetch data" }), _jsx(LoadingButton, { loading: true, variant: "outlined", loadingPosition: "start", startIcon: _jsx(Start, {}), children: "Start" }), _jsx(LoadingButton, { loading: true, variant: "outlined", loadingPosition: "end", endIcon: _jsx(Start, {}), children: "End" })] }) }), _jsx(Block, { title: "Text", children: _jsxs(Stack, { direction: "row", gap: 3, children: [_jsx(LoadingButton, { loading: true, variant: "text", children: "Submit" }), _jsx(LoadingButton, { loading: true, loadingIndicator: "Loading\u2026", variant: "text", children: "Fetch data" }), _jsx(LoadingButton, { loading: true, variant: "text", loadingPosition: "start", startIcon: _jsx(Start, {}), children: "Start" }), _jsx(LoadingButton, { loading: true, variant: "text", loadingPosition: "end", endIcon: _jsx(Start, {}), children: "End" })] }) })] }) }), _jsx(TabPanel, { value: "3", children: _jsxs(Stack, { mt: 5, spacing: 4, children: [_jsx(Block, { title: "Default", children: _jsx(DefaultFab, {}) }), _jsx(Block, { title: "Extended", children: _jsx(ExtendedFab, {}) }), _jsx(Block, { title: "Sizes", children: _jsx(FabSizes, {}) })] }) }), _jsx(TabPanel, { value: "4", children: _jsxs(Stack, { mt: 5, spacing: 4, children: [_jsx(Block, { title: "Contained", children: _jsx(ContainedButtonGroup, {}) }), _jsx(Block, { title: "Outlined", children: _jsx(OutlinedButtonGroup, {}) }), _jsx(Block, { title: "Text", children: _jsx(TextButtonGroup, {}) }), _jsx(Block, { title: "Sizes", children: _jsx(ButtonGroupSizes, {}) })] }) })] }) }));
};
export default MuiButtonsPageView;

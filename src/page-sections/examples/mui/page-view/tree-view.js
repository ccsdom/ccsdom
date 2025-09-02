import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Grid from "@mui/material/Grid";
import { TreeItem, TreeView } from "@mui/lab";
import { ChevronRight, ExpandMore } from "@mui/icons-material";
// CUSTOM COMPONENTS
import ComponentPageLayout from "../../ComponentPageLayout";
import { Block } from "@/components/block";
const MuiTreeViewPageView = () => {
    return (_jsx(ComponentPageLayout, { title: "Tree View", fullLink: "https://mui.com/components/tree-view", children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(Block, { title: "Basic", children: _jsxs(TreeView, { "aria-label": "file system navigator", defaultCollapseIcon: _jsx(ExpandMore, {}), defaultExpandIcon: _jsx(ChevronRight, {}), sx: {
                                height: 200,
                                flexGrow: 1,
                                maxWidth: 400,
                                overflowY: "auto",
                            }, children: [_jsxs(TreeItem, { nodeId: "1", label: "Components", children: [_jsxs(TreeItem, { nodeId: "2", label: "Mui", children: [_jsx(TreeItem, { nodeId: "3", label: "Alert" }), _jsx(TreeItem, { nodeId: "4", label: "Avatar" }), _jsx(TreeItem, { nodeId: "5", label: "Button" })] }), _jsxs(TreeItem, { nodeId: "6", label: "Flexbox", children: [_jsx(TreeItem, { nodeId: "7", label: "Flex Between" }), _jsx(TreeItem, { nodeId: "8", label: "Flex Center" })] })] }), _jsxs(TreeItem, { nodeId: "9", label: "Documents", children: [_jsx(TreeItem, { nodeId: "10", label: "OSS" }), _jsx(TreeItem, { nodeId: "11", label: "MUI", children: _jsx(TreeItem, { nodeId: "12", label: "index.js" }) })] })] }) }) }), _jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(Block, { title: "Multi Select", children: _jsxs(TreeView, { multiSelect: true, "aria-label": "multi-select", defaultCollapseIcon: _jsx(ExpandMore, {}), defaultExpandIcon: _jsx(ChevronRight, {}), sx: {
                                height: 200,
                                flexGrow: 1,
                                maxWidth: 400,
                                overflowY: "auto",
                            }, children: [_jsxs(TreeItem, { nodeId: "1", label: "Components", children: [_jsxs(TreeItem, { nodeId: "2", label: "Mui", children: [_jsx(TreeItem, { nodeId: "3", label: "Alert" }), _jsx(TreeItem, { nodeId: "4", label: "Avatar" }), _jsx(TreeItem, { nodeId: "5", label: "Button" })] }), _jsxs(TreeItem, { nodeId: "6", label: "Flexbox", children: [_jsx(TreeItem, { nodeId: "7", label: "Flex Between" }), _jsx(TreeItem, { nodeId: "8", label: "Flex Center" })] })] }), _jsxs(TreeItem, { nodeId: "9", label: "Documents", children: [_jsx(TreeItem, { nodeId: "10", label: "OSS" }), _jsx(TreeItem, { nodeId: "11", label: "MUI", children: _jsx(TreeItem, { nodeId: "12", label: "index.js" }) })] })] }) }) })] }) }));
};
export default MuiTreeViewPageView;

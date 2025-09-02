import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Add } from "@mui/icons-material";
import { Fab, Stack } from "@mui/material";
const FabSizes = () => {
    return (_jsxs(Stack, { alignItems: "center", direction: "row", flexWrap: "wrap", gap: 3, children: [_jsxs(Fab, { size: "small", variant: "extended", color: "primary", "aria-label": "add", children: [_jsx(Add, {}), " Small"] }), _jsxs(Fab, { size: "medium", variant: "extended", color: "primary", "aria-label": "add", children: [_jsx(Add, {}), " Medium"] }), _jsxs(Fab, { size: "large", variant: "extended", color: "primary", "aria-label": "add", children: [_jsx(Add, {}), " Large"] }), _jsx(Fab, { size: "small", color: "primary", "aria-label": "add", children: _jsx(Add, {}) }), _jsx(Fab, { size: "medium", color: "primary", "aria-label": "add", children: _jsx(Add, {}) }), _jsx(Fab, { size: "large", color: "primary", "aria-label": "add", children: _jsx(Add, {}) })] }));
};
export default FabSizes;

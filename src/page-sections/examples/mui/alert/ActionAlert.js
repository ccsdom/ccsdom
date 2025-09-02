import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Alert, Stack, ButtonBase } from "@mui/material";
import { CheckCircle, Info, Warning } from "@mui/icons-material";
const ActionAlert = () => {
    return (_jsxs(Stack, { spacing: 3, children: [_jsx(Alert, { severity: "info", icon: _jsx(Info, {}), action: _jsxs(Stack, { className: "btn-group", direction: "row", children: [_jsx(ButtonBase, { children: "UNDO" }), _jsx(ButtonBase, { children: "Action" })] }), children: "This is an primary alert \u2014 check it out!" }), _jsx(Alert, { severity: "success", variant: "outlined", icon: _jsx(CheckCircle, {}), action: _jsxs(Stack, { className: "btn-group", direction: "row", children: [_jsx(ButtonBase, { children: "UNDO" }), _jsx(ButtonBase, { children: "Action" })] }), children: "This is a success alert \u2014 check it out!" }), _jsx(Alert, { severity: "warning", variant: "filled", icon: _jsx(Warning, {}), action: _jsxs(Stack, { className: "btn-group", direction: "row", children: [_jsx(ButtonBase, { children: "UNDO" }), _jsx(ButtonBase, { children: "Action" })] }), children: "This is a warning alert \u2014 check it out!" })] }));
};
export default ActionAlert;

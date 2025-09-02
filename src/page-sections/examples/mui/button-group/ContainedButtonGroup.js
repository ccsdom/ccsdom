import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ButtonGroup, Stack, Button } from "@mui/material";
const ContainedButtonGroup = () => {
    return (_jsxs(Stack, { direction: "row", flexWrap: "wrap", gap: 3, children: [_jsxs(ButtonGroup, { variant: "contained", children: [_jsx(Button, { children: "One" }), _jsx(Button, { children: "Two" }), _jsx(Button, { children: "Three" })] }), _jsxs(ButtonGroup, { color: "secondary", variant: "contained", children: [_jsx(Button, { children: "One" }), _jsx(Button, { children: "Two" }), _jsx(Button, { children: "Three" })] }), _jsxs(ButtonGroup, { color: "success", variant: "contained", children: [_jsx(Button, { children: "One" }), _jsx(Button, { children: "Two" }), _jsx(Button, { children: "Three" })] }), _jsxs(ButtonGroup, { color: "warning", variant: "contained", children: [_jsx(Button, { children: "One" }), _jsx(Button, { children: "Two" }), _jsx(Button, { children: "Three" })] }), _jsxs(ButtonGroup, { color: "error", variant: "contained", children: [_jsx(Button, { children: "One" }), _jsx(Button, { children: "Two" }), _jsx(Button, { children: "Three" })] })] }));
};
export default ContainedButtonGroup;

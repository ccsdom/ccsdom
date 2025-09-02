import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Stack } from "@mui/material";
import { Add } from "@mui/icons-material";
const WithIconButton = () => {
    return (_jsxs(Stack, { direction: "row", flexWrap: "wrap", gap: 3, children: [_jsx(Button, { color: "primary", startIcon: _jsx(Add, {}), children: "Icon Start" }), _jsx(Button, { variant: "outlined", endIcon: _jsx(Add, {}), children: "Icon End" }), _jsx(Button, { variant: "text", endIcon: _jsx(Add, {}), children: "Icon End With Text" })] }));
};
export default WithIconButton;

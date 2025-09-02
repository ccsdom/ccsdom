import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Stack } from "@mui/material";
const OutlinedButton = () => {
    return (_jsxs(Stack, { direction: "row", flexWrap: "wrap", gap: 3, children: [_jsx(Button, { variant: "outlined", color: "inherit", children: "Default" }), _jsx(Button, { variant: "outlined", color: "primary", children: "Primary" }), _jsx(Button, { variant: "outlined", color: "secondary", children: "Secondary" }), _jsx(Button, { variant: "outlined", color: "warning", children: "Warning" }), _jsx(Button, { variant: "outlined", color: "error", children: "Error" }), _jsx(Button, { variant: "outlined", color: "success", children: "Success" })] }));
};
export default OutlinedButton;

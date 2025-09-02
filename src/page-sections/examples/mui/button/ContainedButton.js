import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Stack } from "@mui/material";
const ContainedButton = () => {
    return (_jsxs(Stack, { direction: "row", flexWrap: "wrap", gap: 3, children: [_jsx(Button, { variant: "contained", color: "inherit", children: "Default" }), _jsx(Button, { variant: "contained", color: "primary", children: "Primary" }), _jsx(Button, { variant: "contained", color: "secondary", children: "Secondary" }), _jsx(Button, { variant: "contained", color: "warning", children: "Warning" }), _jsx(Button, { variant: "contained", color: "error", children: "Error" }), _jsx(Button, { variant: "contained", color: "success", children: "Success" })] }));
};
export default ContainedButton;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Stack } from "@mui/material";
const TextButton = () => {
    return (_jsxs(Stack, { direction: "row", flexWrap: "wrap", gap: 3, children: [_jsx(Button, { variant: "text", color: "inherit", children: "Default" }), _jsx(Button, { variant: "text", color: "primary", children: "Primary" }), _jsx(Button, { variant: "text", color: "secondary", children: "Secondary" }), _jsx(Button, { variant: "text", color: "warning", children: "Warning" }), _jsx(Button, { variant: "text", color: "error", children: "Error" }), _jsx(Button, { variant: "text", color: "success", children: "Success" })] }));
};
export default TextButton;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Stack } from "@mui/material";
const ButtonSizes = () => {
    return (_jsxs(Stack, { alignItems: "center", direction: "row", flexWrap: "wrap", gap: 3, children: [_jsx(Button, { size: "large", variant: "contained", color: "primary", children: "Large" }), _jsx(Button, { size: "medium", variant: "contained", color: "primary", children: "Medium" }), _jsx(Button, { size: "small", variant: "contained", color: "primary", children: "Small" })] }));
};
export default ButtonSizes;

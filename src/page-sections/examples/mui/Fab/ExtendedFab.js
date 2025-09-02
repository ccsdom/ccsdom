import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Add } from "@mui/icons-material";
import { Fab, Stack } from "@mui/material";
const ExtendedFab = () => {
    return (_jsxs(Stack, { direction: "row", flexWrap: "wrap", gap: 3, children: [_jsxs(Fab, { variant: "extended", color: "primary", "aria-label": "add", children: [_jsx(Add, {}), " Primary"] }), _jsxs(Fab, { variant: "extended", color: "secondary", "aria-label": "add", children: [_jsx(Add, {}), " Secondary"] }), _jsxs(Fab, { variant: "extended", color: "warning", "aria-label": "add", children: [_jsx(Add, {}), " Warning"] }), _jsxs(Fab, { variant: "extended", color: "error", "aria-label": "add", children: [_jsx(Add, {}), " Error"] }), _jsxs(Fab, { variant: "extended", color: "success", "aria-label": "add", children: [_jsx(Add, {}), " Success"] }), _jsxs(Fab, { variant: "extended", color: "default", "aria-label": "add", children: [_jsx(Add, {}), " Default"] })] }));
};
export default ExtendedFab;

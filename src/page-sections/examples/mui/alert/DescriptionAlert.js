import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Alert, AlertTitle, Stack } from "@mui/material";
const DescriptionAlert = () => {
    return (_jsxs(Stack, { spacing: 3, children: [_jsxs(Alert, { severity: "error", children: [_jsx(AlertTitle, { children: "Error" }), "This is an error alert \u2014 ", _jsx("strong", { children: "check it out!" })] }), _jsxs(Alert, { severity: "warning", children: [_jsx(AlertTitle, { children: "Warning" }), "This is a warning alert \u2014 ", _jsx("strong", { children: "check it out!" })] }), _jsxs(Alert, { severity: "info", children: [_jsx(AlertTitle, { children: "Info" }), "This is an info alert \u2014 ", _jsx("strong", { children: "check it out!" })] }), _jsxs(Alert, { severity: "success", children: [_jsx(AlertTitle, { children: "Success" }), "This is a success alert \u2014 ", _jsx("strong", { children: "check it out!" })] })] }));
};
export default DescriptionAlert;

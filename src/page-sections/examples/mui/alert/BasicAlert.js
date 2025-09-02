import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Alert, Stack } from "@mui/material";
import { CheckCircle, Error, Info, Warning } from "@mui/icons-material";
const BasicAlert = () => {
    return (_jsxs(Stack, { spacing: 3, children: [_jsx(Alert, { severity: "info", onClose: () => { }, icon: _jsx(Info, {}), children: "This is an primary alert \u2014 check it out!" }), _jsx(Alert, { severity: "success", onClose: () => { }, icon: _jsx(CheckCircle, {}), children: "This is a success alert \u2014 check it out!" }), _jsx(Alert, { severity: "warning", onClose: () => { }, icon: _jsx(Warning, {}), children: "This is a warning alert \u2014 check it out!" }), _jsx(Alert, { severity: "error", onClose: () => { }, icon: _jsx(Error, {}), children: "This is an error alert \u2014 check it out!" })] }));
};
export default BasicAlert;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Card, Divider, Stack, Switch, Box, TextField, } from "@mui/material";
// CUSTOM COMPONENTS
import { H6, Small } from "@/components/typography";
const TwoStepVerification = () => {
    return (_jsxs(Card, { children: [_jsxs(Box, { padding: 3, children: [_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, children: [_jsx(H6, { fontSize: 14, children: "Two-step verification" }), _jsx(Switch, { defaultChecked: true })] }), _jsx(Small, { color: "text.secondary", children: "Start by entering your password so that we know it's you. Then we'll walk you through two more simple steps." })] }), _jsx(Divider, {}), _jsxs(Box, { px: 3, py: 4, maxWidth: 450, children: [_jsx(TextField, { fullWidth: true, label: "Account Password", value: "Enter Current Password" }), _jsx(Small, { mt: 1.5, display: "block", color: "text.secondary", children: "This is the password you use to log in to your Front account." }), _jsxs(Stack, { direction: "row", spacing: 2, mt: 4, children: [_jsx(Button, { variant: "contained", children: "Save Changes" }), _jsx(Button, { variant: "outlined", children: "Cancel" })] })] })] }));
};
export default TwoStepVerification;

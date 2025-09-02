import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Card, Divider, Stack, Box, Checkbox } from "@mui/material";
// CUSTOM COMPONENTS
import { H6, Paragraph } from "@/components/typography";
const DeleteAccount = () => {
    return (_jsxs(Card, { sx: { pb: 3 }, children: [_jsxs(Box, { padding: 3, children: [_jsx(H6, { fontSize: 14, children: "Delete Your Account" }), _jsx(Paragraph, { mt: 0.5, fontSize: 13, lineHeight: 1.7, maxWidth: 600, children: "When you delete your account, you lose access to Front account services, and we permanently delete your personal data. You can cancel the deletion for 14 days." })] }), _jsx(Divider, {}), _jsxs(Stack, { direction: "row", alignItems: "center", padding: 3, pl: 2, children: [_jsx(Checkbox, {}), _jsx(H6, { fontSize: 12, children: "Confirm that I want to delete my account." })] }), _jsx(Box, { pl: 3, maxWidth: 120, children: _jsx(Button, { color: "error", fullWidth: true, children: "Delete" }) })] }));
};
export default DeleteAccount;

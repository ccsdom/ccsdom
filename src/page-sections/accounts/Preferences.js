import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, Grid, Stack, Switch, Button, Divider, Checkbox, TextField, } from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
import { nanoid } from "nanoid";
// CUSTOM COMPONENTS
import { FlexBetween } from "@/components/flexbox";
import { H6, Paragraph, Small } from "@/components/typography";
// CUSTOM DUMMY DATA SET
const PREFERENCES = [
    {
        id: nanoid(),
        checked: false,
        title: "Successful Payments",
        subtitle: "Receive a notification for every successful payment.",
    },
    {
        id: nanoid(),
        checked: true,
        title: "Payouts",
        subtitle: "Receive a notification for every initiated payout.",
    },
    {
        id: nanoid(),
        checked: true,
        title: "Fee Collection",
        subtitle: "Receive a notification for every initiated payout.",
    },
    {
        id: nanoid(),
        checked: false,
        title: "Invoice Payments",
        subtitle: "Receive a notification for every initiated payout.",
    },
];
const Preferences = () => {
    return (_jsxs(Card, { children: [_jsx(H6, { fontSize: 14, padding: 3, children: "General Preferences" }), _jsx(Divider, {}), _jsx(Box, { padding: 3, children: _jsxs(Grid, { container: true, spacing: 4, children: [_jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsxs(TextField, { select: true, fullWidth: true, value: "english", label: "Language", variant: "outlined", placeholder: "Language", SelectProps: { native: true, IconComponent: KeyboardArrowDown }, children: [_jsx("option", { value: "english", children: "English" }), _jsx("option", { value: "bangla", children: "Bangla" }), _jsx("option", { value: "hindi", children: "Hindi" })] }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(TextField, { variant: "outlined", label: "Time Zone", fullWidth: true, value: "12:00 AM" }) }), _jsxs(Grid, { item: true, sm: 6, xs: 12, children: [_jsxs(FlexBetween, { children: [_jsxs("div", { children: [_jsx(Paragraph, { fontWeight: 500, children: "Early release" }), _jsx(Small, { color: "text.secondary", children: "Get included on new features." })] }), _jsx(Switch, { defaultChecked: true })] }), _jsxs(FlexBetween, { mt: 2, children: [_jsxs("div", { children: [_jsx(Paragraph, { fontWeight: 500, children: "See info about people who view my profile" }), _jsx(Small, { color: "text.secondary", children: "More about viewer info." })] }), _jsx(Switch, { defaultChecked: true })] })] })] }) }), _jsx(H6, { fontSize: 14, p: 3, pt: 0, children: "Email Preferences" }), _jsx(Divider, {}), _jsx(Stack, { spacing: 2, p: 3, pl: 2, children: PREFERENCES.map(({ id, title, subtitle, checked }) => (_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(Checkbox, { checked: checked }), _jsxs("div", { children: [_jsx(Paragraph, { fontWeight: 500, lineHeight: 1, children: title }), _jsx(Small, { color: "text.secondary", children: subtitle })] })] }, id))) }), _jsxs(Stack, { direction: "row", spacing: 3, padding: 3, children: [_jsx(Button, { variant: "contained", children: "Save Changes" }), _jsx(Button, { variant: "outlined", children: "Cancel" })] })] }));
};
export default Preferences;

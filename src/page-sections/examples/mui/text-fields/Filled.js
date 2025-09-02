import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { IconButton, InputAdornment, MenuItem, Stack, TextField, } from "@mui/material";
import { Password, Visibility, VisibilityOff } from "@mui/icons-material";
import { Masonry } from "@mui/lab";
// CUSTOM COMPONENT
import { Block } from "@/components/block";
const currencies = [
    { value: "USD", label: "$" },
    { value: "EUR", label: "€" },
    { value: "BTC", label: "฿" },
    { value: "JPY", label: "¥" },
];
const Filled = () => {
    const [visiblePassword, setVisiblePassword] = useState(false);
    const handlePasswordVisibleToggle = () => setVisiblePassword((state) => !state);
    return (_jsxs(Masonry, { columns: { md: 2, xs: 1 }, spacing: 3, children: [_jsx(Block, { title: "Basic", bgTransparent: true, children: _jsxs(Stack, { spacing: 3, children: [_jsx(TextField, { label: "Name", size: "medium", variant: "filled" }), _jsx(TextField, { variant: "filled", label: "Name", size: "medium", defaultValue: "Nabed Khan" }), _jsx(TextField, { size: "medium", type: "password", variant: "filled", label: "Password", defaultValue: "123456" }), _jsx(TextField, { variant: "filled", type: "email", label: "Email", size: "medium", disabled: true })] }) }), _jsx(Block, { title: "With Adornment", bgTransparent: true, children: _jsxs(Stack, { spacing: 3, children: [_jsx(TextField, { size: "medium", variant: "filled", label: "With Normal TextField", id: "outlined-start-adornment", InputProps: {
                                startAdornment: (_jsx(InputAdornment, { position: "start", children: "kg" })),
                            } }), _jsx(TextField, { size: "medium", label: "Password", variant: "filled", type: visiblePassword ? "text" : "password", InputProps: {
                                endAdornment: (_jsx(IconButton, { onClick: handlePasswordVisibleToggle, sx: { p: 0 }, children: visiblePassword ? _jsx(VisibilityOff, {}) : _jsx(Visibility, {}) })),
                            } }), _jsx(TextField, { size: "medium", variant: "filled", label: "Password", defaultValue: "123456", type: visiblePassword ? "text" : "password", InputProps: {
                                endAdornment: (_jsx(IconButton, { onClick: handlePasswordVisibleToggle, sx: { p: 0 }, children: visiblePassword ? _jsx(VisibilityOff, {}) : _jsx(Visibility, {}) })),
                                startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(Password, {}) })),
                            } })] }) }), _jsx(Block, { title: "With Helper Text", bgTransparent: true, children: _jsxs(Stack, { spacing: 3, children: [_jsx(TextField, { size: "medium", variant: "filled", label: "Helper text", id: "outlined-helperText", defaultValue: "Nabed Khan", helperText: "Some important text" }), _jsx(TextField, { error: true, label: "Error", size: "medium", variant: "filled", defaultValue: "Hello World", helperText: "Incorrect entry.", id: "outlined-error-helper-text" })] }) }), _jsx(Block, { title: "Select", bgTransparent: true, children: _jsxs(Stack, { spacing: 3, children: [_jsx(TextField, { select: true, variant: "filled", size: "medium", label: "Select", defaultValue: "EUR", children: currencies.map((option) => (_jsx(MenuItem, { value: option.value, children: option.label }, option.value))) }), _jsx(TextField, { select: true, size: "medium", variant: "filled", defaultValue: "EUR", label: "Native select", SelectProps: { native: true }, children: currencies.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) })] }) }), _jsx(Block, { title: "Size", bgTransparent: true, children: _jsxs(Stack, { spacing: 3, children: [_jsx(TextField, { label: "Size", variant: "filled", defaultValue: "Small" }), _jsx(TextField, { label: "Size", variant: "filled", defaultValue: "Medium", size: "medium" })] }) })] }));
};
export default Filled;

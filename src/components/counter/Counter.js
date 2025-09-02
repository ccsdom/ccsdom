import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Add, Remove } from "@mui/icons-material";
import { IconButton, InputBase, styled } from "@mui/material";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
// ==============================================================
// STYLED COMPONENT
const StyledInputBase = styled(InputBase)(({ theme, colors, variant, button }) => ({
    padding: 4,
    borderRadius: variant === "circular" ? 32 : 6,
    border: `1px solid ${theme.palette.divider}`,
    "& .MuiInputBase-input": {
        maxWidth: 30,
        fontSize: 14,
        fontWeight: 500,
        textAlign: "center",
    },
    "& .MuiIconButton-root": {
        color: theme.palette.grey[400],
        borderRadius: variant === "circular" ? 32 : 4,
        backgroundColor: colors === "dark"
            ? "white"
            : theme.palette.grey[isDark(theme) ? 700 : 100],
    },
    ...(colors === "dark" && {
        border: 0,
        backgroundColor: theme.palette.grey[100],
    }),
    ...(button === "outlined" && {
        "& .MuiIconButton-root": {
            backgroundColor: isDark(theme) ? theme.palette.grey[700] : "white",
            color: theme.palette.grey[400],
            borderRadius: variant === "circular" ? 32 : 4,
            border: `1px solid ${theme.palette.grey[200]}`,
        },
    }),
}));
const Counter = ({ colors = "light", variant = "rounded", button = "plain", }) => {
    const [value, setValue] = useState(0);
    // QUANTITY INCREMENT BUTTON
    const StartAdornment = (_jsx(IconButton, { onClick: () => setValue((state) => state + 1), children: _jsx(Add, { fontSize: "small" }) }));
    // QUANTITY DECREMENT BUTTON
    const EndAdornment = (_jsx(IconButton, { onClick: () => setValue((state) => state - 1), children: _jsx(Remove, { fontSize: "small" }) }));
    return (_jsx(StyledInputBase, { value: value, colors: colors, button: button, variant: variant, endAdornment: EndAdornment, startAdornment: StartAdornment }));
};
export default Counter;

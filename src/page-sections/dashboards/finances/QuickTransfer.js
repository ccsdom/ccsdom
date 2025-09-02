import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment, useState } from "react";
import { Box, Button, Card, Fade, Menu, MenuItem, Stack, TextField, useTheme, } from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
// CUSTOM COMPONENTS
import { Paragraph, Span } from "@/components/typography";
import { FlexBox } from "@/components/flexbox";
const QuickTransfer = () => {
    const theme = useTheme();
    const [selectCard, setSelectCard] = useState("Visa");
    const [anchorEl, setAnchorEl] = useState(null);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = (value) => () => {
        if (value)
            setSelectCard(value);
        setAnchorEl(null);
    };
    const END_ADORNMENT = (_jsxs(Fragment, { children: [_jsxs(Stack, { direction: "row", alignItems: "center", onClick: handleClick, sx: {
                    pl: 1.5,
                    cursor: "pointer",
                    borderLeft: `2px solid ${theme.palette.divider}`,
                }, children: [_jsx(Span, { children: selectCard }), " ", _jsx(KeyboardArrowDown, {})] }), _jsxs(Menu, { id: "fade-menu", anchorEl: anchorEl, open: Boolean(anchorEl), onClose: handleClose(null), TransitionComponent: Fade, children: [_jsx(MenuItem, { onClick: handleClose("Visa"), children: "Visa" }), _jsx(MenuItem, { onClick: handleClose("Master"), children: "Master" }), _jsx(MenuItem, { onClick: handleClose("Credit"), children: "Credit" })] })] }));
    return (_jsxs(Card, { sx: { p: 3 }, children: [_jsx(Paragraph, { fontSize: 18, fontWeight: 500, children: "Quick Transfer" }), _jsx(Box, { mt: 3, mb: 2, children: _jsx(TextField, { fullWidth: true, placeholder: "4436  2548  2654  236", InputProps: { endAdornment: END_ADORNMENT } }) }), _jsxs(FlexBox, { gap: 2, alignItems: "center", children: [_jsx(Button, { children: "Send Money" }), _jsx(Button, { variant: "outlined", color: "secondary", children: "Save Draft" })] })] }));
};
export default QuickTransfer;

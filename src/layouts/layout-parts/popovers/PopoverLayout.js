import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, Divider, Popover } from "@mui/material";
// CUSTOM COMPONENT
import { H4 } from "@/components/typography";
// ===================================================================
const PopoverLayout = (props) => {
    const { children, anchorRef, popoverOpen, popoverClose, minWidth = 250, maxWidth = 375, hiddenViewButton, title = "Notifications", disableRestoreFocus = false, // Valeur par défaut
     } = props;
    return (_jsxs(Popover, { open: popoverOpen, onClose: popoverClose, anchorEl: anchorRef.current, anchorOrigin: { horizontal: "left", vertical: "bottom" }, disableRestoreFocus: disableRestoreFocus, slotProps: {
            paper: {
                sx: { minWidth, maxWidth, width: "100%", padding: "0.5rem 0" },
            },
        }, children: [_jsx(H4, { fontSize: 16, fontWeight: "500", p: 2, pt: 1.5, children: title }), _jsx(Divider, {}), children, !hiddenViewButton ? (_jsx(Box, { p: 1, pb: 0.5, children: _jsx(Button, { variant: "text", fullWidth: true, disableRipple: true, children: "Voir toutes Notifications" }) })) : null] }));
};
export default PopoverLayout;

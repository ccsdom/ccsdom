import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Fade, IconButton, Menu, MenuItem, styled, } from "@mui/material";
import MoreVert from "@mui/icons-material/MoreVert";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
// STYLED COMPONENT
const StyledIconButton = styled(IconButton)(({ theme }) => ({
    flexShrink: 0,
    color: theme.palette.grey[isDark(theme) ? 300 : 400],
}));
const optionList = ["Create", "Edit", "Delete"];
// ==============================================================
const MoreButton = ({ size = "large", options = optionList, renderOptions, ...props }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const handleClose = () => setAnchorEl(null);
    return (_jsxs("div", { children: [_jsx(StyledIconButton, { size: size, "aria-label": "more", "aria-haspopup": "true", onClick: (e) => setAnchorEl(e.currentTarget), ...props, children: _jsx(MoreVert, { fontSize: "small" }) }), _jsx(Menu, { anchorEl: anchorEl, onClose: handleClose, open: Boolean(anchorEl), TransitionComponent: Fade, children: renderOptions
                    ? renderOptions(handleClose)
                    : options.map((option) => (_jsx(MenuItem, { onClick: handleClose, children: option }, option))) })] }));
};
export default MoreButton;

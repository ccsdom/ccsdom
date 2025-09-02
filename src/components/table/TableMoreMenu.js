import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment } from "react";
import MoreVert from "@mui/icons-material/MoreVert";
import { IconButton, Menu } from "@mui/material";
// ==============================================================
const TableMoreMenu = (props) => {
    const { open, handleClose, handleOpen, children } = props;
    return (_jsxs(Fragment, { children: [_jsx(IconButton, { color: "secondary", onClick: handleOpen, children: _jsx(MoreVert, { fontSize: "small" }) }), _jsx(Menu, { anchorEl: open, open: Boolean(open), onClose: handleClose, transformOrigin: { vertical: "center", horizontal: "right" }, children: children })] }));
};
export default TableMoreMenu;

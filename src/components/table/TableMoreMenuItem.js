import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ListItemIcon, MenuItem, ListItemText } from "@mui/material";
// ==============================================================
const TableMoreMenuItem = (props) => {
    const { Icon, title, handleClick } = props;
    return (_jsxs(MenuItem, { onClick: handleClick, children: [_jsx(ListItemIcon, { children: _jsx(Icon, { fontSize: "small", color: "inherit" }) }), _jsx(ListItemText, { disableTypography: true, children: title })] }));
};
export default TableMoreMenuItem;

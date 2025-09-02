import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import Delete from "@mui/icons-material/Delete";
import { IconButton, Toolbar, Tooltip } from "@mui/material";
// CUSTOM COMPONENT
import { Paragraph } from "@/components/typography";
// ==============================================================
const TableToolbar = (props) => {
    return (_jsxs(Toolbar, { sx: { backgroundColor: "action.selected" }, children: [_jsxs(Paragraph, { fontWeight: 600, flex: "1 1 100%", color: "inherit", children: [props.selected, " selected"] }), _jsx(Tooltip, { title: "Delete", children: _jsx(IconButton, { onClick: props.handleDeleteRows, children: _jsx(Delete, {}) }) })] }));
};
export default TableToolbar;

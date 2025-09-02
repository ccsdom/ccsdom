import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Checkbox, TableCell, TableRow } from "@mui/material";
import { DeleteOutline, Edit, Folder, RemoveRedEye } from "@mui/icons-material";
// CUSTOM COMPONENTS
import { H6 } from "@/components/typography";
import { FlexBox } from "@/components/flexbox";
import { TableMoreMenuItem, TableMoreMenu } from "@/components/table";
// ==============================================================
const FileManagerTableRow = ({ data, isSelected, handleSelectRow, handleDeleteFile, }) => {
    const [openMenuEl, setOpenMenuEl] = useState(null);
    const handleOpenMenu = (event) => {
        setOpenMenuEl(event.currentTarget);
    };
    const handleCloseOpenMenu = () => setOpenMenuEl(null);
    return (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { padding: "checkbox", children: _jsx(Checkbox, { size: "small", color: "primary", checked: isSelected, onClick: (event) => handleSelectRow(event, data.id) }) }), _jsx(TableCell, { padding: "normal", children: _jsxs(FlexBox, { className: "name", alignItems: "center", gap: 1.5, children: [_jsx(Folder, {}), _jsx(H6, { fontSize: 14, color: "text.primary", children: data.title })] }) }), _jsx(TableCell, { padding: "normal", children: data.files }), _jsx(TableCell, { padding: "normal", children: data.size }), _jsx(TableCell, { padding: "normal", children: data.createdAt }), _jsx(TableCell, { padding: "normal", align: "right", children: _jsxs(TableMoreMenu, { open: openMenuEl, handleOpen: handleOpenMenu, handleClose: handleCloseOpenMenu, children: [_jsx(TableMoreMenuItem, { Icon: RemoveRedEye, title: "View", handleClick: () => {
                                handleCloseOpenMenu();
                            } }), _jsx(TableMoreMenuItem, { Icon: Edit, title: "Edit", handleClick: () => {
                                handleCloseOpenMenu();
                            } }), _jsx(TableMoreMenuItem, { Icon: DeleteOutline, title: "Delete", handleClick: () => {
                                handleDeleteFile(data.id);
                                handleCloseOpenMenu();
                            } })] }) })] }));
};
export default FileManagerTableRow;

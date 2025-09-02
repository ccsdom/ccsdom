import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Checkbox, TableCell, TableHead, TableRow, TableSortLabel, } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
// CUSTOM COMPONENT
import { Span } from "@/components/typography";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
// ==============================================================
const headCells = [
    { id: "name", numeric: false, disablePadding: false, label: "Folder Name" },
    { id: "items", numeric: true, disablePadding: false, label: "File Items" },
    { id: "size", numeric: true, disablePadding: false, label: "File Size" },
    { id: "date", numeric: true, disablePadding: false, label: "Created Date" },
    { id: "" },
];
const FileManagerTableHead = (props) => {
    const { onSelectAllRows, order, orderBy, numSelected, rowCount, onRequestSort, } = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };
    return (_jsx(TableHead, { sx: {
            backgroundColor: (theme) => (isDark(theme) ? "grey.700" : "grey.100"),
        }, children: _jsxs(TableRow, { children: [_jsx(TableCell, { padding: "checkbox", children: _jsx(Checkbox, { size: "small", color: "primary", onChange: onSelectAllRows, checked: rowCount > 0 && numSelected === rowCount, indeterminate: numSelected > 0 && numSelected < rowCount }) }), headCells.map((headCell) => (_jsx(TableCell, { padding: headCell.disablePadding ? "none" : "normal", sortDirection: orderBy === headCell.id ? order : false, sx: { color: "text.primary", fontWeight: 600 }, children: _jsxs(TableSortLabel, { active: orderBy === headCell.id, onClick: createSortHandler(headCell.id), direction: orderBy === headCell.id ? order : "asc", children: [headCell.label, orderBy === headCell.id ? (_jsx(Span, { sx: visuallyHidden, children: order === "desc" ? "sorted descending" : "sorted ascending" })) : null] }) }, headCell.id)))] }) }));
};
export default FileManagerTableHead;

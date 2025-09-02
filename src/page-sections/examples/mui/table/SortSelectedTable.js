import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { Delete, FilterList } from "@mui/icons-material";
import { Paper, Table, Toolbar, Tooltip, TableRow, Checkbox, TableBody, TableCell, TableHead, IconButton, TableContainer, TableSortLabel, TablePagination, } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { Paragraph, Span } from "@/components/typography";
import { Scrollbar } from "@/components/scrollbar";
import { isDark } from "@/utils/constants";
import useMuiTable, { getComparator, stableSort } from "@/hooks/useMuiTable";
// ==============================================================
// dummy data
const createData = (name, calories, fat, carbs, protein) => ({ name, calories, fat, carbs, protein });
const rows = [
    createData("Oreo", 437, 18.0, 63, 4.0),
    createData("Donut", 452, 25.0, 51, 4.9),
    createData("Eclair", 262, 16.0, 24, 6.0),
    createData("Cupcake", 305, 3.7, 67, 4.3),
    createData("KitKat", 518, 26.0, 65, 7.0),
    createData("Nougat", 360, 19.0, 9, 37.0),
    createData("Lollipop", 392, 0.2, 98, 0.0),
    createData("Honeycomb", 408, 3.2, 87, 6.5),
    createData("Marshmallow", 318, 0, 81, 2.0),
    createData("Jelly Bean", 375, 0.0, 94, 0.0),
    createData("Gingerbread", 356, 16.0, 49, 3.9),
    createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
    createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
];
// ==============================================================
const headCells = [
    {
        id: "name",
        numeric: false,
        disablePadding: true,
        label: "Dessert (100g serving)",
    },
    { id: "calories", numeric: true, disablePadding: false, label: "Calories" },
    { id: "fat", numeric: true, disablePadding: false, label: "Fat (g)" },
    { id: "carbs", numeric: true, disablePadding: false, label: "Carbs (g)" },
    { id: "protein", numeric: true, disablePadding: false, label: "Protein (g)" },
];
function CustomTableHead(props) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, } = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };
    return (_jsx(TableHead, { sx: {
            backgroundColor: (theme) => (isDark(theme) ? "grey.700" : "grey.100"),
        }, children: _jsxs(TableRow, { children: [_jsx(TableCell, { padding: "checkbox", children: _jsx(Checkbox, { size: "small", color: "primary", onChange: onSelectAllClick(rows.map((n) => n.name)), checked: rowCount > 0 && numSelected === rowCount, indeterminate: numSelected > 0 && numSelected < rowCount }) }), headCells.map((headCell) => (_jsx(TableCell, { align: headCell.numeric ? "right" : "left", padding: headCell.disablePadding ? "none" : "normal", sortDirection: orderBy === headCell.id ? order : false, sx: { color: "text.primary", fontWeight: 600 }, children: _jsxs(TableSortLabel, { active: orderBy === headCell.id, onClick: createSortHandler(headCell.id), direction: orderBy === headCell.id ? order : "asc", children: [headCell.label, orderBy === headCell.id ? (_jsx(Span, { sx: visuallyHidden, children: order === "desc" ? "sorted descending" : "sorted ascending" })) : null] }) }, headCell.id)))] }) }));
}
function TableToolbar({ numSelected }) {
    return (_jsxs(Toolbar, { sx: { backgroundColor: numSelected ? "primary.100" : "transparent" }, children: [numSelected > 0 ? (_jsxs(Paragraph, { fontWeight: 600, flex: "1 1 100%", color: "inherit", children: [numSelected, " selected"] })) : (_jsx(Paragraph, { fontWeight: 600, flex: "1 1 100%", id: "tableTitle", children: "Nutrition" })), numSelected > 0 ? (_jsx(Tooltip, { title: "Delete", children: _jsx(IconButton, { children: _jsx(Delete, {}) }) })) : (_jsx(Tooltip, { title: "Filter list", children: _jsx(IconButton, { children: _jsx(FilterList, {}) }) }))] }));
}
const SortSelectedTable = () => {
    const { order, orderBy, emptyRows, handleChangePage, handleChangeRowsPerPage, handleRequestSort, handleSelectAllRows, handleSelectRow, isSelected, page, rowsPerPage, selected, } = useMuiTable({});
    const visibleRows = useMemo(() => stableSort(rows, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [order, orderBy, page, rowsPerPage]);
    return (_jsxs(Paper, { sx: { width: "100%", boxShadow: 2, borderRadius: 2, overflow: "hidden" }, children: [_jsx(TableToolbar, { numSelected: selected.length }), _jsx(TableContainer, { children: _jsx(Scrollbar, { children: _jsxs(Table, { sx: { minWidth: 750 }, children: [_jsx(CustomTableHead, { order: order, orderBy: orderBy, rowCount: rows.length, numSelected: selected.length, onRequestSort: handleRequestSort, onSelectAllClick: handleSelectAllRows }), _jsxs(TableBody, { children: [visibleRows.map((row, index) => {
                                        const isItemSelected = isSelected(row.name);
                                        const labelId = `enhanced-table-checkbox-${index}`;
                                        return (_jsxs(TableRow, { hover: true, tabIndex: -1, role: "checkbox", selected: isItemSelected, "aria-checked": isItemSelected, onClick: (event) => handleSelectRow(event, row.name), sx: { cursor: "pointer" }, children: [_jsx(TableCell, { padding: "checkbox", children: _jsx(Checkbox, { color: "primary", size: "small", checked: isItemSelected }) }), _jsx(TableCell, { component: "th", id: labelId, scope: "row", padding: "none", children: row.name }), _jsx(TableCell, { padding: "normal", align: "right", children: row.calories }), _jsx(TableCell, { padding: "normal", align: "right", children: row.fat }), _jsx(TableCell, { padding: "normal", align: "right", children: row.carbs }), _jsx(TableCell, { padding: "normal", align: "right", children: row.protein })] }, row.name));
                                    }), emptyRows(page, rowsPerPage, rows.length) > 0 && (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6 }) }))] })] }) }) }), _jsx(TablePagination, { page: page, component: "div", count: rows.length, rowsPerPage: rowsPerPage, onPageChange: handleChangePage, rowsPerPageOptions: [5, 10, 25], onRowsPerPageChange: handleChangeRowsPerPage })] }));
};
export default SortSelectedTable;

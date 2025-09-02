import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Card, Table, Button, TableBody, TablePagination, TextField, } from "@mui/material";
import { Search, Add } from "@mui/icons-material";
// CUSTOM COMPONENTS
import { H6 } from "@/components/typography";
import { FlexBox } from "@/components/flexbox";
import { Scrollbar } from "@/components/scrollbar";
import { TableDataNotFound, TableToolbar } from "@/components/table";
import FileManagerTableRow from "../FileManagerTableRow";
import FileManagerTableHead from "../FileManagerTableHead";
// CUSTOM DEFINED HOOK
import useMuiTable from "@/hooks/useMuiTable";
// STYLED COMPONENTS
import { HeadingWrapper } from "../styles";
// CUSTOM DUMMY DATA
import { DATA } from "../data";
const FileManagerPageView = () => {
    const [files, setFiles] = useState([...DATA]);
    const { page, order, orderBy, selected, isSelected, rowsPerPage, handleSelectRow, handleChangePage, handleRequestSort, handleSelectAllRows, handleChangeRowsPerPage, } = useMuiTable({ defaultOrderBy: "name" });
    const handleDeleteFile = (id) => {
        setFiles((state) => state.filter((item) => item.id !== id));
    };
    const handleAllFilesDelete = () => {
        setFiles((state) => state.filter((item) => !selected.includes(item.id)));
        handleSelectAllRows([])();
    };
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsxs(Card, { children: [_jsxs(HeadingWrapper, { children: [_jsx(H6, { fontSize: 18, fontWeight: 600, children: "File Manager" }), _jsxs(FlexBox, { className: "search", justifyContent: "end", gap: 2, flex: 1, children: [_jsx(TextField, { placeholder: "Search Folder", InputProps: { startAdornment: _jsx(Search, {}) } }), _jsx(Button, { startIcon: _jsx(Add, {}), children: "New Folder" })] })] }), selected.length > 0 && (_jsx(TableToolbar, { selected: selected.length, handleDeleteRows: handleAllFilesDelete })), _jsx(Scrollbar, { autoHide: false, children: _jsxs(Table, { sx: { minWidth: 700 }, children: [_jsx(FileManagerTableHead, { order: order, orderBy: orderBy, numSelected: selected.length, rowCount: files.length, onRequestSort: handleRequestSort, onSelectAllRows: handleSelectAllRows(files.map((row) => row.id)) }), _jsxs(TableBody, { children: [files
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((file) => (_jsx(FileManagerTableRow, { data: file, handleSelectRow: handleSelectRow, isSelected: isSelected(file.id), handleDeleteFile: handleDeleteFile }, file.id))), files.length === 0 && _jsx(TableDataNotFound, {})] })] }) }), _jsx(TablePagination, { page: page, component: "div", rowsPerPage: rowsPerPage, count: files.length, onPageChange: handleChangePage, rowsPerPageOptions: [5, 10, 25], onRowsPerPageChange: handleChangeRowsPerPage })] }) }));
};
export default FileManagerPageView;

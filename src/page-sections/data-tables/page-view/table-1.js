import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Card, Table, TableRow, TableBody, TableHead, TablePagination, } from "@mui/material";
import { flexRender, useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, } from "@tanstack/react-table";
// CUSTOM PAGE SECTION COMPONENT
import TableActions from "../TableActions";
import TableColumnFilter from "../TableColumnFilter";
// CUSTOM COMPONENTS
import { Scrollbar } from "@/components/scrollbar";
// CUSTOM DUMMY DATA
import { DATA } from "@/__fakeData__/data-tables";
// CUSTOM STYLED COMPONENTS
import { BodyTableRow, BodyTableCell, HeadTableCell } from "../styles";
// TABLE COLUMN SHAPE
import { columns } from "../columns";
const DataTable1PageView = () => {
    const [userList, setUserList] = useState([...DATA]);
    const [rowSelection, setRowSelection] = useState({});
    const table = useReactTable({
        columns,
        data: userList,
        enableRowSelection: true,
        state: { rowSelection },
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });
    // SELECTED ROW DATA LIST
    const SELECTED_ROWS = table.getSelectedRowModel().flatRows;
    // ANY SPECIFIC COLUMN FILTERING EXIST OR NOT
    const HAS_COLUMN_FILTER = table.getState().columnFilters.length;
    // HANDLE GLOBAL SEARCH BASED ON NAME
    const handleSearch = (text) => {
        if (text) {
            const updatedUserList = userList.filter((item) => {
                return item.name.toLowerCase().includes(text.toLowerCase());
            });
            setUserList(updatedUserList);
        }
        else {
            setUserList([...DATA]);
        }
    };
    // RESET ALL COLUMN FILTERING IF EXIST
    const handleResetColumnFilter = () => {
        table.resetColumnFilters();
    };
    // HANDLE DELETE SELECTED ROW
    const handleDeleteRow = () => {
        const userIdList = SELECTED_ROWS.map((row) => row.original.id);
        const updatesUserList = userList.filter((user) => !userIdList.includes(user.id));
        setUserList(updatesUserList);
        setRowSelection({});
    };
    return (_jsxs(Box, { pt: 2, pb: 4, children: [_jsx(TableActions, { rowSelected: SELECTED_ROWS.length, hasColumnFilter: HAS_COLUMN_FILTER, handleSearch: handleSearch, handleDeleteRow: handleDeleteRow, handleResetColumnFilter: handleResetColumnFilter }), _jsxs(Card, { sx: { marginTop: 3, pt: 1 }, children: [_jsx(Scrollbar, { children: _jsxs(Table, { children: [_jsx(TableHead, { children: table.getHeaderGroups().map((headerGroup) => (_jsx(TableRow, { children: headerGroup.headers.map((header) => {
                                            return (_jsx(HeadTableCell, { sx: { minWidth: header.getSize() }, children: header.isPlaceholder ? null : (_jsxs(_Fragment, { children: [flexRender(header.column.columnDef.header, header.getContext()), header.column.getCanFilter() ? (_jsx(TableColumnFilter, { column: header.column, table: table })) : null] })) }, header.id));
                                        }) }, headerGroup.id))) }), _jsx(TableBody, { children: table.getRowModel().rows.map((row) => {
                                        return (_jsx(BodyTableRow, { selected_row: rowSelection[row.id] ? 1 : 0, children: row.getVisibleCells().map((cell) => {
                                                return (_jsx(BodyTableCell, { children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id));
                                            }) }, row.id));
                                    }) })] }) }), _jsx(TablePagination, { component: "div", rowsPerPageOptions: [5, 10, 25], page: table.getState().pagination.pageIndex, rowsPerPage: table.getState().pagination.pageSize, count: table.getFilteredRowModel().rows.length, onPageChange: (_, page) => table.setPageIndex(page), onRowsPerPageChange: (e) => table.setPageSize(e.target.value ? Number(e.target.value) : 5) })] })] }));
};
export default DataTable1PageView;

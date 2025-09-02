import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Card, Table, TableBody, TableContainer, TablePagination, } from "@mui/material";
// CUSTOM COMPONENTS
import { Scrollbar } from "@/components/scrollbar";
import { TableDataNotFound, TableToolbar } from "@/components/table";
// CUSTOM PAGE SECTION COMPONENTS
import SearchArea from "../SearchArea";
import HeadingArea from "../HeadingArea";
import UserTableRow from "../UserTableRow";
import UserTableHead from "../UserTableHead";
// CUSTOM DEFINED HOOK
import useMuiTable, { getComparator, stableSort } from "@/hooks/useMuiTable";
// CUSTOM DUMMY DATA
import { USER_LIST } from "@/__fakeData__/users";
const UserList1PageView = () => {
    const [users, setUsers] = useState([...USER_LIST]);
    const [userFilter, setUserFilter] = useState({ role: "", search: "" });
    const { page, order, orderBy, selected, isSelected, rowsPerPage, handleSelectRow, handleChangePage, handleRequestSort, handleSelectAllRows, handleChangeRowsPerPage, } = useMuiTable({ defaultOrderBy: "name" });
    const handleChangeFilter = (key, value) => {
        setUserFilter((state) => ({ ...state, [key]: value }));
    };
    const handleChangeTab = (_, newValue) => {
        handleChangeFilter("role", newValue);
    };
    const filteredUsers = stableSort(users, getComparator(order, orderBy)).filter((item) => {
        if (userFilter.role)
            return item.role.toLowerCase() === userFilter.role;
        else if (userFilter.search)
            return item.name
                .toLowerCase()
                .includes(userFilter.search.toLowerCase());
        else
            return true;
    });
    const handleDeleteUser = (id) => {
        setUsers((state) => state.filter((item) => item.id !== id));
    };
    const handleAllUserDelete = () => {
        setUsers((state) => state.filter((item) => !selected.includes(item.id)));
        handleSelectAllRows([])();
    };
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsxs(Card, { children: [_jsxs(Box, { px: 2, pt: 2, children: [_jsx(HeadingArea, { value: userFilter.role, changeTab: handleChangeTab }), _jsx(SearchArea, { value: userFilter.search, gridRoute: "/dashboard/user-grid", listRoute: "/dashboard/user-list", onChange: (e) => handleChangeFilter("search", e.target.value) })] }), selected.length > 0 && (_jsx(TableToolbar, { selected: selected.length, handleDeleteRows: handleAllUserDelete })), _jsx(TableContainer, { children: _jsx(Scrollbar, { autoHide: false, children: _jsxs(Table, { children: [_jsx(UserTableHead, { order: order, orderBy: orderBy, numSelected: selected.length, rowCount: filteredUsers.length, onRequestSort: handleRequestSort, onSelectAllRows: handleSelectAllRows(filteredUsers.map((row) => row.id)) }), _jsxs(TableBody, { children: [filteredUsers
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((user) => (_jsx(UserTableRow, { user: user, isSelected: isSelected(user.id), handleSelectRow: handleSelectRow, handleDeleteUser: handleDeleteUser }, user.id))), filteredUsers.length === 0 && _jsx(TableDataNotFound, {})] })] }) }) }), _jsx(Box, { padding: 1, children: _jsx(TablePagination, { page: page, component: "div", rowsPerPage: rowsPerPage, count: filteredUsers.length, onPageChange: handleChangePage, rowsPerPageOptions: [5, 10, 25], onRowsPerPageChange: handleChangeRowsPerPage }) })] }) }));
};
export default UserList1PageView;

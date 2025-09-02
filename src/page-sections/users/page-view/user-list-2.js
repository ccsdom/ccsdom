import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Card, Grid, Stack, Table, styled, Avatar, TableRow, TableBody, TableCell, TableHead, TableContainer, TablePagination, TableSortLabel, } from "@mui/material";
// CUSTOM COMPONENTS
import { H6 } from "@/components/typography";
import { Scrollbar } from "@/components/scrollbar";
import { TableDataNotFound } from "@/components/table";
// CUSTOM PAGE SECTION COMPONENTS
import SearchArea from "../SearchArea";
import UserDetails from "../UserDetails";
// CUSTOM DEFINED HOOK
import useMuiTable, { getComparator, stableSort } from "@/hooks/useMuiTable";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
// CUSTOM DUMMY DATA
import { USER_LIST } from "@/__fakeData__/users";
// STYLED COMPONENTS
const HeadTableCell = styled(TableCell)(({ theme }) => ({
    fontSize: 14,
    fontWeight: 600,
    paddingBlock: 14,
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.grey[isDark(theme) ? 700 : 100],
    borderBottom: `1px solid ${theme.palette.grey[isDark(theme) ? 700 : 100]}`,
    "&:first-of-type": { paddingLeft: 24 },
    "&:last-of-type": { paddingRight: 24 },
}));
const BodyTableCell = styled(HeadTableCell)({
    fontSize: 12,
    fontWeight: 400,
    backgroundColor: "transparent",
});
const BodyTableRow = styled(TableRow, {
    shouldForwardProp: (prop) => prop != "active",
})(({ theme, active }) => ({
    cursor: "pointer",
    ...(active && {
        backgroundColor: theme.palette.grey[isDark(theme) ? 700 : 100],
    }),
}));
const headCells = [
    { id: "name", numeric: true, disablePadding: false, label: "Name" },
    { id: "position", numeric: true, disablePadding: false, label: "Position" },
    { id: "company", numeric: true, disablePadding: false, label: "Company" },
    { id: "email", numeric: true, disablePadding: false, label: "Email" },
    { id: "phone", numeric: true, disablePadding: false, label: "Phone" },
];
const UserList2PageView = () => {
    const [users] = useState([...USER_LIST]);
    const [searchFilter, setSearchFilter] = useState("");
    const [selectedUser, setSelectedUser] = useState();
    const { page, order, orderBy, rowsPerPage, handleChangePage, handleRequestSort, handleChangeRowsPerPage, } = useMuiTable({ defaultOrderBy: "name", defaultRowsPerPage: 10 });
    const filteredUsers = stableSort(users, getComparator(order, orderBy)).filter((item) => {
        if (searchFilter)
            return item.name.toLowerCase().includes(searchFilter.toLowerCase());
        else
            return true;
    });
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsxs(Grid, { container: true, children: [_jsx(Grid, { item: true, lg: 9, md: 8, xs: 12, children: _jsxs(Card, { sx: {
                            height: "100%",
                            borderTopRightRadius: 0,
                            borderBottomRightRadius: 0,
                            boxShadow: "2px 4px 20px rgba(0, 0, 0, 0.05)",
                        }, children: [_jsx(Box, { px: 3, children: _jsx(SearchArea, { value: searchFilter, onChange: (e) => setSearchFilter(e.target.value), gridRoute: "/dashboard/user-grid-2", listRoute: "/dashboard/user-list-2" }) }), _jsx(TableContainer, { children: _jsx(Scrollbar, { autoHide: false, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsx(TableRow, { children: headCells.map((headCell) => (_jsx(HeadTableCell, { padding: headCell.disablePadding ? "none" : "normal", sortDirection: orderBy === headCell.id ? order : false, children: _jsx(TableSortLabel, { active: orderBy === headCell.id, onClick: (e) => handleRequestSort(e, headCell.id), direction: orderBy === headCell.id ? order : "asc", children: headCell.label }) }, headCell.id))) }) }), _jsxs(TableBody, { children: [filteredUsers
                                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                        .map((user) => (_jsxs(BodyTableRow, { active: selectedUser?.id === user.id ? 1 : 0, onClick: () => setSelectedUser(user), children: [_jsx(BodyTableCell, { children: _jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(Avatar, { src: user.avatar, sx: {
                                                                                borderRadius: "20%",
                                                                                backgroundColor: "grey.100",
                                                                            } }), _jsx(H6, { fontSize: 12, color: "text.primary", children: user.name })] }) }), _jsx(BodyTableCell, { children: user.position }), _jsx(BodyTableCell, { children: user.company }), _jsx(BodyTableCell, { children: user.email }), _jsx(BodyTableCell, { children: user.phone })] }, user.id))), filteredUsers.length === 0 && _jsx(TableDataNotFound, {})] })] }) }) }), _jsx(TablePagination, { page: page, component: "div", rowsPerPage: rowsPerPage, count: filteredUsers.length, onPageChange: handleChangePage, rowsPerPageOptions: [5, 10, 25], onRowsPerPageChange: handleChangeRowsPerPage })] }) }), _jsx(Grid, { item: true, lg: 3, md: 4, xs: 12, children: _jsx(UserDetails, { data: selectedUser }) })] }) }));
};
export default UserList2PageView;

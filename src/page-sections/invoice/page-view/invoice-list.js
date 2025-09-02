import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button, Card, Stack } from "@mui/material";
import { Table, TableBody, TableContainer, TablePagination, } from "@mui/material";
// CUSTOM COMPONENTS
import { H5 } from "@/components/typography";
import { Scrollbar } from "@/components/scrollbar";
import { FlexBetween } from "@/components/flexbox";
import { TableDataNotFound, TableToolbar } from "@/components/table";
import { IconWrapper } from "@/components/icon-wrapper";
// CUSTOM DEFINED HOOK
import useMuiTable, { getComparator, stableSort } from "@/hooks/useMuiTable";
import useNavigate from "@/hooks/useNavigate";
// CUSTOM ICON COMPONENTS
import Add from "@/icons/Add";
import Invoice from "@/icons/sidebar/Invoice";
// CUSTOM PAGE SECTION COMPONENTS
import InvoiceTableRow from "../InvoiceTableRow";
import InvoiceTableHead from "../InvoiceTableHead";
import InvoiceTableActions from "../InvoiceTableActions";
// CUSTOM DUMMY DATA
import { INVOICE_LIST } from "@/__fakeData__/invoices";
const InvoiceListPageView = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([...INVOICE_LIST]);
    const [invoiceFilter, setInvoiceFilter] = useState({
        search: "",
        status: "",
    });
    const handleChangeFilter = (key, value) => {
        setInvoiceFilter((state) => ({ ...state, [key]: value }));
    };
    const { page, order, orderBy, selected, rowsPerPage, isSelected, handleSelectRow, handleChangePage, handleRequestSort, handleSelectAllRows, handleChangeRowsPerPage, } = useMuiTable({ defaultOrderBy: "name" });
    const filteredInvoices = stableSort(invoices, getComparator(order, orderBy)).filter((item) => {
        if (invoiceFilter.status === "pending")
            return item.status === "Pending";
        else if (invoiceFilter.status === "complete")
            return item.status === "Complete";
        return (item.name.toLowerCase().includes(invoiceFilter.search.toLowerCase()) ||
            item.email.toLowerCase().includes(invoiceFilter.search.toLowerCase()));
    });
    const handleDeleteInvoice = (id) => {
        setInvoices((state) => state.filter((item) => item.id !== id));
    };
    const handleAllDeleteInvoice = () => {
        setInvoices((state) => state.filter((item) => !selected.includes(item.id)));
        handleSelectAllRows([])();
    };
    return (_jsxs(Card, { children: [_jsxs(FlexBetween, { flexWrap: "wrap", gap: 2, p: 2, pt: 2.5, children: [_jsxs(Stack, { direction: "row", alignItems: "center", children: [_jsx(IconWrapper, { children: _jsx(Invoice, { color: "primary" }) }), _jsx(H5, { fontSize: 16, children: "Invoice List" })] }), _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: () => navigate("/dashboard/create-invoice"), children: "Add New Invoice" })] }), _jsx(InvoiceTableActions, { filter: invoiceFilter, handleChangeFilter: handleChangeFilter }), selected.length > 0 && (_jsx(TableToolbar, { selected: selected.length, handleDeleteRows: handleAllDeleteInvoice })), _jsx(TableContainer, { children: _jsx(Scrollbar, { autoHide: false, children: _jsxs(Table, { sx: { minWidth: 900 }, children: [_jsx(InvoiceTableHead, { order: order, orderBy: orderBy, numSelected: selected.length, rowCount: filteredInvoices.length, onRequestSort: handleRequestSort, onSelectAllRows: handleSelectAllRows(filteredInvoices.map((row) => row.id)) }), _jsxs(TableBody, { children: [filteredInvoices
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((invoice) => (_jsx(InvoiceTableRow, { invoice: invoice, handleSelectRow: handleSelectRow, isSelected: isSelected(invoice.id), handleDeleteInvoice: handleDeleteInvoice }, invoice.id))), filteredInvoices.length === 0 && _jsx(TableDataNotFound, {})] })] }) }) }), _jsx(TablePagination, { page: page, component: "div", rowsPerPage: rowsPerPage, count: filteredInvoices.length, onPageChange: handleChangePage, rowsPerPageOptions: [5, 10, 25], onRowsPerPageChange: handleChangeRowsPerPage })] }));
};
export default InvoiceListPageView;

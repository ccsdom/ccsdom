import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Tab, Box, Tabs, Card, Table, styled, Button, TableBody, TableContainer, TablePagination, } from "@mui/material";
import Add from "@/icons/Add";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
// CUSTOM COMPONENTS
import { Scrollbar } from "@/components/scrollbar";
import { FlexBetween } from "@/components/flexbox";
import { TableDataNotFound, TableToolbar } from "@/components/table";
// CUSTOM DEFINED HOOK
import useMuiTable, { getComparator, stableSort } from "@/hooks/useMuiTable";
// CUSTOM PAGE SECTION COMPONENTS
import ProductTableRow from "../ProductTableRow";
import ProductTableHead from "../ProductTableHead";
import ProductTableActions from "../ProductTableActions";
// CUSTOM DUMMY DATA
import { PRODUCTS } from "@/__fakeData__/products";
//  STYLED COMPONENTS
const ListWrapper = styled(FlexBetween)(({ theme }) => ({
    gap: 16,
    [theme.breakpoints.down(440)]: {
        flexDirection: "column",
        ".MuiButton-root": { width: "100%" },
    },
}));
const ProductListPageView = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([...PRODUCTS]);
    const [productFilter, setProductFilter] = useState({
        stock: "",
        search: "",
        publish: "",
    });
    const handleChangeFilter = (key, value) => {
        setProductFilter((state) => ({ ...state, [key]: value }));
    };
    const { page, order, orderBy, selected, isSelected, rowsPerPage, handleSelectRow, handleChangePage, handleRequestSort, handleSelectAllRows, handleChangeRowsPerPage, } = useMuiTable({ defaultOrderBy: "name" });
    const filteredProducts = stableSort(products, getComparator(order, orderBy)).filter((item) => {
        if (productFilter.stock === "stock")
            return item.stock > 0;
        else if (productFilter.stock === "out-of-stock")
            return item.stock === 0;
        else if (productFilter.publish === "published")
            return item.published === true;
        else if (productFilter.publish === "draft")
            return item.published === false;
        else if (productFilter.search)
            return item.name
                .toLowerCase()
                .includes(productFilter.search.toLowerCase());
        else
            return true;
    });
    const handleDeleteProduct = (id) => {
        setProducts((state) => state.filter((item) => item.id !== id));
    };
    const handleAllProductDelete = () => {
        setProducts((state) => state.filter((item) => !selected.includes(item.id)));
        handleSelectAllRows([])();
    };
    return (_jsxs(Box, { pt: 2, pb: 4, children: [_jsxs(ListWrapper, { children: [_jsxs(Tabs, { value: productFilter.stock, onChange: (_, value) => handleChangeFilter("stock", value), children: [_jsx(Tab, { disableRipple: true, label: "All", value: "" }), _jsx(Tab, { disableRipple: true, label: "In Stock", value: "stock" }), _jsx(Tab, { disableRipple: true, label: "Out of Stock", value: "out-of-stock" })] }), _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: () => navigate("/dashboard/create-product"), children: "Add Product" })] }), _jsxs(Card, { sx: { mt: 4 }, children: [_jsx(ProductTableActions, { filter: productFilter, handleChangeFilter: handleChangeFilter }), selected.length > 0 && (_jsx(TableToolbar, { selected: selected.length, handleDeleteRows: handleAllProductDelete })), _jsx(TableContainer, { children: _jsx(Scrollbar, { children: _jsxs(Table, { sx: { minWidth: 820 }, children: [_jsx(ProductTableHead, { order: order, orderBy: orderBy, numSelected: selected.length, rowCount: filteredProducts.length, onRequestSort: handleRequestSort, onSelectAllRows: handleSelectAllRows(filteredProducts.map((row) => row.id)) }), _jsxs(TableBody, { children: [filteredProducts
                                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                .map((product) => (_jsx(ProductTableRow, { product: product, handleSelectRow: handleSelectRow, isSelected: isSelected(product.id), handleDeleteProduct: handleDeleteProduct }, product.id))), filteredProducts.length === 0 && _jsx(TableDataNotFound, {})] })] }) }) }), _jsx(TablePagination, { page: page, component: "div", rowsPerPage: rowsPerPage, count: filteredProducts.length, onPageChange: handleChangePage, rowsPerPageOptions: [5, 10, 25], onRowsPerPageChange: handleChangeRowsPerPage })] })] }));
};
export default ProductListPageView;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Button from "@mui/material/Button";
import Add from "@mui/icons-material/Add";
// CUSTOM COMPONENTS
import { H6 } from "@/components/typography";
import { SearchInput } from "@/components/search-input";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// CUSTOM STYLED COMPONENTS
import { ButtonWrapper } from "./styles";
import CreateForm from "./CreateForm";
// ==============================================================
const TableActions = ({ rowSelected, hasColumnFilter, handleSearch, handleDeleteRow, handleResetColumnFilter, }) => {
    const [openForm, setOpenForm] = useState(false);
    return (_jsxs(FlexBetween, { flexWrap: "wrap", children: [_jsx(SearchInput, { placeholder: "Find Friends", onChange: (e) => handleSearch(e.target.value.trim()) }), _jsxs(ButtonWrapper, { alignItems: "center", gap: 2, children: [rowSelected ? (_jsxs(FlexBox, { alignItems: "center", gap: 1, children: [_jsxs(H6, { fontSize: 14, children: [rowSelected, " Selected"] }), _jsx(Button, { size: "small", color: "error", variant: "contained", onClick: handleDeleteRow, children: "Delete" })] })) : null, hasColumnFilter ? (_jsx(Button, { size: "small", color: "error", variant: "contained", onClick: handleResetColumnFilter, children: "Clear filter" })) : null, _jsx(Button, { endIcon: _jsx(Add, {}), variant: "contained", onClick: () => setOpenForm(true), children: "Add Employee" }), _jsx(CreateForm, { open: openForm, onClose: () => setOpenForm(false) })] })] }));
};
export default TableActions;

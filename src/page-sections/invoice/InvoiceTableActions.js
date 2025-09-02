import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { styled, TextField, MenuItem } from "@mui/material";
// CUSTOM COMPONENTS
import { FlexBox } from "@/components/flexbox";
//  STYLED COMPONENTS
const Wrapper = styled(FlexBox)(({ theme }) => ({
    alignItems: "center",
    ".select": { flex: "1 1 200px" },
    [theme.breakpoints.down(426)]: { flexWrap: "wrap" },
}));
// ==============================================================
const InvoiceTableActions = ({ handleChangeFilter, filter, }) => {
    const INVOICE_STATUS = [
        { id: 1, name: "All", value: "" },
        { id: 2, name: "Pending", value: "pending" },
        { id: 3, name: "Complete", value: "complete" },
    ];
    return (_jsxs(Wrapper, { gap: 2, px: 2, pb: 3, children: [_jsx(TextField, { select: true, fullWidth: true, label: "Status", className: "select", value: filter.status, onChange: (e) => handleChangeFilter("status", e.target.value), children: INVOICE_STATUS.map(({ id, name, value }) => (_jsx(MenuItem, { value: value, children: name }, id))) }), _jsx(TextField, { fullWidth: true, value: filter.search, label: "Search invoice by name...", onChange: (e) => handleChangeFilter("search", e.target.value) })] }));
};
export default InvoiceTableActions;

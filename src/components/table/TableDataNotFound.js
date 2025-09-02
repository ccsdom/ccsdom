import { jsx as _jsx } from "react/jsx-runtime";
import { TableCell, TableRow } from "@mui/material";
// CUSTOM COMPONENT
import { FlexRowAlign } from "@/components/flexbox";
const TableDataNotFound = () => {
    return (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, children: _jsx(FlexRowAlign, { m: 2, fontSize: 18, minHeight: 300, fontWeight: 700, borderRadius: 2, bgcolor: "action.selected", children: "Data Not Found!" }) }) }));
};
export default TableDataNotFound;

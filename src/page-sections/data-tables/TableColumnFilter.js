import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { Select, InputBase, MenuItem, TextField } from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { format } from "date-fns";
// CUSTOM STYLED COMPONENTS
import { StyledSearchInput, StyledSearchIcon } from "./styles";
// ==============================================================
const SELECT_INPUT_STYLE = {
    height: 40,
    width: 110,
    fontSize: 12,
    fontWeight: 600,
    paddingLeft: "10px",
    paddingRight: "2px",
    borderRadius: "8px",
    color: "text.primary",
    backgroundColor: "divider",
    "& .MuiPopover-paper": { boxShadow: "none" },
    "& > .MuiSelect-select": { paddingRight: "0 !important" },
};
const DATE_PICKER_TEXT_FIELD_STYLE = {
    "& .MuiOutlinedInput-root": {
        height: 40,
        borderRadius: "8px",
        backgroundColor: "divider",
    },
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    "& .MuiOutlinedInput-input": { padding: 0, paddingLeft: "10px" },
    "& .MuiSvgIcon-root": { fontSize: 22, color: "text.secondary" },
};
const TableColumnFilter = ({ column, table }) => {
    const columnFilterValue = column.getFilterValue();
    // (POSITION, ADDRESS, STATUS) COLUMN FILTER OPTION
    if (["position", "address", "status"].includes(column.id)) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const options = useMemo(() => {
            const set = new Set();
            table.getPreFilteredRowModel().flatRows.forEach((row) => {
                set.add(row.getValue(column.id));
            });
            return Array.from(set.values());
        }, [column.id, table]);
        return (_jsxs(Select, { value: columnFilterValue ?? "", onChange: (e) => column.setFilterValue(e.target.value), IconComponent: () => (_jsx(KeyboardArrowDown, { sx: { color: "text.secondary" } })), input: _jsx(InputBase, { sx: SELECT_INPUT_STYLE }), children: [_jsx(MenuItem, { value: "", sx: { fontSize: 12, fontWeight: 500 }, children: "All" }), options.map((option, i) => (_jsx(MenuItem, { value: option, sx: { fontSize: 12, fontWeight: 500 }, children: option }, i)))] }));
    }
    // DATE OF BIRTH COLUMN FILTER OPTION
    if (column.id === "dateOfBirth") {
        const handleChange = (date) => {
            if (date)
                column.setFilterValue(format(new Date(date), "MMM dd, yyyy"));
        };
        return (_jsx(DesktopDatePicker, { inputFormat: "dd/MM/yy", onChange: handleChange, value: columnFilterValue ?? "", renderInput: (params) => (_jsx(TextField, { ...params, sx: DATE_PICKER_TEXT_FIELD_STYLE })) }));
    }
    // REMAINING COLUMN FILTER OPTION
    return (_jsx(StyledSearchInput, { value: columnFilterValue ?? "", onChange: (e) => column.setFilterValue(e.target.value), endAdornment: _jsx(StyledSearchIcon, { sx: { color: "text.secondary" } }), sx: { backgroundColor: "divider", borderRadius: "8px" } }));
};
export default TableColumnFilter;

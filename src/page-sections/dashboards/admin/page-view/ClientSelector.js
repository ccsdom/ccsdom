import { jsx as _jsx } from "react/jsx-runtime";
import { Autocomplete, TextField } from "@mui/material";
const ClientSelector = ({ clients, value, onChange, sx }) => {
    return (_jsx(Autocomplete, { options: clients, getOptionLabel: (option) => option.name, value: value, onChange: (event, newValue) => {
            onChange(newValue);
        }, isOptionEqualToValue: (option, val) => option.id === val.id, sx: sx, renderInput: (params) => (_jsx(TextField, { ...params, label: "S\u00E9lectionnez un client", variant: "outlined", fullWidth: true, size: "small" })) }));
};
export default ClientSelector;

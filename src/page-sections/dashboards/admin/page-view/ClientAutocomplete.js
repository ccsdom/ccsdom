import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
const ClientAutocomplete = ({ clients, value, onChange, sx }) => {
    const [inputValue, setInputValue] = useState("");
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        setLoading(true);
        // Filtrage simple local (remplace par appel API si besoin)
        const filtered = clients.filter((client) => client.name.toLowerCase().includes(inputValue.toLowerCase()) ||
            client.siren.includes(inputValue));
        setOptions(filtered);
        setLoading(false);
    }, [inputValue, clients]);
    return (_jsx(Autocomplete, { sx: sx, options: options, getOptionLabel: (option) => `${option.name} (${option.siren})`, value: value, onChange: (_, newValue) => onChange(newValue), inputValue: inputValue, onInputChange: (_, newInputValue) => setInputValue(newInputValue), loading: loading, noOptionsText: "Aucun client trouv\u00E9", renderInput: (params) => (_jsx(TextField, { ...params, label: "S\u00E9lectionner un client (nom ou SIREN)", size: "small", InputProps: {
                ...params.InputProps,
                endAdornment: (_jsxs(_Fragment, { children: [loading ? _jsx(CircularProgress, { color: "inherit", size: 20 }) : null, params.InputProps.endAdornment] })),
            }, fullWidth: true })) }));
};
export default ClientAutocomplete;

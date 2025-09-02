import React, { useState, useEffect } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";

interface Client {
  id: string;
  name: string;
  siren: string;
}

interface ClientAutocompleteProps {
  clients: Client[];
  value: Client | null;
  onChange: (client: Client | null) => void;
  sx?: any;
}

const ClientAutocomplete = ({ clients, value, onChange, sx }: ClientAutocompleteProps) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Filtrage simple local (remplace par appel API si besoin)
    const filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        client.siren.includes(inputValue)
    );
    setOptions(filtered);
    setLoading(false);
  }, [inputValue, clients]);

  return (
    <Autocomplete
      sx={sx}
      options={options}
      getOptionLabel={(option) => `${option.name} (${option.siren})`}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      loading={loading}
      noOptionsText="Aucun client trouvé"
      renderInput={(params) => (
        <TextField
          {...params}
          label="Sélectionner un client (nom ou SIREN)"
          size="small"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          fullWidth
        />
      )}
    />
  );
};

export default ClientAutocomplete;

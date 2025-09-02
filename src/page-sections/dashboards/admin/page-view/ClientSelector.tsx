import React from "react";
import { Autocomplete, TextField } from "@mui/material";

type Client = {
  id: string;
  name: string;
};

type ClientSelectorProps = {
  clients: Client[];
  value: Client | null;
  onChange: (client: Client | null) => void;
  sx?: object;
};

const ClientSelector: React.FC<ClientSelectorProps> = ({ clients, value, onChange, sx }) => {
  return (
    <Autocomplete
      options={clients}
      getOptionLabel={(option) => option.name}
      value={value}
      onChange={(event, newValue) => {
        onChange(newValue);
      }}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      sx={sx}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Sélectionnez un client"
          variant="outlined"
          fullWidth
          size="small"
        />
      )}
    />
  );
};

export default ClientSelector;

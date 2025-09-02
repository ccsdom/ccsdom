import React, { useState, useEffect, useMemo } from "react";
import { TextField, Autocomplete, CircularProgress } from "@mui/material";

interface Client {
  id: string;
  name: string;
  siren: string;
}

const MOCK_CLIENTS: Client[] = [
  { id: "1", name: "Entreprise Alpha", siren: "123456789" },
  { id: "2", name: "Société Beta", siren: "987654321" },
  { id: "3", name: "Compagnie Gamma", siren: "456789123" },
];

// Remplacer par l’URL de ta fonction Cloud Firebase quand elle sera prête
const API_URL = "https://example.com/api/searchClients?search=";

const ClientAutocomplete = ({
  onClientSelected,
}: {
  onClientSelected: (client: Client | null) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Client[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  // Debounce simple pour limiter appels lors de la saisie
  const debouncedInput = useDebounce(inputValue, 300);

  useEffect(() => {
    if (debouncedInput === "") {
      setOptions([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    const fetchClients = async () => {
      try {
        // Remplacer le mock par un fetch réel si API disponible
        // const response = await fetch(`${API_URL}${encodeURIComponent(debouncedInput)}`);
        // const clients: Client[] = await response.json();

        const clients = MOCK_CLIENTS.filter(
          (c) =>
            c.name.toLowerCase().includes(debouncedInput.toLowerCase()) ||
            c.siren.includes(debouncedInput)
        );

        if (active) {
          setOptions(clients);
          setLoading(false);
        }
      } catch (error) {
        if (active) {
          setOptions([]);
          setLoading(false);
        }
      }
    };

    fetchClients();

    return () => {
      active = false;
    };
  }, [debouncedInput]);

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      getOptionLabel={(option) => `${option.name} (${option.siren})`}
      loading={loading}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      onChange={(_, newValue) => onClientSelected(newValue)}
      noOptionsText="Aucun client trouvé"
      renderInput={(params) => (
        <TextField
          {...params}
          label="Sélectionner un client (nom ou SIREN)"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          size="small"
          fullWidth
        />
      )}
      sx={{ minWidth: 300 }}
    />
  );
};

// Hook debounce simple
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default ClientAutocomplete;

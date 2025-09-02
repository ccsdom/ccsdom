// src/pages/client/profil/Informations.tsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Grid,
  TextField,
  Button,
  Stack,
} from "@mui/material";

const Informations = () => {
  // Données initiales (à remplacer par données dynamiques réelles)
  const initialSociete = {
    raisonSociale: "SARL Exemple",
    adresse: "123 Rue de Paris, 75000 Paris",
    siret: "123 456 789 00012",
    codeApe: "6201Z",
    capitalSocial: "10 000 €",
    telephone: "01 23 45 67 89",
    email: "contact@societe-exemple.com",
    siteWeb: "https://www.societe-exemple.com",
    representantLegal: "Jean Dupont",
  };

  const [societe, setSociete] = useState(initialSociete);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Gestion des changements dans les inputs
  const handleChange = (field: keyof typeof societe, value: string) => {
    setSociete(prev => ({ ...prev, [field]: value }));
  };

  // Validation simple (exemple email uniquement)
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!societe.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Adresse email invalide";
    }
    // Ajouter autres validations si besoin
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Sauvegarder modifications
  const handleSave = () => {
    if (!validate()) return;
    // Ici, tu peux appeler une API pour sauvegarder les données mises à jour
    setEditing(false);
    alert("Informations sauvegardées (mock)");
  };

  // Annuler modifications (retour aux valeurs initiales ou sauvegardées)
  const handleCancel = () => {
    setSociete(initialSociete);
    setErrors({});
    setEditing(false);
  };

  return (
    <Box p={3} bgcolor="background.paper" borderRadius={2} boxShadow={1}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Informations sur la société domiciliée</Typography>
        {!editing ? (
          <Button variant="outlined" size="small" onClick={() => setEditing(true)}>
            Modifier
          </Button>
        ) : (
          <Stack direction="row" spacing={1}>
            <Button variant="contained" size="small" onClick={handleSave}>
              Enregistrer
            </Button>
            <Button variant="outlined" size="small" color="inherit" onClick={handleCancel}>
              Annuler
            </Button>
          </Stack>
        )}
      </Stack>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={2}>
        {Object.entries(societe).map(([field, value]) => {
          // Champ non éditable
          const isReadOnlyField = field === "siret" || field === "codeApe";

          return (
            <Grid item xs={12} sm={6} key={field}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {field === "raisonSociale"
                  ? "Raison sociale"
                  : field === "adresse"
                  ? "Adresse"
                  : field === "siret"
                  ? "SIRET"
                  : field === "codeApe"
                  ? "Code APE"
                  : field === "capitalSocial"
                  ? "Capital social"
                  : field === "telephone"
                  ? "Téléphone"
                  : field === "email"
                  ? "Email"
                  : field === "siteWeb"
                  ? "Site web"
                  : field === "representantLegal"
                  ? "Représentant légal"
                  : field
                }
              </Typography>
              {editing && !isReadOnlyField ? (
                <TextField
                  fullWidth
                  size="small"
                  value={value}
                  error={Boolean(errors[field])}
                  helperText={errors[field]}
                  onChange={(e) => handleChange(field as keyof typeof societe, e.target.value)}
                  type={field === "email" ? "email" : "text"}
                />
              ) : field === "siteWeb" && !editing ? (
                <Typography>
                  <a href={value} target="_blank" rel="noopener noreferrer">
                    {value}
                  </a>
                </Typography>
              ) : (
                <Typography>{value}</Typography>
              )}
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Informations;

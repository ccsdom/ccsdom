import React, { useState, ChangeEvent } from "react";
import { Box, Typography, Stack, Avatar, Button, Paper } from "@mui/material";

const Overview = () => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Gestion de la sélection de fichier
  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPhotoUrl(URL.createObjectURL(file)); // Aperçu immédiat
    }
  };

  // Validation (mock)
  const handleValidate = () => {
    if (selectedFile) {
      alert(`Photo "${selectedFile.name}" sauvegardée (mock)`);
      // Ici, appeler une API pour upload réel
      setSelectedFile(null);
      // éventuellement garder l'url ou la réinitialiser
    }
  };

  // Annuler le changement
  const handleCancel = () => {
    setSelectedFile(null);
    setPhotoUrl(null);
  };

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Typography variant="h5" mb={3} fontWeight="bold">
        Mon profil
      </Typography>

      <Stack direction="row" spacing={3} alignItems="center" mb={4}>
        <Avatar
          src={photoUrl ?? undefined}
          sx={{ width: 64, height: 64 }}
          alt="Photo de profil"
        />
        <Box>
          <Button variant="outlined" component="label">
            Changer la photo
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </Button>
          {selectedFile && (
            <Stack direction="row" spacing={1} mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleValidate}
              >
                Valider
              </Button>
              <Button variant="text" color="error" onClick={handleCancel}>
                Annuler
              </Button>
            </Stack>
          )}
        </Box>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="h6" fontWeight="medium">
          Jean Dupont
        </Typography>
        <Typography color="text.secondary">jean.dupont@email.com</Typography>
        <Typography color="text.secondary">06 12 34 56 78</Typography>
      </Stack>
    </Paper>
  );
};

export default Overview;

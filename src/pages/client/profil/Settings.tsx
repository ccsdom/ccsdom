// src/pages/client/profil/Settings.tsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";

const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const handleNotificationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications({
      ...notifications,
      [event.target.name]: event.target.checked,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation simple du mot de passe
    if (newPassword !== confirmPassword) {
      setSnackbarMessage("Le nouveau mot de passe et la confirmation ne correspondent pas.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setSnackbarMessage("Le mot de passe doit contenir au moins 6 caractères.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    // Ici tu appelleras l'API pour changer le mot de passe et sauvegarder les préférences
    setSnackbarMessage("Paramètres enregistrés avec succès.");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    // Reset mot de passe
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleLogout = () => {
    // Ici tu peux appeler ta fonction de déconnexion
    alert("Déconnexion effectuée (mock)");
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 480 }}>
      <Typography variant="h6" gutterBottom>
        Paramètres du compte
      </Typography>

      <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
        Modifier le mot de passe
      </Typography>
      <TextField
        label="Mot de passe actuel"
        type="password"
        fullWidth
        margin="normal"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <TextField
        label="Nouveau mot de passe"
        type="password"
        fullWidth
        margin="normal"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <TextField
        label="Confirmer le nouveau mot de passe"
        type="password"
        fullWidth
        margin="normal"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <Divider sx={{ my: 4 }} />

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Préférences de notifications
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={notifications.email}
              onChange={handleNotificationChange}
              name="email"
            />
          }
          label="Notifications par email"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={notifications.sms}
              onChange={handleNotificationChange}
              name="sms"
            />
          }
          label="Notifications par SMS"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={notifications.push}
              onChange={handleNotificationChange}
              name="push"
            />
          }
          label="Notifications push"
        />
      </FormGroup>

      <Button variant="contained" type="submit" sx={{ mt: 3 }}>
        Enregistrer les modifications
      </Button>

      <Divider sx={{ my: 4 }} />

      <Button variant="outlined" color="error" onClick={handleLogout}>
        Déconnexion
      </Button>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;

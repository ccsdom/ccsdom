import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Stack,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Grid,
  Snackbar,
  IconButton,
  Badge,
  InputAdornment,
  Chip,
  Divider,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// ---------- Styled ----------
const Shell = styled(Box)(({ theme }) => ({
  maxWidth: 960,
  marginInline: "auto",
  padding: theme.spacing(3),
  [theme.breakpoints.up("md")]: { padding: theme.spacing(4) },
}));

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.12)}`,
  overflow: "hidden",
}));

const Header = styled(Box)(({ theme }) => ({
  position: "relative",
  padding: theme.spacing(4, 3, 8),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(
    theme.palette.secondary.main || theme.palette.primary.light,
    0.2
  )} 100%)`,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
}));

const AvatarWrap = styled(Box)(({ theme }) => ({
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  bottom: -48,
}));

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`profile-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

// ---------- Helpers ----------
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone = (v: string) =>
  !v || /^(\+\d{1,3})?[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}$/.test(v);

const passwordStrength = (pwd: string) => {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[a-z]/.test(pwd)) s++;
  if (/\d/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return Math.min(s, 4); // 0..4
};

const ProfilPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Données utilisateur simulées
  const userData = {
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    prenom: "Jean",
    nom: "Dupont",
    email: "jean.dupont@example.com",
    telephone: "06 12 34 56 78",
    role: "Administrateur",
    domiciliation: {
      rue: "12 rue de Paris",
      cp: "75010",
      ville: "Paris",
      pays: "France",
    },
  };

  // Etats onglets
  const [tabValue, setTabValue] = useState(0);

  // Etats profil
  const [avatar, setAvatar] = useState(userData.avatarUrl);
  const [prenom, setPrenom] = useState(userData.prenom);
  const [nom, setNom] = useState(userData.nom);
  const [email, setEmail] = useState(userData.email);
  const [telephone, setTelephone] = useState(userData.telephone);

  // Etats adresse
  const [rue, setRue] = useState(userData.domiciliation.rue);
  const [cp, setCp] = useState(userData.domiciliation.cp);
  const [ville, setVille] = useState(userData.domiciliation.ville);
  const [pays, setPays] = useState(userData.domiciliation.pays);

  // Etats compte
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI / feedback
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [snackOpen, setSnackOpen] = useState(false);

  // Validation dynamique
  // ✅ forcé en booléen
const emailError = !!email && !isValidEmail(email);
  const phoneError = !isValidPhone(telephone);
  const pwdStrength = useMemo(() => passwordStrength(password), [password]);
  const pwdMismatch = !!password && password !== confirmPassword;

  // Détection de modifications (pour désactiver le bouton si rien n’a changé)
  const hasChanges = useMemo(() => {
    const base =
      prenom !== userData.prenom ||
      nom !== userData.nom ||
      email !== userData.email ||
      telephone !== userData.telephone ||
      rue !== userData.domiciliation.rue ||
      cp !== userData.domiciliation.cp ||
      ville !== userData.domiciliation.ville ||
      pays !== userData.domiciliation.pays ||
      avatar !== userData.avatarUrl;
    const pwdChanged = !!password || !!confirmPassword;
    return base || pwdChanged;
  }, [prenom, nom, email, telephone, rue, cp, ville, pays, avatar, password, confirmPassword]);

  // Avatar
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) setAvatar(e.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!prenom || !nom || !email) {
      setErrorMsg("Les champs prénom, nom et email sont obligatoires.");
      setSnackOpen(true);
      return;
    }
    if (emailError) {
      setErrorMsg("Adresse email invalide.");
      setSnackOpen(true);
      return;
    }
    if (phoneError) {
      setErrorMsg("Numéro de téléphone invalide.");
      setSnackOpen(true);
      return;
    }
    if (pwdMismatch) {
      setErrorMsg("Les mots de passe ne correspondent pas.");
      setSnackOpen(true);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg("Profil mis à jour avec succès !");
      setSnackOpen(true);
      setPassword("");
      setConfirmPassword("");
    }, 1200);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setErrorMsg("");
    setSuccessMsg("");
  };

  // Couleur indicateur force de mot de passe
  const pwdColor = ["error.main", "warning.main", "info.main", "success.main"][Math.max(0, pwdStrength - 1)] || "divider";
  const pwdLabel = ["Très faible", "Faible", "Correct", "Fort"][Math.max(0, pwdStrength - 1)] || "—";

  return (
    <Shell>
      <ModernCard>
        {/* Header */}
        <Header>
          <Typography variant="h4" fontWeight={800}>
            Mon profil
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Gérez vos informations personnelles, votre adresse et la sécurité de votre compte.
          </Typography>

          <AvatarWrap>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                <IconButton component="label" size="small" sx={{ bgcolor: "background.paper", boxShadow: 1 }}>
                  <CameraAltIcon fontSize="small" />
                  <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                </IconButton>
              }
            >
              <Avatar
                src={avatar}
                sx={{
                  width: 96,
                  height: 96,
                  border: `3px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.25)}`,
                }}
              />
            </Badge>
          </AvatarWrap>
        </Header>

        <CardContent sx={{ pt: 8 }}>
          {/* Info utilisateur rapide */}
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2, flexWrap: "wrap" }}>
            <Chip icon={<CheckCircleIcon />} color="success" variant="outlined" label={userData.role} />
            <Chip icon={<EmailIcon />} variant="outlined" label={email} />
            <Chip icon={<PhoneIcon />} variant="outlined" label={telephone} />
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": { textTransform: "none", fontWeight: 600, minHeight: 56 },
              "& .Mui-selected": { color: "primary.main" },
              "& .MuiTabs-indicator": { height: 3, borderRadius: 2 },
              mb: 1,
            }}
          >
            <Tab icon={<PersonIcon fontSize="small" />} iconPosition="start" label="Aperçu" />
            <Tab icon={<HomeIcon fontSize="small" />} iconPosition="start" label="Adresse gérée" />
            <Tab icon={<LockIcon fontSize="small" />} iconPosition="start" label="Compte" />
          </Tabs>

          {/* Messages inline */}
          {!!errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}
          {!!successMsg && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMsg}
            </Alert>
          )}

          {/* Tab 1 : Aperçu */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Prénom"
                  fullWidth
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Nom" fullWidth value={nom} onChange={(e) => setNom(e.target.value)} disabled={loading} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  error={emailError}
                  helperText={emailError ? "Format d'email invalide" : " "}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Téléphone"
                  fullWidth
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  disabled={loading}
                  error={phoneError}
                  helperText={phoneError ? "Numéro invalide" : " "}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1.5 }}>
              Rôle : <strong>{userData.role}</strong>
            </Typography>
          </TabPanel>

          {/* Tab 2 : Adresse */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label="Rue" fullWidth value={rue} onChange={(e) => setRue(e.target.value)} disabled={loading} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Code postal" fullWidth value={cp} onChange={(e) => setCp(e.target.value)} disabled={loading} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Ville" fullWidth value={ville} onChange={(e) => setVille(e.target.value)} disabled={loading} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Pays" fullWidth value={pays} onChange={(e) => setPays(e.target.value)} disabled={loading} />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 3 : Compte */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Nouveau mot de passe"
                  type="password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  helperText="Laisser vide pour conserver le mot de passe actuel"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Confirmer le mot de passe"
                  type="password"
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  error={pwdMismatch}
                  helperText={pwdMismatch ? "Les mots de passe ne correspondent pas" : " "}
                />
              </Grid>

              {/* Indicateur de force */}
              {password && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      height: 8,
                      borderRadius: 999,
                      backgroundColor: alpha(theme.palette.text.primary, 0.08),
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: `${(pwdStrength / 4) * 100}%`,
                        backgroundColor: theme.palette[pwdColor.split(".")[0] as "error" | "warning" | "info" | "success"].main,
                        transition: "width .25s ease",
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ mt: 0.5, display: "block" }}>
                    Force du mot de passe : <strong>{pwdLabel}</strong>
                  </Typography>
                </Grid>
              )}
            </Grid>
          </TabPanel>

          {/* Actions */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                // reset simple vers valeurs initiales
                setPrenom(userData.prenom);
                setNom(userData.nom);
                setEmail(userData.email);
                setTelephone(userData.telephone);
                setRue(userData.domiciliation.rue);
                setCp(userData.domiciliation.cp);
                setVille(userData.domiciliation.ville);
                setPays(userData.domiciliation.pays);
                setAvatar(userData.avatarUrl);
                setPassword("");
                setConfirmPassword("");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              disabled={loading}
            >
              Réinitialiser
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading || !hasChanges || emailError || phoneError || pwdMismatch}
              startIcon={loading ? <CircularProgress size={18} /> : undefined}
            >
              {loading ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </Stack>
        </CardContent>
      </ModernCard>

      {/* Snackbar global */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {errorMsg ? (
          <Alert severity="error" onClose={() => setSnackOpen(false)} variant="filled">
            {errorMsg}
          </Alert>
        ) : successMsg ? (
          <Alert severity="success" onClose={() => setSnackOpen(false)} variant="filled">
            {successMsg}
          </Alert>
        ) : (
          <Alert severity="info" onClose={() => setSnackOpen(false)} variant="filled">
            Info
          </Alert>
        )}
      </Snackbar>
    </Shell>
  );
};

export default ProfilPage;

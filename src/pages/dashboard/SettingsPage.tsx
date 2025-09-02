import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Stack,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  useTheme,
  Grid,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Avatar,
  InputAdornment,
  IconButton,
  Chip,
  CircularProgress,
  Fade,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Slider,
  Skeleton,
  Paper,
  Tooltip,
  Collapse,
  styled,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  Save as SaveIcon,
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  CloudUpload as CloudUploadIcon,
  Language as LanguageIcon,
  Dashboard as DashboardIcon,
  Lock as LockIcon,
  Restore as RestoreIcon,
  Image as ImageIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Colorize as ColorizeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

// ========================= Styled Components =========================
const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  padding: theme.spacing(1, 2),
  borderRadius: 12,
  fontWeight: 600,
  textTransform: 'none',
}));

// ========================= Types =========================
interface PlatformSettings {
  general: {
    platformName: string;
    platformDescription: string;
    address: string;
    contactEmail: string;
    phoneNumber: string;
    language: string;
    timezone: string;
  };
  appearance: {
    themeMode: "light" | "dark" | "auto";
    primaryColor: string;
    secondaryColor: string;
    borderRadius: number;
    fontFamily: string;
    density: "comfortable" | "compact" | "spacious";
  };
  notifications: {
    emailNotifications: boolean;
    marketingEmails: boolean;
    securityAlerts: boolean;
    newsletter: boolean;
    pushNotifications: boolean;
    soundEnabled: boolean;
  };
  security: {
    maintenanceMode: boolean;
    twoFactorAuth: boolean;
    sessionTimeout: number; // minutes
    passwordPolicy: "low" | "medium" | "high";
    loginAttempts: number;
    dataEncryption: boolean;
  };
}

// ========================= Defaults =========================
const defaultSettings: PlatformSettings = {
  general: {
    platformName: "NovaSphere",
    platformDescription: "Plateforme de gestion d'entreprise tout-en-un",
    address: "123 rue de l'Innovation, 75000 Paris",
    contactEmail: "contact@novasphere.com",
    phoneNumber: "+33 1 23 45 67 89",
    language: "fr",
    timezone: "Europe/Paris",
  },
  appearance: {
    themeMode: "light",
    primaryColor: "#556cd6",
    secondaryColor: "#ff4081",
    borderRadius: 12,
    fontFamily: '"Inter", "Roboto", sans-serif',
    density: "comfortable",
  },
  notifications: {
    emailNotifications: true,
    marketingEmails: false,
    securityAlerts: true,
    newsletter: true,
    pushNotifications: true,
    soundEnabled: true,
  },
  security: {
    maintenanceMode: false,
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordPolicy: "high",
    loginAttempts: 5,
    dataEncryption: true,
  },
};

// ========================= Utils =========================
const isHex = (v: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v);
const deepEqual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};
const validatePhone = (phone: string): boolean => {
  const re = /^(\+\d{1,3}[- ]?)?\d{8,15}$/;
  return re.test(phone.replace(/\s/g, ''));
};

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

// Typed update helper
function useSettingsState(initial: PlatformSettings) {
  const [settings, setSettings] = useState<PlatformSettings>(initial);
  function update<K extends keyof PlatformSettings, F extends keyof PlatformSettings[K]>(
    category: K,
    field: F,
    value: PlatformSettings[K][F]
  ) {
    setSettings((prev) => ({
      ...prev,
      [category]: { ...prev[category], [field]: value },
    }));
  }
  return { settings, setSettings, update } as const;
}

// Reusable section card
const SectionCard: React.FC<React.PropsWithChildren<{ 
  title: React.ReactNode; 
  icon?: React.ReactNode; 
  action?: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}>> = ({
  title,
  icon,
  action,
  children,
  collapsible = false,
  defaultExpanded = true,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  return (
    <GradientCard>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {icon}
            <Typography variant="h6" fontWeight="600">{title}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            {action}
            {collapsible && (
              <Tooltip title={expanded ? "Réduire" : "Développer"}>
                <IconButton 
                  size="small" 
                  onClick={() => setExpanded(!expanded)}
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    }
                  }}
                >
                  {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
        <Collapse in={expanded}>
          <Box sx={{ mt: 2.5 }}>
            {children}
          </Box>
        </Collapse>
      </Box>
    </GradientCard>
  );
};

// Advanced Theme Preview Component
const AdvancedThemePreview: React.FC<{ previewTheme: ReturnType<typeof createTheme> }> = ({ previewTheme }) => {
  return (
    <ThemeProvider theme={previewTheme}>
      <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha(previewTheme.palette.divider, 0.1)}` }}>
        <Typography variant="subtitle1" fontWeight="600" gutterBottom>
          Aperçu du thème
        </Typography>
        
        {/* Barre d'outils simulée */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
          <Button variant="contained" size="small">Nouveau</Button>
          <Button variant="outlined" size="small">Ouvrir</Button>
          <Button variant="outlined" size="small" color="secondary">
            Options
          </Button>
        </Box>
        
        {/* Tableau simulé */}
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, mb: 2, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', p: 1.5, bgcolor: 'action.hover' }}>
            <Typography variant="subtitle2" sx={{ flex: 1 }}>Nom</Typography>
            <Typography variant="subtitle2" sx={{ flex: 1 }}>Valeur</Typography>
            <Typography variant="subtitle2" sx={{ width: 100 }}>Status</Typography>
          </Box>
          <Box sx={{ display: 'flex', p: 1.5, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ flex: 1 }}>Element 1</Typography>
            <Typography variant="body2" sx={{ flex: 1 }}>123</Typography>
            <Chip label="Actif" size="small" color="success" />
          </Box>
          <Box sx={{ display: 'flex', p: 1.5, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ flex: 1 }}>Element 2</Typography>
            <Typography variant="body2" sx={{ flex: 1 }}>456</Typography>
            <Chip label="Inactif" size="small" color="error" />
          </Box>
        </Box>
        
        {/* Formulaire simulé */}
        <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Formulaire exemple</Typography>
          <TextField size="small" fullWidth placeholder="Nom" sx={{ mb: 1.5 }} />
          <TextField size="small" fullWidth placeholder="Description" multiline rows={2} />
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button variant="contained" size="small">Sauvegarder</Button>
            <Button variant="outlined" size="small">Annuler</Button>
          </Box>
        </Box>
      </Paper>
    </ThemeProvider>
  );
};

// ========================= Component =========================
const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Load from localStorage (simulate persistence)
  const [persisted, setPersisted] = useLocalStorage<PlatformSettings>("app.settings", defaultSettings);
  const { settings, setSettings, update } = useSettingsState(persisted);
  const [saved, setSaved] = useState<PlatformSettings>(persisted);

  const [tab, setTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: "success" | "error" | "info" }>(
    { open: false, msg: "", sev: "success" }
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedColorType, setSelectedColorType] = useState<"primary" | "secondary">("primary");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    preferences: true,
    customization: true,
    themePreview: true,
    emailNotifications: true,
    realtimeNotifications: true,
    securityAccess: true,
    securityLog: true,
  });

  // Simulate initial loading
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Track changes
  useEffect(() => {
    setHasChanges(!deepEqual(settings, saved));
  }, [settings, saved]);

  // Preview theme (isolated)
  const previewTheme = useMemo(() => {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const mode = settings.appearance.themeMode === "auto" ? (prefersDark ? "dark" : "light") : settings.appearance.themeMode;
    return createTheme({
      palette: {
        mode,
        primary: { main: settings.appearance.primaryColor },
        secondary: { main: settings.appearance.secondaryColor },
      },
      shape: { borderRadius: settings.appearance.borderRadius },
      typography: { fontFamily: settings.appearance.fontFamily },
    });
  }, [settings.appearance]);

  // Handlers
  const handleTabChange = (_: React.SyntheticEvent, v: number) => setTab(v);

  const handleSave = () => {
    // Validate fields
    const newErrors: Record<string, string> = {};
    
    if (!validateEmail(settings.general.contactEmail)) {
      newErrors.contactEmail = "Email invalide";
    }
    
    if (!validatePhone(settings.general.phoneNumber)) {
      newErrors.phoneNumber = "Numéro de téléphone invalide";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSnack({ open: true, msg: "Veuillez corriger les erreurs", sev: "error" });
      return;
    }
    
    setErrors({});
    setIsLoading(true);
    setTimeout(() => {
      setSaved(settings);
      setPersisted(settings);
      setIsLoading(false);
      setSnack({ open: true, msg: "Paramètres sauvegardés avec succès", sev: "success" });
      document.documentElement.setAttribute("data-theme", settings.appearance.themeMode);
    }, 700);
  };

  const handleReset = () => {
    setSettings(saved);
    setSnack({ open: true, msg: "Modifications annulées", sev: "info" });
  };

  const handleDefault = () => {
    setSettings(defaultSettings);
    setSnack({ open: true, msg: "Valeurs par défaut rétablies", sev: "success" });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target?.result as string);
    reader.readAsDataURL(f);
    setSnack({ open: true, msg: "Logo importé", sev: "success" });
  };

  const openColorPicker = (type: "primary" | "secondary") => {
    setSelectedColorType(type);
    setColorPickerOpen(true);
  };

  const applyHexColor = (hex: string) => {
    if (!isHex(hex)) {
      setSnack({ open: true, msg: "Couleur HEX invalide (ex: #556cd6)", sev: "error" });
      return;
    }
    update("appearance", (selectedColorType + "Color") as any, hex as any);
    setColorPickerOpen(false);
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `novasphere-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setSnack({ open: true, msg: "Paramètres exportés", sev: "success" });
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string) as PlatformSettings;
        setSettings(importedSettings);
        setSnack({ open: true, msg: "Paramètres importés avec succès", sev: "success" });
      } catch (error) {
        setSnack({ open: true, msg: "Erreur lors de l'importation", sev: "error" });
      }
    };
    reader.readAsText(file);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // ========================= Render =========================
  return (
    <Fade in timeout={600}>
      <Box sx={{ p: { xs: 2, md: 3 }, minHeight: "100vh", maxWidth: 1400, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            fontWeight="bold" 
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            ⚙️ Paramètres de la plateforme
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Personnalisez l'apparence, les notifications et la sécurité de votre espace
          </Typography>
        </Box>

        <GradientCard sx={{ mb: 3, overflow: 'hidden' }}>
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            {hasChanges && (
              <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                Des modifications sont en attente de sauvegarde.
              </Alert>
            )}

            <Tabs
              value={tab}
              onChange={handleTabChange}
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': { 
                  minHeight: 60, 
                  textTransform: 'none', 
                  fontWeight: 600,
                  fontSize: '1rem',
                },
                '& .MuiTabs-indicator': { 
                  height: 3, 
                  borderRadius: 2,
                },
              }}
            >
              <Tab icon={<BusinessIcon />} iconPosition="start" label="Général" />
              <Tab icon={<PaletteIcon />} iconPosition="start" label="Apparence" />
              <Tab icon={<NotificationsIcon />} iconPosition="start" label="Notifications" />
              <Tab icon={<SecurityIcon />} iconPosition="start" label="Sécurité" />
            </Tabs>
          </Box>
        </GradientCard>

        {/* Content */}
        {isLoading ? (
          <GradientCard sx={{ p: 3 }}>
            <Grid container spacing={2}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Grid item xs={12} md={6} key={i}>
                  <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          </GradientCard>
        ) : (
          <>
            {/* === General === */}
            {tab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <SectionCard 
                    title="Informations de base" 
                    icon={<BusinessIcon color="primary" />}
                    collapsible
                    defaultExpanded={expandedSections.general}
                    action={
                      <Tooltip title="Actualiser">
                        <IconButton size="small" onClick={() => toggleSection('general')}>
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <Stack spacing={2.5}>
                      <TextField
                        label="Nom de la plateforme"
                        value={settings.general.platformName}
                        onChange={(e) => update("general", "platformName", e.target.value)}
                        fullWidth
                      />
                      <TextField
                        label="Description"
                        multiline
                        minRows={2}
                        value={settings.general.platformDescription}
                        onChange={(e) => update("general", "platformDescription", e.target.value)}
                        fullWidth
                      />
                      <TextField
                        label="Adresse postale"
                        value={settings.general.address}
                        onChange={(e) => update("general", "address", e.target.value)}
                        fullWidth
                      />
                      <TextField
                        label="Email de contact"
                        value={settings.general.contactEmail}
                        onChange={(e) => update("general", "contactEmail", e.target.value)}
                        error={!!errors.contactEmail}
                        helperText={errors.contactEmail}
                        fullWidth
                      />
                      <TextField
                        label="Numéro de téléphone"
                        value={settings.general.phoneNumber}
                        onChange={(e) => update("general", "phoneNumber", e.target.value)}
                        error={!!errors.phoneNumber}
                        helperText={errors.phoneNumber || "Format: +33 1 23 45 67 89"}
                        fullWidth
                      />
                    </Stack>
                  </SectionCard>
                </Grid>

                <Grid item xs={12} md={6}>
                  <SectionCard 
                    title="Préférences" 
                    icon={<LanguageIcon color="primary" />}
                    collapsible
                    defaultExpanded={expandedSections.preferences}
                    action={
                      <Tooltip title="Actualiser">
                        <IconButton size="small" onClick={() => toggleSection('preferences')}>
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <Stack spacing={2.5}>
                      <FormControl fullWidth>
                        <InputLabel>Langue</InputLabel>
                        <Select
                          label="Langue"
                          value={settings.general.language}
                          onChange={(e) => update("general", "language", e.target.value as any)}
                        >
                          <MenuItem value="fr">Français</MenuItem>
                          <MenuItem value="en">English</MenuItem>
                          <MenuItem value="es">Español</MenuItem>
                          <MenuItem value="de">Deutsch</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl fullWidth>
                        <InputLabel>Fuseau horaire</InputLabel>
                        <Select
                          label="Fuseau horaire"
                          value={settings.general.timezone}
                          onChange={(e) => update("general", "timezone", e.target.value as any)}
                        >
                          <MenuItem value="Europe/Paris">Paris (UTC+1)</MenuItem>
                          <MenuItem value="Europe/London">London (UTC+0)</MenuItem>
                          <MenuItem value="America/New_York">New York (UTC-5)</MenuItem>
                          <MenuItem value="Asia/Tokyo">Tokyo (UTC+9)</MenuItem>
                        </Select>
                      </FormControl>

                      <Box>
                        <Typography variant="subtitle2" gutterBottom fontWeight="600">
                          Logo de la plateforme
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            src={logo || "/placeholder-logo.png"}
                            sx={{ width: 64, height: 64, bgcolor: "primary.main", boxShadow: 2 }}
                          >
                            {settings.general.platformName.charAt(0)}
                          </Avatar>
                          <Button 
                            variant="outlined" 
                            component="label" 
                            startIcon={<CloudUploadIcon />}
                            sx={{ borderRadius: 2 }}
                          >
                            Importer un logo
                            <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                          </Button>
                        </Stack>
                      </Box>

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom fontWeight="600">
                          Import/Export des paramètres
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Button 
                            variant="outlined" 
                            startIcon={<DownloadIcon />} 
                            onClick={handleExportSettings}
                            size="small"
                            sx={{ borderRadius: 2 }}
                          >
                            Exporter
                          </Button>
                          <Button 
                            variant="outlined" 
                            component="label"
                            startIcon={<UploadIcon />}
                            size="small"
                            sx={{ borderRadius: 2 }}
                          >
                            Importer
                            <input type="file" hidden accept=".json" onChange={handleImportSettings} />
                          </Button>
                        </Stack>
                      </Box>
                    </Stack>
                  </SectionCard>
                </Grid>
              </Grid>
            )}

            {/* === Appearance === */}
            {tab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <SectionCard 
                    title="Personnalisation" 
                    icon={<PaletteIcon color="primary" />}
                    collapsible
                    defaultExpanded={expandedSections.customization}
                    action={
                      <Tooltip title="Actualiser">
                        <IconButton size="small" onClick={() => toggleSection('customization')}>
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <Stack spacing={2.5}>
                      <FormControl fullWidth>
                        <InputLabel>Thème</InputLabel>
                        <Select
                          label="Thème"
                          value={settings.appearance.themeMode}
                          onChange={(e) => update("appearance", "themeMode", e.target.value as any)}
                        >
                          <MenuItem value="light">
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Brightness7Icon fontSize="small" /> <span>Clair</span>
                            </Stack>
                          </MenuItem>
                          <MenuItem value="dark">
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Brightness4Icon fontSize="small" /> <span>Sombre</span>
                            </Stack>
                          </MenuItem>
                          <MenuItem value="auto">Automatique</MenuItem>
                        </Select>
                      </FormControl>

                      <Box>
                        <Typography variant="subtitle2" gutterBottom fontWeight="600">
                          Couleurs (primaire & secondaire)
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                          {["primary", "secondary"].map((t) => (
                            <Tooltip key={t} title={`Changer la couleur ${t}`}>
                              <Box 
                                onClick={() => openColorPicker(t as any)}
                                sx={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: 2,
                                  cursor: "pointer",
                                  border: "2px solid",
                                  borderColor: "divider",
                                  boxShadow: 2,
                                  bgcolor: t === "primary" ? settings.appearance.primaryColor : settings.appearance.secondaryColor,
                                  transition: 'transform 0.2s',
                                  '&:hover': {
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              />
                            </Tooltip>
                          ))}
                          <Tooltip title="Sélecteur de couleur">
                            <IconButton 
                              onClick={() => openColorPicker("primary")}
                              sx={{
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                }
                              }}
                            >
                              <ColorizeIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" gutterBottom fontWeight="600">
                          Arrondi des coins
                        </Typography>
                        <Slider
                          value={settings.appearance.borderRadius}
                          min={0}
                          max={24}
                          step={1}
                          valueLabelDisplay="auto"
                          onChange={(_, v) => update("appearance", "borderRadius", v as number)}
                          sx={{ mt: 2 }}
                        />
                      </Box>

                      <FormControl fullWidth>
                        <InputLabel>Densité d'affichage</InputLabel>
                        <Select
                          label="Densité d'affichage"
                          value={settings.appearance.density}
                          onChange={(e) => update("appearance", "density", e.target.value as any)}
                        >
                          <MenuItem value="comfortable">Confortable</MenuItem>
                          <MenuItem value="compact">Compact</MenuItem>
                          <MenuItem value="spacious">Spacieux</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </SectionCard>
                </Grid>

                <Grid item xs={12} md={6}>
                  <SectionCard 
                    title="Aperçu du thème" 
                    icon={<ImageIcon color="primary" />}
                    collapsible
                    defaultExpanded={expandedSections.themePreview}
                    action={
                      <Tooltip title="Actualiser">
                        <IconButton size="small" onClick={() => toggleSection('themePreview')}>
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <AdvancedThemePreview previewTheme={previewTheme} />
                  </SectionCard>
                </Grid>
              </Grid>
            )}

            {/* === Notifications === */}
            {tab === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <SectionCard 
                    title="Notifications email" 
                    icon={<NotificationsIcon color="primary" />}
                    collapsible
                    defaultExpanded={expandedSections.emailNotifications}
                    action={
                      <Tooltip title="Actualiser">
                        <IconButton size="small" onClick={() => toggleSection('emailNotifications')}>
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  > 
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <DashboardIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Notifications générales" />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={settings.notifications.emailNotifications}
                            onChange={(e) => update("notifications", "emailNotifications", e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Alertes de sécurité" />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={settings.notifications.securityAlerts}
                            onChange={(e) => update("notifications", "securityAlerts", e.target.checked)}
                            disabled={!settings.notifications.emailNotifications}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Lettre d'information" />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={settings.notifications.newsletter}
                            onChange={(e) => update("notifications", "newsletter", e.target.checked)}
                            disabled={!settings.notifications.emailNotifications}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Emails marketing" />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={settings.notifications.marketingEmails}
                            onChange={(e) => update("notifications", "marketingEmails", e.target.checked)}
                            disabled={!settings.notifications.emailNotifications}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </SectionCard>
                </Grid>

                <Grid item xs={12} md={6}>
                  <SectionCard 
                    title="Notifications en temps réel" 
                    icon={<DashboardIcon color="primary" />}
                    collapsible
                    defaultExpanded={expandedSections.realtimeNotifications}
                    action={
                      <Tooltip title="Actualiser">
                        <IconButton size="small" onClick={() => toggleSection('realtimeNotifications')}>
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  > 
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Notifications push" />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={settings.notifications.pushNotifications}
                            onChange={(e) => update("notifications", "pushNotifications", e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Sons de notification" />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={settings.notifications.soundEnabled}
                            onChange={(e) => update("notifications", "soundEnabled", e.target.checked)}
                            disabled={!settings.notifications.pushNotifications}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </SectionCard>
                </Grid>
              </Grid>
            )}

            {/* === Security === */}
            {tab === 3 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <SectionCard 
                    title="Sécurité & accès" 
                    icon={<LockIcon color="primary" />}
                    collapsible
                    defaultExpanded={expandedSections.securityAccess}
                    action={
                      <Tooltip title="Actualiser">
                        <IconButton size="small" onClick={() => toggleSection('securityAccess')}>
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  > 
                    <Stack spacing={2.5}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.security.maintenanceMode}
                            onChange={(e) => update("security", "maintenanceMode", e.target.checked)}
                          />
                        }
                        label="Mode maintenance"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.security.twoFactorAuth}
                            onChange={(e) => update("security", "twoFactorAuth", e.target.checked)}
                          />
                        }
                        label="Authentification à deux facteurs (2FA)"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.security.dataEncryption}
                            onChange={(e) => update("security", "dataEncryption", e.target.checked)}
                          />
                        }
                        label="Chiffrement des données"
                      />

                      <FormControl fullWidth>
                        <InputLabel>Politique de mot de passe</InputLabel>
                        <Select
                          label="Politique de mot de passe"
                          value={settings.security.passwordPolicy}
                          onChange={(e) => update("security", "passwordPolicy", e.target.value as any)}
                        >
                          <MenuItem value="low">Faible (≥ 6 caractères)</MenuItem>
                          <MenuItem value="medium">Moyenne (≥ 8, lettres & chiffres)</MenuItem>
                          <MenuItem value="high">Forte (≥ 12, lettres, chiffres & spéciaux)</MenuItem>
                        </Select>
                      </FormControl>

                      <Box>
                        <Typography variant="subtitle2" gutterBottom fontWeight="600">
                          Expiration de session (minutes)
                        </Typography>
                        <Slider
                          value={settings.security.sessionTimeout}
                          min={5}
                          max={240}
                          step={5}
                          marks={[{ value: 15, label: "15" }, { value: 60, label: "60" }, { value: 120, label: "120" }]}
                          valueLabelDisplay="auto"
                          onChange={(_, v) => update("security", "sessionTimeout", v as number)}
                          sx={{ mt: 2 }}
                        />
                      </Box>

                      <FormControl fullWidth>
                        <InputLabel>Tentatives avant blocage</InputLabel>
                        <Select
                          label="Tentatives avant blocage"
                          value={settings.security.loginAttempts}
                          onChange={(e) => update("security", "loginAttempts", Number(e.target.value))}
                        >
                          <MenuItem value={3}>3 tentatives</MenuItem>
                          <MenuItem value={5}>5 tentatives</MenuItem>
                          <MenuItem value={10}>10 tentatives</MenuItem>
                        </Select>
                      </FormControl>
                  </Stack>
                  </SectionCard>
                </Grid>

                <Grid item xs={12} md={6}>
                  <SectionCard 
                    title="Journal de sécurité" 
                    icon={<SecurityIcon color="primary" />}
                    collapsible
                    defaultExpanded={expandedSections.securityLog}
                    action={
                      <Tooltip title="Actualiser">
                        <IconButton size="small" onClick={() => toggleSection('securityLog')}>
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  > 
                    <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Dernières activités
                      </Typography>
                      <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: "success.main" }}>✓</Avatar>
                            <Typography variant="body2">Connexion réussie</Typography>
                          </Stack>
                          <Chip label="Aujourd'hui, 14:32" size="small" variant="outlined" />
                        </Stack>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: "info.main" }}>🔒</Avatar>
                            <Typography variant="body2">Mot de passe modifié</Typography>
                          </Stack>
                          <Chip label="Hier, 09:15" size="small" variant="outlined" />
                        </Stack>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: "warning.main" }}>!</Avatar>
                            <Typography variant="body2">Tentative de connexion</Typography>
                          </Stack>
                          <Chip label="12 Oct, 18:43" size="small" variant="outlined" />
                        </Stack>
                      </Stack>
                      <Button size="small" sx={{ mt: 1.5 }}>Voir tout</Button>
                    </Paper>

                    <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
                      Activez la 2FA et utilisez des mots de passe uniques. Pensez à auditer régulièrement vos accès.
                    </Alert>
                  </SectionCard>
                </Grid>
              </Grid>
            )}
          </>
        )}

        {/* Sticky action bar */}
        <Box
          sx={{
            position: "sticky",
            bottom: 16,
            mt: 3,
            mx: { xs: -2, md: -3 },
            px: { xs: 2, md: 3 },
            zIndex: 1000,
          }}
        >
          <GradientCard>
            <Box sx={{ p: 2 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }}>
                <ActionButton 
                  variant="outlined" 
                  startIcon={<RestoreIcon />} 
                  onClick={handleDefault} 
                  disabled={isLoading}
                  color="inherit"
                >
                  Valeurs par défaut
                </ActionButton>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <ActionButton 
                    variant="outlined" 
                    onClick={handleReset} 
                    disabled={!hasChanges || isLoading} 
                    color="inherit"
                  >
                    Annuler
                  </ActionButton>
                  <ActionButton
                    variant="contained"
                    startIcon={isLoading ? <CircularProgress size={16} /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={!hasChanges || isLoading}
                    sx={{ minWidth: 160 }}
                  >
                    {isLoading ? "Sauvegarde..." : "Sauvegarder"}
                  </ActionButton>
                </Stack>
              </Stack>
            </Box>
          </GradientCard>
        </Box>

        {/* Color picker dialog */}
        <Dialog 
          open={colorPickerOpen} 
          onClose={() => setColorPickerOpen(false)} 
          maxWidth="xs" 
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: 3,
              overflow: 'hidden',
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" fontWeight="600">
              Choisir la couleur {selectedColorType === "primary" ? "primaire" : "secondaire"}
            </Typography>
          </DialogTitle>
          <IconButton
            onClick={() => setColorPickerOpen(false)}
            sx={{ 
              position: "absolute", 
              top: 12, 
              right: 12,
            }}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent>
            <Box sx={{ py: 1 }}>
              <Typography variant="body2" gutterBottom fontWeight="600">
                Couleurs prédéfinies
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                {["#556cd6", "#ff4081", "#4caf50", "#ff9800", "#9c27b0", "#2196f3", "#00bcd4", "#795548"].map((c) => (
                  <Tooltip key={c} title={c}>
                    <Box
                      onClick={() => applyHexColor(c)}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        bgcolor: c,
                        border: "1px solid",
                        borderColor: "divider",
                        cursor: "pointer",
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    />
                  </Tooltip>
                ))}
              </Stack>

              <TextField
                label="HEX personnalisé"
                fullWidth
                margin="normal"
                placeholder="#556cd6"
                defaultValue={settings.appearance[(selectedColorType + "Color") as "primaryColor" | "secondaryColor"]}
                onBlur={(e) => applyHexColor(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        borderRadius: "50%", 
                        bgcolor: settings.appearance[(selectedColorType + "Color") as any], 
                        border: "1px solid", 
                        borderColor: "divider" 
                      }} />
                    </InputAdornment>
                  ),
                  inputProps: { spellCheck: false },
                }}
                helperText="Entrez une couleur au format #RRGGBB"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <ActionButton onClick={() => setColorPickerOpen(false)}>Fermer</ActionButton>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snack.open}
          autoHideDuration={3500}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert 
            severity={snack.sev} 
            variant="filled" 
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            sx={{ borderRadius: 3 }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default SettingsPage;
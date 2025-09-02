import React, { useState, SyntheticEvent, ChangeEvent } from "react";
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  Avatar,
  Button,
  Stack,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  IconButton,
  useTheme,
  alpha,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  InputAdornment,
  CardHeader,
  AvatarGroup,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  styled,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress"; // ✅ ajouté
import PrintIcon from "@mui/icons-material/Print"; // ✅ ajouté
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  UploadFile as UploadFileIcon,
  Timeline as TimelineIcon,
  Info as InfoIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  CreditCard as CreditCardIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  LocationOn as LocationOnIcon,
  CorporateFare as CorporateFareIcon,
  AttachMoney as AttachMoneyIcon,
  Web as WebIcon,
  Receipt as ReceiptIcon,
  Lock as LockIcon,
  Palette as PaletteIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

// ==================== STYLED COMPONENTS ====================
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 12px 48px ${alpha(theme.palette.common.black, 0.12)}`,
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  fontWeight: 600,
  borderRadius: 12,
  padding: "10px 24px",
  color: "white",
  "&:hover": {
    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  height: 68,
  "&:nth-of-type(odd)": {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
  "&:nth-of-type(even)": {
    backgroundColor: theme.palette.common.white,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
}));

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(2),
  fontWeight: "bold",
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  fontSize: "0.875rem",
  color: theme.palette.primary.main,
}));

// ==================== INTERFACES ====================
interface Document {
  id: string;
  type: string;
  fileName: string;
  uploadDate: string;
  status: "validé" | "en attente" | "refusé";
  url: string;
  fileSize?: string;
  progress?: number;
}

interface ActivityItem {
  id: number;
  type: string;
  action: string;
  title: string;
  description: string;
  time: string;
  icon: React.ReactElement;
  status: string;
}

interface SocieteInfo {
  raisonSociale: string;
  adresse: string;
  siret: string;
  codeApe: string;
  capitalSocial: string;
  telephone: string;
  email: string;
  siteWeb: string;
  representantLegal: string;
}

interface UploadTask {
  id: string;
  file: File;
  type: string;
  progress: number;
}

// ==================== COMPOSANT ACTIVITY ====================
const ActivityComponent = () => {
  const theme = useTheme();

  const activities: ActivityItem[] = [
    {
      id: 1,
      type: "document",
      action: "upload",
      title: "Document téléchargé",
      description: "Contrat de domiciliation signé",
      time: "Il y a 2 heures",
      icon: <DescriptionIcon />,
      status: "success",
    },
    {
      id: 2,
      type: "profile",
      action: "update",
      title: "Profil mis à jour",
      description: "Informations de contact modifiées",
      time: "Il y a 1 jour",
      icon: <PersonIcon />,
      status: "info",
    },
    {
      id: 3,
      type: "payment",
      action: "processed",
      title: "Paiement traité",
      description: "Facture #001245 payée",
      time: "Il y a 3 jours",
      icon: <CheckCircleIcon />,
      status: "success",
    },
    {
      id: 4,
      type: "document",
      action: "rejected",
      title: "Document refusé",
      description: "Justificatif de domicile nécessite une revision",
      time: "Il y a 5 jours",
      icon: <ErrorIcon />,
      status: "error",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return theme.palette.success.main;
      case "error":
        return theme.palette.error.main;
      case "info":
        return theme.palette.info.main;
      default:
        return theme.palette.primary.main;
    }
  };

  return (
    <StyledCard>
      <CardHeader
        title="Activité récente"
        action={
          <Button size="small" startIcon={<RefreshIcon />}>
            Actualiser
          </Button>
        }
      />
      <CardContent>
        {activities.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <TimelineIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography variant="body1" color="textSecondary" gutterBottom>
              Aucune activité récente
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Votre activité apparaîtra ici
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: "100%" }}>
            {activities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: alpha(getStatusColor(activity.status), 0.1),
                        color: getStatusColor(activity.status),
                      }}
                    >
                      {activity.icon}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="medium">
                          {activity.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.time}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {activity.description}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < activities.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </StyledCard>
  );
};

// ==================== COMPOSANT OVERVIEW ====================
const OverviewComponent = () => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const theme = useTheme();

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPhotoUrl(URL.createObjectURL(file));
    }
  };

  const simulateUpload = () => {
    setUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          alert(`Photo "${selectedFile?.name}" sauvegardée (mock)`);
          setSelectedFile(null);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPhotoUrl(null);
    setUploadProgress(0);
    setUploading(false);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <StyledCard sx={{ height: "100%" }}>
          <CardContent sx={{ textAlign: "center", p: 3 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                <Button
                  variant="contained"
                  size="small"
                  component="label"
                  sx={{
                    minWidth: "auto",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    p: 0,
                  }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={uploading}
                  />
                </Button>
              }
            >
              <Avatar
                src={photoUrl ?? undefined}
                sx={{
                  width: 120,
                  height: 120,
                  mx: "auto",
                  mb: 2,
                  border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
                alt="Photo de profil"
              />
            </Badge>

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Jean Dupont
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              Administrateur
            </Typography>

            <Chip
              label="Compte vérifié"
              color="success"
              size="small"
              variant="outlined"
              icon={<CheckCircleIcon />}
              sx={{ mt: 1 }}
            />

            {selectedFile && (
              <Box sx={{ mt: 2 }}>
                {uploading && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress}
                      sx={{ borderRadius: 2, height: 6 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      {uploadProgress}% téléchargé
                    </Typography>
                  </Box>
                )}
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={simulateUpload}
                    disabled={uploading}
                  >
                    {uploading ? "Téléchargement..." : "Valider"}
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    onClick={handleCancel}
                    disabled={uploading}
                  >
                    Annuler
                  </Button>
                </Stack>
              </Box>
            )}
          </CardContent>
        </StyledCard>
      </Grid>

      <Grid item xs={12} md={8}>
        <ActivityComponent />
      </Grid>
    </Grid>
  );
};

// ==================== COMPOSANT INFORMATIONS ====================
const InformationsComponent = () => {
  const initialSociete: SocieteInfo = {
    raisonSociale: "SARL Exemple",
    adresse: "123 Rue de Paris, 75000 Paris",
    siret: "123 456 789 00012",
    codeApe: "6201Z",
    capitalSocial: "10 000 €",
    telephone: "01 23 45 67 89",
    email: "contact@societe-exemple.com",
    siteWeb: "https://www.societe-example.com",
    representantLegal: "Jean Dupont",
  };

  const [societe, setSociete] = useState<SocieteInfo>(initialSociete);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const theme = useTheme();

  const handleChange = (field: keyof SocieteInfo, value: string) => {
    setSociete((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!societe.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Adresse email invalide";
    }
    if (
      societe.telephone &&
      !societe.telephone.match(/^(\+\d{1,3})?[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}$/)
    ) {
      newErrors.telephone = "Numéro de téléphone invalide";
    }
    if (
      societe.siteWeb &&
      !societe.siteWeb.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)
    ) {
      newErrors.siteWeb = "URL de site web invalide";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    setSaving(true);
    // Simuler une sauvegarde
    setTimeout(() => {
      setSaving(false);
      setEditing(false);
    }, 1500);
  };

  const handleCancel = () => {
    setSociete(initialSociete);
    setErrors({});
    setEditing(false);
  };

  const fieldIcons = {
    raisonSociale: <CorporateFareIcon />,
    adresse: <LocationOnIcon />,
    siret: <ReceiptIcon />,
    codeApe: <InfoIcon />,
    capitalSocial: <AttachMoneyIcon />,
    telephone: <PhoneIcon />,
    email: <EmailIcon />,
    siteWeb: <WebIcon />,
    representantLegal: <PersonIcon />,
  };

  return (
    <StyledCard>
      <CardHeader
        title="Informations sur la société domiciliée"
        action={
          !editing ? (
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditing(true)}>
              Modifier
            </Button>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
              <Button variant="outlined" color="inherit" onClick={handleCancel} disabled={saving}>
                Annuler
              </Button>
            </Stack>
          )
        }
      />
      <CardContent>
        <Grid container spacing={3}>
          {Object.entries(societe).map(([field, value]) => {
            const isReadOnlyField = field === "siret" || field === "codeApe";
            const fieldKey = field as keyof SocieteInfo;
            const IconComponent = fieldIcons[fieldKey];

            return (
              <Grid item xs={12} md={6} key={field}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  {IconComponent}
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
                    : field}
                </Typography>
                {editing && !isReadOnlyField ? (
                  <TextField
                    fullWidth
                    size="small"
                    value={value}
                    error={Boolean(errors[field])}
                    helperText={errors[field]}
                    onChange={(e) => handleChange(fieldKey, e.target.value)}
                    type={field === "email" ? "email" : "text"}
                    InputProps={{
                      startAdornment:
                        field === "siteWeb" ? (
                          <InputAdornment position="start">
                            <LanguageIcon color="action" />
                          </InputAdornment>
                        ) : field === "telephone" ? (
                          <InputAdornment position="start">
                            <PhoneIcon color="action" />
                          </InputAdornment>
                        ) : field === "email" ? (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ) : undefined,
                    }}
                  />
                ) : field === "siteWeb" && !editing ? (
                  <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LanguageIcon fontSize="small" color="action" />
                    <a
                      href={value as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: theme.palette.primary.main }}
                    >
                      {value}
                    </a>
                  </Typography>
                ) : field === "telephone" && !editing ? (
                  <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    {value}
                  </Typography>
                ) : field === "email" && !editing ? (
                  <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <a href={`mailto:${value}`} style={{ color: "inherit" }}>
                      {value}
                    </a>
                  </Typography>
                ) : (
                  <Typography variant="body1">{value}</Typography>
                )}
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </StyledCard>
  );
};

// ==================== COMPOSANT DOCUMENTS ====================
const DocumentsComponent = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      type: "CNI",
      fileName: "carte_identite.pdf",
      uploadDate: "2025-07-10",
      status: "validé",
      url: "/mock_docs/cni.pdf",
      fileSize: "2.4 MB",
    },
    {
      id: "2",
      type: "Kbis",
      fileName: "extrait_kbis.pdf",
      uploadDate: "2025-06-15",
      status: "en attente",
      url: "/mock_docs/kbis.pdf",
      fileSize: "1.8 MB",
    },
    {
      id: "3",
      type: "Justificatif",
      fileName: "justificatif_domicile.pdf",
      uploadDate: "2025-06-01",
      status: "refusé",
      url: "/mock_docs/justificatif.pdf",
      fileSize: "3.2 MB",
    },
    {
      id: "4",
      type: "RIB",
      fileName: "rib_bancaire.pdf",
      uploadDate: "2025-07-12",
      status: "validé",
      url: "/mock_docs/rib.pdf",
      fileSize: "1.1 MB",
    },
    {
      id: "5",
      type: "Contrat",
      fileName: "contrat_signé.pdf",
      uploadDate: "2025-07-11",
      status: "en attente",
      url: "/mock_docs/contrat.pdf",
      fileSize: "4.5 MB",
    },
  ]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterType, setFilterType] = useState("all");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  const theme = useTheme();

  const filteredDocs = documents.filter((doc) => filterType === "all" || doc.type === filterType);

  const displayedDocs = filteredDocs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handlePreview = (url: string) => {
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewUrl("");
  };

  const simulateUpload = (file: File, id: string) => {
    setUploadTasks((prev) => [...prev, { id, file, type: selectedDocumentType, progress: 0 }]);

    const interval = setInterval(() => {
      setUploadTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, progress: Math.min(task.progress + 10, 100) } : task))
      );

      setUploadTasks((prev) => {
        const task = prev.find((t) => t.id === id);
        if (task && task.progress >= 100) {
          clearInterval(interval);

          setTimeout(() => {
            setUploadTasks((prev) => prev.filter((t) => t.id !== id));
            setDocuments((prev) => [
              {
                id,
                type: selectedDocumentType,
                fileName: file.name,
                uploadDate: new Date().toISOString().slice(0, 10),
                status: "en attente",
                url: URL.createObjectURL(file),
                fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              },
              ...prev,
            ]);
          }, 2000);
        }
        return prev;
      });
    }, 200);
  };

  const handleFileUpload = () => {
    if (selectedFile && selectedDocumentType) {
      const newId = `new-${Date.now()}`;
      simulateUpload(selectedFile, newId);
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setSelectedDocumentType("");
    }
  };

  const getStatusColor = (status: Document["status"]) => {
    switch (status) {
      case "validé":
        return "success";
      case "en attente":
        return "warning";
      case "refusé":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status: Document["status"]) => {
    switch (status) {
      case "validé":
        return "Validé";
      case "en attente":
        return "En attente";
      case "refusé":
        return "Refusé";
      default:
        return status;
    }
  };

  return (
    <StyledCard>
      <CardHeader
        title="Mes documents"
        action={
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                label="Type"
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="CNI">CNI</MenuItem>
                <MenuItem value="Kbis">Kbis</MenuItem>
                <MenuItem value="Justificatif">Justificatif</MenuItem>
                <MenuItem value="RIB">RIB</MenuItem>
                <MenuItem value="Contrat">Contrat</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={() => setUploadDialogOpen(true)}>
              Nouveau document
            </Button>
          </Box>
        }
      />
      <CardContent>
        {uploadTasks.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Téléchargements en cours ({uploadTasks.length})
            </Typography>
            {uploadTasks.map((task) => (
              <Box key={task.id} sx={{ mb: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                  <Typography variant="body2" noWrap sx={{ maxWidth: "70%" }}>
                    {task.file.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {task.progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={task.progress}
                  color={task.progress === 100 ? "success" : "primary"}
                  sx={{ borderRadius: 2, height: 4 }}
                />
              </Box>
            ))}
          </Box>
        )}

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <TableRow>
                <StyledTableHeadCell>Type</StyledTableHeadCell>
                <StyledTableHeadCell>Nom du fichier</StyledTableHeadCell>
                <StyledTableHeadCell>Date</StyledTableHeadCell>
                <StyledTableHeadCell>Taille</StyledTableHeadCell>
                <StyledTableHeadCell>Statut</StyledTableHeadCell>
                <StyledTableHeadCell align="center">Actions</StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedDocs.map((doc) => {
                const uploadTask = uploadTasks.find((task) => task.id === doc.id);

                return (
                  <StyledTableRow key={doc.id} hover>
                    <StyledTableCell>{doc.type}</StyledTableCell>
                    <StyledTableCell>{doc.fileName}</StyledTableCell>
                    <StyledTableCell>{doc.uploadDate}</StyledTableCell>
                    <StyledTableCell>{doc.fileSize}</StyledTableCell>
                    <StyledTableCell>
                      <Chip label={getStatusText(doc.status)} color={getStatusColor(doc.status)} size="small" />
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                        <Tooltip title="Visualiser">
                          <IconButton
                            onClick={() => handlePreview(doc.url)}
                            color="primary"
                            size="small"
                            sx={{
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              "&:hover": {
                                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                              },
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Télécharger">
                          <IconButton
                            component="a"
                            href={doc.url}
                            download
                            color="primary"
                            size="small"
                            sx={{
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              "&:hover": {
                                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                              },
                            }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      {uploadTask && (
                        <LinearProgress variant="determinate" value={uploadTask.progress} sx={{ mt: 1, borderRadius: 2, height: 4 }} />
                      )}
                    </StyledTableCell>
                  </StyledTableRow>
                );
              })}
              {displayedDocs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <DescriptionIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                      <Typography variant="body1" color="textSecondary" gutterBottom>
                        Aucun document trouvé
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {filterType !== "all" ? "Essayez de modifier vos filtres" : "Commencez par uploader votre premier document"}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredDocs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: `1px solid ${theme.palette.divider}`, mt: 2 }}
        />

        <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <CloudUploadIcon color="primary" />
              Uploader un nouveau document
            </Box>
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Type de document</InputLabel>
              <Select
                value={selectedDocumentType}
                label="Type de document"
                onChange={(e) => setSelectedDocumentType(e.target.value)}
              >
                <MenuItem value="CNI">CNI</MenuItem>
                <MenuItem value="Kbis">Kbis</MenuItem>
                <MenuItem value="Justificatif">Justificatif</MenuItem>
                <MenuItem value="RIB">RIB</MenuItem>
                <MenuItem value="Contrat">Contrat</MenuItem>
                <MenuItem value="Autre">Autre</MenuItem>
              </Select>
            </FormControl>

            <Button component="label" variant="outlined" fullWidth sx={{ mt: 2 }} startIcon={<UploadFileIcon />}>
              Sélectionner un fichier
              <input
                type="file"
                hidden
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                accept="application/pdf,image/*"
              />
            </Button>

            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
                Fichier sélectionné : {selectedFile.name}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadDialogOpen(false)}>Annuler</Button>
            <Button variant="contained" onClick={handleFileUpload} disabled={!selectedFile || !selectedDocumentType}>
              Uploader
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={previewOpen}
          onClose={handleClosePreview}
          maxWidth="lg"
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              height: "80vh",
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: `1px solid ${theme.palette.divider}`,
              pb: 2,
            }}
          >
            <Typography variant="h6">Aperçu du document</Typography>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 0 }}>
            {previewUrl ? (
              <iframe
                src={previewUrl}
                title="Aperçu du document"
                width="100%"
                height="100%"
                style={{ border: "none", minHeight: "500px" }}
              />
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
                <Typography>Aucun document sélectionné</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePreview}>Fermer</Button>
            <Button component="a" href={previewUrl} download target="_blank" variant="contained" startIcon={<DownloadIcon />}>
              Télécharger
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </StyledCard>
  );
};

// ==================== COMPOSANT SETTINGS ====================
const SettingsComponent = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    darkMode: false,
    autoSave: true,
    twoFactorAuth: false,
    marketingEmails: false,
  });

  const [saving, setSaving] = useState(false);

  const handleSettingChange = (setting: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSaveSettings = () => {
    setSaving(true);
    // Simuler une sauvegarde
    setTimeout(() => {
      setSaving(false);
    }, 1500);
  };

  return (
    <StyledCard>
      <CardHeader title="Paramètres" subheader="Personnalisez votre expérience utilisateur" />
      <CardContent>
        <Stack spacing={4}>
          <Box>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
            >
              <NotificationsIcon color="primary" />
              Préférences de notification
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications}
                  onChange={() => handleSettingChange("notifications")}
                  color="primary"
                />
              }
              label="Notifications push"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailAlerts}
                  onChange={() => handleSettingChange("emailAlerts")}
                  color="primary"
                />
              }
              label="Alertes par email"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.marketingEmails}
                  onChange={() => handleSettingChange("marketingEmails")}
                  color="primary"
                />
              }
              label="Emails marketing"
            />
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
            >
              <PaletteIcon color="primary" />
              Apparence
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.darkMode}
                  onChange={() => handleSettingChange("darkMode")}
                  color="primary"
                />
              }
              label="Mode sombre"
            />
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
            >
              <SecurityIcon color="primary" />
              Sécurité
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.twoFactorAuth}
                  onChange={() => handleSettingChange("twoFactorAuth")}
                  color="primary"
                />
              }
              label="Authentification à deux facteurs"
            />
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
            >
              <SaveIcon color="primary" />
              Préférences générales
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoSave}
                  onChange={() => handleSettingChange("autoSave")}
                  color="primary"
                />
              }
              label="Sauvegarde automatique"
            />
          </Box>

          <Button
            variant="contained"
            sx={{ alignSelf: "flex-start" }}
            onClick={handleSaveSettings}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {saving ? "Sauvegarde en cours..." : "Sauvegarder les préférences"}
          </Button>
        </Stack>
      </CardContent>
    </StyledCard>
  );
};

// ==================== COMPOSANT PRINCIPAL ====================
const ProfilPage = () => {
  const [tabValue, setTabValue] = useState("1");
  const theme = useTheme();

  const handleTabChange = (_event: SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const speedDialActions = [
    { icon: <DownloadIcon />, name: "Télécharger", onClick: () => console.log("Télécharger") },
    { icon: <PrintIcon />, name: "Imprimer", onClick: () => window.print() }, // ✅ PrintIcon utilisé
    { icon: <EmailIcon />, name: "Contacter", onClick: () => console.log("Contacter") },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <Avatar
          sx={{
            bgcolor: theme.palette.primary.main,
            mr: 2,
            width: 48,
            height: 48,
            border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <PersonIcon />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Mon profil
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez vos informations personnelles et préférences
          </Typography>
        </Box>
      </Box>

      <Paper
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="Onglets du profil"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            bgcolor: theme.palette.grey[50],
            borderBottom: `1px solid ${theme.palette.divider}`,
            "& .MuiTab-root": {
              padding: { xs: "12px 16px", md: "16px 24px" },
              margin: { xs: "0 4px", md: "0 8px" },
              minHeight: 60,
              fontSize: { xs: "0.9rem", md: "1rem" },
              minWidth: "auto",
            },
          }}
        >
          <Tab icon={<PersonIcon />} label="Aperçu" value="1" />
          <Tab icon={<BusinessIcon />} label="Informations" value="2" />
          <Tab icon={<DescriptionIcon />} label="Documents" value="3" />
          <Tab icon={<SettingsIcon />} label="Paramètres" value="4" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === "1" && <OverviewComponent />}
          {tabValue === "2" && <InformationsComponent />}
          {tabValue === "3" && <DocumentsComponent />}
          {tabValue === "4" && <SettingsComponent />}
        </Box>
      </Paper>

      <SpeedDial ariaLabel="Actions rapides" sx={{ position: "fixed", bottom: 24, right: 24 }} icon={<SpeedDialIcon />}>
        {speedDialActions.map((action) => (
          <SpeedDialAction key={action.name} icon={action.icon} tooltipTitle={action.name} onClick={action.onClick} />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default ProfilPage;

import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Dialog,
  IconButton,
  TextField,
  MenuItem,
  Checkbox,
  alpha,
  Chip,
  Avatar,
  InputAdornment,
  Paper,
  Divider,
  useTheme,
  Fade,
  Grid,
  Tooltip,
  LinearProgress,
  Badge,
} from "@mui/material";
import { db, storage } from "@/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Send as SendIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon,
  Archive as ArchiveIcon,
  Email as EmailIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { fr } from "date-fns/locale";
import { styled } from "@mui/material/styles";

// -----------------------------------------------------------
// 1. Styled Components
// -----------------------------------------------------------

const Shell = styled(Box)(({ theme }) => ({
  maxWidth: 1440,
  marginInline: "auto",
  padding: theme.spacing(3),
  [theme.breakpoints.up("md")]: { padding: theme.spacing(4) },
  minHeight: "100vh",
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
}));

const ModernCard = styled(Paper)(({ theme }) => ({
  borderRadius: 24,
  boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.08)}`,
  overflow: "hidden",
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 25px 80px ${alpha(theme.palette.common.black, 0.12)}`,
  },
}));

const Header = styled(Box)(({ theme }) => ({
  position: "relative",
  padding: theme.spacing(5, 4, 7),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(
    theme.palette.secondary.main || theme.palette.primary.light,
    0.16
  )} 100%)`,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  textAlign: 'center',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  padding: theme.spacing(1.5, 3),
  borderRadius: 14,
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.95rem',
  letterSpacing: '0.01em',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 14,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    fontSize: '0.95rem',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
    '&.Mui-focused': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}));

const DocumentCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.7)} 0%, ${alpha(theme.palette.background.default, 0.7)} 100%)`,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 15px 40px ${alpha(theme.palette.common.black, 0.1)}`,
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

// -----------------------------------------------------------
// 2. Types et constantes
// -----------------------------------------------------------

type UserRole = "admin" | "secretary" | "client";

const CURRENT_USER_CLIENT = "Client ABC";

type DocumentStatus = "pending" | "approved" | "rejected";

interface Document {
  id: string;
  name: string;
  clientName: string;
  url: string;
  type: string;
  createdAt: Date;
  status: DocumentStatus;
  clientLogo?: string;
  size?: number;
  lastModified?: Date;
}

const clientsList = [
  { name: "Client ABC", logo: "https://i.pravatar.cc/40?img=1" },
  { name: "Client XYZ", logo: "https://i.pravatar.cc/40?img=2" },
  { name: "Client 123", logo: "https://i.pravatar.cc/40?img=3" }
];

const statusColors: Record<DocumentStatus, string> = {
  pending: "#ff9800",
  approved: "#4caf50",
  rejected: "#f44336",
};

const statusIcons: Record<DocumentStatus, React.ReactNode> = {
  pending: <ScheduleIcon fontSize="small" />,
  approved: <CheckCircleIcon fontSize="small" />,
  rejected: <CancelIcon fontSize="small" />,
};

const getFileIcon = (type: string) => {
  if (type.includes("pdf")) return <PictureAsPdfIcon sx={{ color: "#f40f02", fontSize: 28 }} />;
  if (type.includes("image")) return <ImageIcon sx={{ color: "#4caf50", fontSize: 28 }} />;
  if (type.includes("word")) return <DescriptionIcon sx={{ color: "#2196f3", fontSize: 28 }} />;
  return <DescriptionIcon sx={{ color: "#666", fontSize: 28 }} />;
};

const formatFileSize = (bytes: number = 0) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// -----------------------------------------------------------
// 3. Composant principal CourriersPage
// -----------------------------------------------------------

const CourriersPage = () => {
  const theme = useTheme();
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("admin");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  // Filtres
  const [filterClient, setFilterClient] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");

  // Client sélectionné pour upload
  const [selectedClient, setSelectedClient] = useState<string>(CURRENT_USER_CLIENT);

  // Documents sélectionnés pour actions en masse
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  const handleToggleSelectDoc = (docId: string) => {
    setSelectedDocs((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedDocs.length === documents.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(documents.map((doc) => doc.id));
    }
  };

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      // Simulation de données
      const mockData: Document[] = [
        {
          id: "1",
          name: "Contrat de service.pdf",
          clientName: "Client ABC",
          url: "https://example.com/doc1.pdf",
          type: "application/pdf",
          createdAt: new Date("2023-06-15"),
          status: "approved",
          clientLogo: "https://i.pravatar.cc/40?img=1",
          size: 2457600,
          lastModified: new Date("2023-06-15")
        },
        {
          id: "2",
          name: "Facture juin 2023.pdf",
          clientName: "Client XYZ",
          url: "https://example.com/doc2.pdf",
          type: "application/pdf",
          createdAt: new Date("2023-06-20"),
          status: "pending",
          clientLogo: "https://i.pravatar.cc/40?img=2",
          size: 1536000,
          lastModified: new Date("2023-06-20")
        },
        {
          id: "3",
          name: "Photo chantier.jpg",
          clientName: "Client 123",
          url: "https://example.com/doc3.jpg",
          type: "image/jpeg",
          createdAt: new Date("2023-06-25"),
          status: "rejected",
          clientLogo: "https://i.pravatar.cc/40?img=3",
          size: 3670016,
          lastModified: new Date("2023-06-25")
        }
      ];

      let filteredData = mockData;

      // Filtrage par client
      if (filterClient) {
        filteredData = filteredData.filter(doc => doc.clientName === filterClient);
      }

      // Filtrage par statut
      if (filterStatus) {
        filteredData = filteredData.filter(doc => doc.status === filterStatus);
      }

      // Filtrage par dates
      if (filterStartDate || filterEndDate) {
        filteredData = filteredData.filter((d) => {
          const date = d.createdAt;
          if (filterStartDate && date < filterStartDate) return false;
          if (filterEndDate && date > filterEndDate) return false;
          return true;
        });
      }

      // Calcul des statistiques
      const statsData = {
        total: filteredData.length,
        pending: filteredData.filter(d => d.status === 'pending').length,
        approved: filteredData.filter(d => d.status === 'approved').length,
        rejected: filteredData.filter(d => d.status === 'rejected').length,
      };

      setDocuments(filteredData);
      setStats(statsData);
      setSelectedDocs([]);
    } catch (err) {
      console.error("Erreur récupération documents :", err);
    } finally {
      setLoading(false);
    }
  }, [filterClient, filterStartDate, filterEndDate, filterStatus]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFileToUpload(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!fileToUpload) return;
    setUploading(true);
    // Simulation d'upload
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploading(false);
      setFileToUpload(null);
      setUploadProgress(0);
      fetchDocuments();
    }, 2000);
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Confirmer la suppression de ${selectedDocs.length} courriers ?`)) return;
    setDocuments(prev => prev.filter(doc => !selectedDocs.includes(doc.id)));
    setSelectedDocs([]);
  };

  const handleDownloadSelected = () => {
    selectedDocs.forEach((docId) => {
      const docToDownload = documents.find((d) => d.id === docId);
      if (docToDownload) {
        window.open(docToDownload.url, "_blank");
      }
    });
  };

  const handleOpenPreview = (url: string) => setPreviewUrl(url);
  const handleClosePreview = () => setPreviewUrl(null);

  const handleResend = (doc: Document) => {
    alert(`Document "${doc.name}" renvoyé au client ${doc.clientName}.`);
  };

  const handleChangeStatus = async (docId: string, newStatus: DocumentStatus) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, status: newStatus } : doc
    ));
  };

  return (
    <Shell>
      <Fade in timeout={800}>
        <Box>
          <ModernCard>
            <Header>
              <Typography 
                variant="h3" 
                fontWeight={800}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                📨 Gestion des Courriers
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                Gérez et suivez tous vos documents et communications clients en un seul endroit
              </Typography>
            </Header>

            <Box sx={{ p: 4 }}>
              {/* Statistiques */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <Typography variant="h4" fontWeight={800} color="primary.main">
                      {stats.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total des documents
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                    <Typography variant="h4" fontWeight={800} color="warning.main">
                      {stats.pending}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      En attente
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                    <Typography variant="h4" fontWeight={800} color="success.main">
                      {stats.approved}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Approuvés
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                    <Typography variant="h4" fontWeight={800} color="error.main">
                      {stats.rejected}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rejetés
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Actions principales */}
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", md: "center" }}
                spacing={3}
                sx={{ mb: 4 }}
              >
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flex={1}>
                  <ActionButton
                    variant="contained"
                    color="primary"
                    startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                    component="label"
                    disabled={loading}
                  >
                    Nouveau document
                    <input type="file" hidden onChange={handleFileChange} multiple />
                  </ActionButton>
                  
                  <ActionButton
                    variant="outlined"
                    color="secondary"
                    startIcon={<DownloadIcon />}
                    disabled={selectedDocs.length === 0 || loading}
                    onClick={handleDownloadSelected}
                  >
                    Télécharger
                  </ActionButton>

                  <ActionButton
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    disabled={selectedDocs.length === 0 || loading}
                    onClick={handleDeleteSelected}
                  >
                    Supprimer
                  </ActionButton>
                </Stack>

                <IconButton 
                  onClick={fetchDocuments} 
                  disabled={loading}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Stack>

              {/* Upload en cours */}
              {fileToUpload && (
                <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                  <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={600}>
                      📤 Upload en cours
                    </Typography>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          {getFileIcon(fileToUpload.type)}
                          <Box>
                            <Typography variant="body1" fontWeight={600}>
                              {fileToUpload.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatFileSize(fileToUpload.size)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                      
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                        <TextField
                          label="Client"
                          select
                          size="small"
                          value={selectedClient}
                          onChange={(e) => setSelectedClient(e.target.value)}
                          sx={{ minWidth: 150 }}
                        >
                          {clientsList.map((client) => (
                            <MenuItem key={client.name} value={client.name}>
                              {client.name}
                            </MenuItem>
                          ))}
                        </TextField>
                        
                        <ActionButton
                          variant="contained"
                          disabled={uploading}
                          onClick={handleUpload}
                          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                        >
                          {uploading ? `${uploadProgress}%` : "Envoyer"}
                        </ActionButton>
                      </Stack>
                    </Stack>
                    
                    {uploading && (
                      <Box sx={{ width: '100%' }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={uploadProgress} 
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    )}
                  </Stack>
                </Paper>
              )}

              {/* Filtres */}
              <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  <FilterListIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                  Filtres avancés
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <SearchField
                      fullWidth
                      placeholder="Rechercher..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      select
                      label="Client"
                      value={filterClient}
                      onChange={(e) => setFilterClient(e.target.value)}
                    >
                      <MenuItem value="">Tous les clients</MenuItem>
                      {clientsList.map((client) => (
                        <MenuItem key={client.name} value={client.name}>
                          {client.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      select
                      label="Statut"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <MenuItem value="">Tous les statuts</MenuItem>
                      <MenuItem value="pending">En attente</MenuItem>
                      <MenuItem value="approved">Approuvé</MenuItem>
                      <MenuItem value="rejected">Rejeté</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={5}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <DatePicker
                          label="Date de début"
                          value={filterStartDate}
                          onChange={setFilterStartDate}
                          renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                        <DatePicker
                          label="Date de fin"
                          value={filterEndDate}
                          onChange={setFilterEndDate}
                          renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                      </Stack>
                    </LocalizationProvider>
                  </Grid>
                </Grid>
              </Paper>

              {/* Liste des documents */}
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                  <CircularProgress size={60} />
                </Box>
              ) : documents.length === 0 ? (
                <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
                  <ArchiveIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" gutterBottom color="text.secondary">
                    Aucun courrier trouvé
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {filterClient || filterStatus || filterStartDate || filterEndDate 
                      ? "Essayez de modifier vos critères de recherche" 
                      : "Commencez par ajouter votre premier document"}
                  </Typography>
                  <ActionButton
                    variant="contained"
                    component="label"
                    startIcon={<AddIcon />}
                  >
                    Ajouter un document
                    <input type="file" hidden onChange={handleFileChange} />
                  </ActionButton>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {documents.map((doc) => (
                    <Grid item xs={12} key={doc.id}>
                      <DocumentCard>
                        <Stack direction="row" alignItems="center" spacing={3}>
                          <Checkbox
                            color="primary"
                            checked={selectedDocs.includes(doc.id)}
                            onChange={() => handleToggleSelectDoc(doc.id)}
                            sx={{ mr: 1 }}
                          />
                          
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                              {getFileIcon(doc.type)}
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" fontWeight={600} noWrap>
                                  {doc.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatFileSize(doc.size)} • {doc.createdAt.toLocaleDateString('fr-FR')}
                                </Typography>
                              </Box>
                            </Stack>
                            
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Avatar src={doc.clientLogo} sx={{ width: 28, height: 28 }} />
                                <Typography variant="body2" fontWeight={500}>
                                  {doc.clientName}
                                </Typography>
                              </Stack>
                              
                              <Chip
                                icon={statusIcons[doc.status]}
                                label={doc.status === 'pending' ? 'En attente' : doc.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                                size="small"
                                sx={{
                                  backgroundColor: alpha(statusColors[doc.status], 0.1),
                                  color: statusColors[doc.status],
                                  fontWeight: "600",
                                  border: `1px solid ${alpha(statusColors[doc.status], 0.2)}`,
                                }}
                              />
                            </Stack>
                          </Box>

                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Visualiser">
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenPreview(doc.url)}
                                sx={{
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                  }
                                }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Renvoyer au client">
                              <IconButton
                                color="info"
                                onClick={() => handleResend(doc)}
                                sx={{
                                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.info.main, 0.2),
                                  }
                                }}
                              >
                                <SendIcon />
                              </IconButton>
                            </Tooltip>

                            {currentUserRole !== "client" && (
                              <Tooltip title="Supprimer">
                                <IconButton
                                  color="error"
                                  onClick={() => handleDelete(doc.id)}
                                  sx={{
                                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.error.main, 0.2),
                                    }
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </Stack>
                      </DocumentCard>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </ModernCard>

          {/* Preview Modal */}
          <Dialog 
            open={Boolean(previewUrl)} 
            onClose={handleClosePreview} 
            maxWidth="xl" 
            fullWidth
            sx={{
              '& .MuiDialog-paper': {
                borderRadius: 3,
                overflow: 'hidden',
                background: 'transparent',
                boxShadow: 'none',
              }
            }}
          >
            <Box 
              sx={{ 
                position: 'relative', 
                bgcolor: 'background.paper', 
                borderRadius: 3,
                overflow: 'hidden',
                m: 2
              }}
            >
              <IconButton
                onClick={handleClosePreview}
                sx={{ 
                  position: "absolute", 
                  top: 16, 
                  right: 16, 
                  zIndex: 10,
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  '&:hover': {
                    backgroundColor: theme.palette.background.paper,
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
              
              {previewUrl && (
                <Box sx={{ height: '80vh' }}>
                  {previewUrl.endsWith(".pdf") ? (
                    <object
                      data={previewUrl}
                      type="application/pdf"
                      width="100%"
                      height="100%"
                      aria-label="Aperçu PDF"
                    >
                      <Box sx={{ p: 8, textAlign: 'center', bgcolor: 'background.paper' }}>
                        <PictureAsPdfIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 3, opacity: 0.5 }} />
                        <Typography variant="h6" gutterBottom color="text.secondary">
                          Impossible d'afficher le PDF
                        </Typography>
                        <ActionButton 
                          variant="contained" 
                          href={previewUrl} 
                          download
                          startIcon={<DownloadIcon />}
                          sx={{ mt: 2 }}
                        >
                          Télécharger le document
                        </ActionButton>
                      </Box>
                    </object>
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Aperçu du document"
                      style={{ 
                        width: "100%", 
                        height: "100%", 
                        objectFit: "contain",
                        background: '#f5f5f5'
                      }}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Dialog>
        </Box>
      </Fade>
    </Shell>
  );
};

export default CourriersPage;
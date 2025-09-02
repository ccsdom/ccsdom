import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  InputAdornment,
  Alert,
  Snackbar,
  Chip,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Paper,
  alpha,
  useTheme,
  styled
} from "@mui/material";
import {
  Visibility,
  Download,
  UploadFile,
  ReceiptLong,
  Description,
  CloudUpload,
  CheckCircle,
  Pending,
  Error as ErrorIcon,
  FilterList,
  Search,
  Refresh,
  Add,
  Close,
  Upload,
  Article
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

// ===================== Types =====================
interface DocumentItem {
  id: string;
  type: string;
  fileName: string;
  uploadDate: string;
  status: "validé" | "en attente" | "refusé";
  url: string;
  size?: string;
  progress?: number;
}

interface UploadStatus {
  [key: string]: "idle" | "uploading" | "success" | "error";
}

interface UploadTask {
  id: string;
  file: File;
  type: string;
  progress: number;
  isContract?: boolean;
}

type PaletteColorKey = "primary" | "secondary" | "success" | "warning" | "error" | "info";

// ===================== Styled Components =====================
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

const DropZone = styled(Box)(({ theme }) => ({
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.4)}`,
  borderRadius: 12,
  padding: theme.spacing(4),
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    borderColor: theme.palette.primary.main,
  },
}));

// Nouveau style pour les lignes du tableau
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  height: 64, // Augmentation de la hauteur des lignes
  '&:nth-of-type(odd)': {
    backgroundColor: alpha(theme.palette.primary.main, 0.02), // Ligne impaire avec fond très léger
  },
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.common.white, // Ligne paire sans fond
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04), // Effet au survol
  },
}));

// Style pour les cellules du tableau
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(2), // Plus d'espace dans les cellules
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`, // Ligne de séparation plus subtile
}));

// Style pour l'en-tête du tableau
const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(2),
  fontWeight: "bold",
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  fontSize: '0.875rem',
  color: theme.palette.primary.main,
}));

// ===================== Mock Data =====================
const mockDocuments: DocumentItem[] = [
  { id: "1", type: "CNI", fileName: "carte_identite.pdf", uploadDate: "2025-07-10", status: "validé", url: "/mock_docs/cni.pdf", size: "2.4 MB" },
  { id: "2", type: "Kbis", fileName: "extrait_kbis.pdf", uploadDate: "2025-06-15", status: "en attente", url: "/mock_docs/kbis.pdf", size: "1.8 MB" },
  { id: "3", type: "Justificatif", fileName: "justificatif_domicile.pdf", uploadDate: "2025-06-01", status: "refusé", url: "/mock_docs/justificatif.pdf", size: "3.2 MB" },
  { id: "4", type: "RIB", fileName: "rib_bancaire.pdf", uploadDate: "2025-07-12", status: "validé", url: "/mock_docs/rib.pdf", size: "1.1 MB" },
  { id: "5", type: "Contrat", fileName: "contrat_signé.pdf", uploadDate: "2025-07-11", status: "en attente", url: "/mock_docs/contrat.pdf", size: "4.5 MB" },
  { id: "6", type: "Avis d'imposition", fileName: "avis_imposition_2024.pdf", uploadDate: "2025-07-15", status: "validé", url: "/mock_docs/avis.pdf", size: "1.9 MB" },
  { id: "7", type: "Facture", fileName: "facture_edf.pdf", uploadDate: "2025-07-14", status: "refusé", url: "/mock_docs/facture.pdf", size: "0.8 MB" },
];

const documentTypes = ["CNI", "Kbis", "Justificatif", "RIB", "Contrat", "Autre"];

const mockContractUrl = "/mock_docs/contrat_domiciliation.pdf";

// ===================== Component =====================
const DocumentsPage: React.FC = () => {
  const theme = useTheme();
  const [documents, setDocuments] = useState<DocumentItem[]>(mockDocuments);
  const [contractUrl, setContractUrl] = useState<string | undefined>(mockContractUrl);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({});
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" | "info" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const getMain = (key: PaletteColorKey) => theme.palette[key].main;

  // Filtrer & rechercher
  const filteredDocs = useMemo(() => {
    let filtered = documents;

    if (filterType !== "all") {
      filtered = filtered.filter((doc) => doc.type === filterType);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((doc) => 
        doc.fileName.toLowerCase().includes(q) || 
        doc.type.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [documents, filterType, searchQuery]);

  // Pagination
  const displayedDocs = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredDocs.slice(start, start + rowsPerPage);
  }, [filteredDocs, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const showSnackbar = (message: string, severity: "success" | "error" | "info" = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Gestion du drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => 
      file.type.includes('pdf') || 
      file.type.includes('image')
    );
    
    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      showSnackbar(`${validFiles.length} fichier(s) prêt(s) à être uploadé(s)`, "info");
    } else {
      showSnackbar("Veuillez déposer uniquement des PDF ou images", "error");
    }
  };

  // Upload simulé avec plusieurs fichiers
  const simulateUpload = useCallback((file: File, id: string, type: string, isContract = false) => {
    setUploadStatus((prev) => ({ ...prev, [id]: "uploading" }));
    
    // Ajouter la tâche à la liste des uploads en cours
    setUploadTasks(prev => [...prev, { id, file, type, progress: 0, isContract }]);
    
    const interval = setInterval(() => {
      setUploadTasks(prev => 
        prev.map(task => 
          task.id === id 
            ? { ...task, progress: Math.min(task.progress + 10, 100) }
            : task
        )
      );
      
      setUploadTasks(prev => {
        const task = prev.find(t => t.id === id);
        if (task && task.progress >= 100) {
          clearInterval(interval);
          
          setUploadStatus((s) => ({ ...s, [id]: "success" }));
          
          setTimeout(() => {
            // Retirer la tâche terminée
            setUploadTasks(prev => prev.filter(t => t.id !== id));
            setUploadStatus((s) => ({ ...s, [id]: "idle" }));
          }, 2000);
          
          if (isContract) {
            setContractUrl(URL.createObjectURL(file));
            showSnackbar("Contrat mis à jour avec succès");
          } else {
            setDocuments((docs) =>
              docs.map((doc) =>
                doc.id === id
                  ? {
                      ...doc,
                      fileName: file.name,
                      uploadDate: new Date().toISOString().slice(0, 10),
                      url: URL.createObjectURL(file),
                      status: "en attente",
                      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                    }
                  : doc
              )
            );
            showSnackbar("Document mis à jour avec succès");
          }
        }
        return prev;
      });
    }, 200);
  }, []);

  const handleFileUpload = (file: File, id: string, type: string, isContract = false) => {
    simulateUpload(file, id, type, isContract);
  };

  const handleNewDocumentUpload = () => {
    if (selectedFiles.length > 0 && selectedDocumentType) {
      selectedFiles.forEach((file) => {
        const newId = `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        handleFileUpload(file, newId, selectedDocumentType);
        
        // Ajouter le nouveau document à la liste pour qu'il apparaisse immédiatement
        setDocuments((docs) => [
          {
            id: newId,
            type: selectedDocumentType,
            fileName: file.name,
            uploadDate: new Date().toISOString().slice(0, 10),
            status: "en attente",
            url: URL.createObjectURL(file),
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          },
          ...docs,
        ]);
      });
      
      setUploadDialogOpen(false);
      setSelectedFiles([]);
      setSelectedDocumentType("");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => 
        file.type.includes('pdf') || 
        file.type.includes('image')
      );
      
      setSelectedFiles(validFiles);
      
      if (validFiles.length !== files.length) {
        showSnackbar("Certains fichiers non valides ont été ignorés", "warning");
      }
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusIcon = (status: DocumentItem["status"]) => {
    switch (status) {
      case "validé":
        return <CheckCircle color="success" />;
      case "en attente":
        return <Pending color="warning" />;
      case "refusé":
        return <ErrorIcon color="error" />;
      default:
        return <Description color="action" />;
    }
  };

  const getStatusColor = (status: DocumentItem["status"]) => {
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

  const stats = {
    total: documents.length,
    validated: documents.filter((d) => d.status === "validé").length,
    pending: documents.filter((d) => d.status === "en attente").length,
    rejected: documents.filter((d) => d.status === "refusé").length,
  };

  const statCards: { label: string; value: number; color: PaletteColorKey; Icon: React.ElementType }[] = [
    { label: "Total", value: stats.total, color: "primary", Icon: Description },
    { label: "Validés", value: stats.validated, color: "success", Icon: CheckCircle },
    { label: "En attente", value: stats.pending, color: "warning", Icon: Pending },
    { label: "Refusés", value: stats.rejected, color: "error", Icon: ErrorIcon },
  ];

  // Effet pour fermer automatiquement le dialog après upload réussi
  useEffect(() => {
    if (uploadTasks.length === 0 && selectedFiles.length > 0) {
      setSelectedFiles([]);
    }
  }, [uploadTasks, selectedFiles.length]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: "text",
              textFillColor: "transparent",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1
            }}
          >
            Mes documents
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gérez tous vos documents en un seul endroit
          </Typography>
        </Box>

        <Tooltip title="Actualiser">
          <IconButton 
            sx={{ 
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              }
            }} 
            onClick={() => window.location.reload()}
          >
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Uploads en cours */}
      {uploadTasks.length > 0 && (
        <StyledCard sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Téléchargements en cours ({uploadTasks.length})
            </Typography>
            <Box>
              {uploadTasks.map((task) => (
                <Box key={task.id} sx={{ mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" noWrap sx={{ maxWidth: '70%' }}>
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
                    sx={{ borderRadius: 2, height: 6 }}
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </StyledCard>
      )}

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <StyledCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h3" fontWeight={700} sx={{ color: getMain(stat.color) }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        bgcolor: alpha(getMain(stat.color), 0.1),
                        color: getMain(stat.color),
                      }}
                    >
                      <stat.Icon />
                    </Avatar>
                  </Box>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Filtres & recherche */}
      <StyledCard sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <FilterList fontSize="small" />
                  Type
                </Box>
              </InputLabel>
              <Select 
                value={filterType} 
                label="Type" 
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="all">Tous les types</MenuItem>
                {documentTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Rechercher un document..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250, flexGrow: 1 }}
            />

            <GradientButton
              startIcon={<Add />}
              onClick={() => setUploadDialogOpen(true)}
            >
              Nouveau document
            </GradientButton>
          </Box>
        </CardContent>
      </StyledCard>

      {/* Tableau documents */}
      <StyledCard>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableHeadCell>Type</StyledTableHeadCell>
                  <StyledTableHeadCell>Nom du fichier</StyledTableHeadCell>
                  <StyledTableHeadCell>Taille</StyledTableHeadCell>
                  <StyledTableHeadCell>Date d'upload</StyledTableHeadCell>
                  <StyledTableHeadCell>Statut</StyledTableHeadCell>
                  <StyledTableHeadCell align="center">Actions</StyledTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {displayedDocs.map((doc, index) => {
                    const colorKey = getStatusColor(doc.status);
                    const chipBg =
                      colorKey !== "default"
                        ? alpha(getMain(colorKey as PaletteColorKey), 0.1)
                        : undefined;

                    return (
                      <StyledTableRow 
                        key={doc.id} 
                        component={motion.tr}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <StyledTableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getStatusIcon(doc.status)}
                            {doc.type}
                          </Box>
                        </StyledTableCell>
                        <StyledTableCell>
                          <Tooltip title={doc.fileName} placement="top-start">
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {doc.fileName}
                            </Typography>
                          </Tooltip>
                        </StyledTableCell>
                        <StyledTableCell>
                          <Typography variant="body2" color="text.secondary">
                            {doc.size}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell>{doc.uploadDate}</StyledTableCell>
                        <StyledTableCell>
                          <Chip
                            label={doc.status}
                            color={colorKey as any}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontWeight: 600,
                              ...(chipBg ? { backgroundColor: chipBg } : {}),
                            }}
                          />
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <Box display="flex" gap={1} justifyContent="center">
                            <Tooltip title="Visualiser">
                              <IconButton 
                                onClick={() => window.open(doc.url, "_blank")} 
                                color="primary" 
                                size="small"
                                sx={{ 
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  "&:hover": {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                  }
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Télécharger">
                              <IconButton 
                                component="a" 
                                href={doc.url} 
                                download 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                color="primary" 
                                size="small"
                                sx={{ 
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  "&:hover": {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                  }
                                }}
                              >
                                <Download fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remplacer">
                              <IconButton 
                                component="label" 
                                color="secondary" 
                                size="small" 
                                disabled={uploadStatus[doc.id] === "uploading"}
                                sx={{ 
                                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                  "&:hover": {
                                    backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                                  }
                                }}
                              >
                                <UploadFile fontSize="small" />
                                <input
                                  type="file"
                                  hidden
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleFileUpload(e.target.files[0], doc.id, doc.type);
                                    }
                                  }}
                                  accept="application/pdf,image/*"
                                />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          {uploadStatus[doc.id] === "uploading" && (
                            <LinearProgress 
                              variant="determinate" 
                              value={uploadTasks.find(t => t.id === doc.id)?.progress || 0} 
                              sx={{ mt: 1, borderRadius: 2, height: 4 }} 
                            />
                          )}
                        </StyledTableCell>
                      </StyledTableRow>
                    );
                  })}
                </AnimatePresence>

                {displayedDocs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Description sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                      <Typography variant="h6" color="text.secondary">
                        Aucun document trouvé
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery || filterType !== "all" 
                          ? "Essayez de modifier vos filtres de recherche" 
                          : "Commencez par uploader votre premier document"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredDocs.length > 0 && (
            <TablePagination
              component="div"
              count={filteredDocs.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
              rowsPerPageOptions={[5, 10, 25]}
              sx={{ borderTop: `1px solid ${theme.palette.divider}`, mt: 2, px: 3 }}
            />
          )}
        </CardContent>
      </StyledCard>

      {/* Section contrat */}
      <StyledCard sx={{ mt: 4 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <ReceiptLong color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Contrat de domiciliation
              </Typography>
            </Box>

            {contractUrl && (
              <Box display="flex" gap={1}>
                <Tooltip title="Visualiser le contrat">
                  <IconButton 
                    onClick={() => window.open(contractUrl, "_blank")} 
                    color="primary"
                    sx={{ 
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      }
                    }}
                  >
                    <Visibility />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Télécharger le contrat">
                  <IconButton 
                    component="a" 
                    href={contractUrl} 
                    download 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    color="primary"
                    sx={{ 
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      }
                    }}
                  >
                    <Download />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>

          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUpload />}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1,
                color: "white",
              }}
            >
              {contractUrl ? "Remplacer le contrat" : "Télécharger un contrat"}
              <input
                type="file"
                hidden
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0], "contract", "Contrat", true);
                  }
                }}
                accept="application/pdf"
              />
            </Button>

            {uploadStatus["contract"] === "uploading" && (
              <Box flexGrow={1} minWidth={200}>
                <LinearProgress 
                  variant="determinate" 
                  value={uploadTasks.find(t => t.id === "contract")?.progress || 0} 
                  sx={{ borderRadius: 2, height: 6 }} 
                />
              </Box>
            )}
          </Box>
        </CardContent>
      </StyledCard>

      {/* Upload Dialog */}
      <Dialog 
        open={uploadDialogOpen} 
        onClose={() => {
          setUploadDialogOpen(false);
          setSelectedFiles([]);
        }} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CloudUpload color="primary" />
            <Typography variant="h6">Uploader un nouveau document</Typography>
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
              {documentTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <DropZone
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
              mt: 3,
              borderColor: dragOver ? theme.palette.primary.main : undefined,
              backgroundColor: dragOver ? alpha(theme.palette.primary.main, 0.08) : undefined,
            }}
          >
            <CloudUpload color="primary" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Glissez-déposez vos fichiers ici
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              ou
            </Typography>
            <Button 
              component="label" 
              variant="outlined" 
              startIcon={<Upload />}
              sx={{ mt: 1 }}
            >
              Parcourir les fichiers
              <input
                type="file"
                hidden
                multiple
                onChange={handleFileSelect}
                accept="application/pdf,image/*"
              />
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
              Formats supportés: PDF, JPG, PNG (max 10MB par fichier)
            </Typography>
          </DropZone>

          {selectedFiles.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Fichiers sélectionnés ({selectedFiles.length}):
              </Typography>
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {selectedFiles.map((file, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      p: 1, 
                      mb: 1, 
                      borderRadius: 1,
                      backgroundColor: 'action.hover'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Article color="action" />
                      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                        {file.name}
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={() => removeSelectedFile(index)}
                      color="error"
                    >
                      <Close />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => {
              setUploadDialogOpen(false);
              setSelectedFiles([]);
            }}
          >
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={handleNewDocumentUpload} 
            disabled={selectedFiles.length === 0 || !selectedDocumentType}
            startIcon={<CloudUpload />}
          >
            Uploader {selectedFiles.length > 1 ? `(${selectedFiles.length})` : ''}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar} 
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled" 
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentsPage;
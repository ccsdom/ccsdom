import React, { useState, useMemo } from "react";
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
  Paper,
  Button,
  Tooltip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
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
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
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

type PaletteColorKey = "primary" | "secondary" | "success" | "warning" | "error" | "info";

// ===================== Mock Data =====================
const mockDocuments: DocumentItem[] = [
  { id: "1", type: "CNI", fileName: "carte_identite.pdf", uploadDate: "2025-07-10", status: "validé", url: "/mock_docs/cni.pdf", size: "2.4 MB" },
  { id: "2", type: "Kbis", fileName: "extrait_kbis.pdf", uploadDate: "2025-06-15", status: "en attente", url: "/mock_docs/kbis.pdf", size: "1.8 MB" },
  { id: "3", type: "Justificatif", fileName: "justificatif_domicile.pdf", uploadDate: "2025-06-01", status: "refusé", url: "/mock_docs/justificatif.pdf", size: "3.2 MB" },
  { id: "4", type: "RIB", fileName: "rib_bancaire.pdf", uploadDate: "2025-07-12", status: "validé", url: "/mock_docs/rib.pdf", size: "1.1 MB" },
  { id: "5", type: "Contrat", fileName: "contrat_signé.pdf", uploadDate: "2025-07-11", status: "en attente", url: "/mock_docs/contrat.pdf", size: "4.5 MB" },
];

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
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("");
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
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
      filtered = filtered.filter((doc) => doc.fileName.toLowerCase().includes(q) || doc.type.toLowerCase().includes(q));
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

  const showSnackbar = (message: string, severity: "success" | "error" = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Upload simulé
  const simulateUpload = (file: File, id: string, isContract = false) => {
    setUploadStatus((prev) => ({ ...prev, [id]: "uploading" }));
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus((s) => ({ ...s, [id]: "success" }));

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

          // Réinitialiser le statut après un délai
          setTimeout(() => {
            setUploadStatus((s) => ({ ...s, [id]: "idle" }));
          }, 2000);

          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleFileUpload = (file: File, id: string, isContract = false) => {
    setUploadDialogOpen(false);
    setSelectedFile(null);
    setSelectedDocumentType("");
    simulateUpload(file, id, isContract);
  };

  const handleNewDocumentUpload = () => {
    if (selectedFile && selectedDocumentType) {
      const newId = `new-${Date.now()}`;
      handleFileUpload(selectedFile, newId);
      // On ajoute le nouveau document à la liste pour qu'il apparaisse immédiatement
      setDocuments((docs) => [
        {
          id: newId,
          type: selectedDocumentType,
          fileName: selectedFile.name,
          uploadDate: new Date().toISOString().slice(0, 10),
          status: "en attente",
          url: URL.createObjectURL(selectedFile),
          size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        },
        ...docs,
      ]);
    }
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
            }}
          >
            Mes documents
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Gérez tous vos documents en un seul endroit
          </Typography>
        </Box>

        <IconButton sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }} onClick={() => window.location.reload()}>
          <Refresh />
        </IconButton>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 12px 48px ${alpha(theme.palette.common.black, 0.12)}`,
                  },
                }}
              >
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
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Filtres & recherche */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
        }}
      >
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <FilterList fontSize="small" />
                  Type
                </Box>
              </InputLabel>
              <Select value={filterType} label="Type" onChange={(e) => setFilterType(e.target.value)}>
                <MenuItem value="all">Tous les types</MenuItem>
                <MenuItem value="CNI">CNI</MenuItem>
                <MenuItem value="Kbis">Kbis</MenuItem>
                <MenuItem value="Justificatif">Justificatif</MenuItem>
                <MenuItem value="RIB">RIB</MenuItem>
                <MenuItem value="Contrat">Contrat</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Rechercher un document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />

            <Box flexGrow={1} />

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setUploadDialogOpen(true)}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1,
              }}
            >
              Nouveau document
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tableau documents */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
        }}
      >
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Type</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Nom du fichier</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Taille</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Date d'upload</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Statut</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {displayedDocs.map((doc) => {
                    const colorKey = getStatusColor(doc.status);
                    const chipBg =
                      colorKey !== "default"
                        ? alpha(getMain(colorKey as PaletteColorKey), 0.1)
                        : undefined;

                    return (
                      <motion.tr key={doc.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                        <TableRow hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              {getStatusIcon(doc.status)}
                              {doc.type}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {doc.fileName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {doc.size}
                            </Typography>
                          </TableCell>
                          <TableCell>{doc.uploadDate}</TableCell>
                          <TableCell>
                            <Chip
                              label={doc.status}
                              color={colorKey as any} // Chip accepte 'default' | palette keys
                              size="small"
                              variant="outlined"
                              sx={{
                                fontWeight: 600,
                                ...(chipBg ? { backgroundColor: chipBg } : {}),
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box display="flex" gap={1} justifyContent="center">
                              <Tooltip title="Visualiser">
                                <IconButton onClick={() => window.open(doc.url, "_blank")} color="primary" size="small">
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Télécharger">
                                <IconButton component="a" href={doc.url} download target="_blank" rel="noopener noreferrer" color="primary" size="small">
                                  <Download />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Remplacer">
                                <IconButton component="label" color="secondary" size="small" disabled={uploadStatus[doc.id] === "uploading"}>
                                  <UploadFile />
                                  <input
                                    type="file"
                                    hidden
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) {
                                        handleFileUpload(e.target.files[0], doc.id);
                                      }
                                    }}
                                    accept="application/pdf,image/*"
                                  />
                                </IconButton>
                              </Tooltip>
                            </Box>
                            {uploadStatus[doc.id] === "uploading" && (
                              <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 1, borderRadius: 2 }} />
                            )}
                          </TableCell>
                        </TableRow>
                      </motion.tr>
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
                        {searchQuery || filterType !== "all" ? "Essayez de modifier vos filtres de recherche" : "Commencez par uploader votre premier document"}
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
              sx={{ borderTop: `1px solid ${theme.palette.divider}`, mt: 2 }}
            />
          )}
        </CardContent>
      </Card>

      {/* Section contrat */}
      <Card
        sx={{
          mt: 4,
          borderRadius: 3,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
        }}
      >
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
                  <IconButton onClick={() => window.open(contractUrl, "_blank")} color="primary">
                    <Visibility />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Télécharger le contrat">
                  <IconButton component="a" href={contractUrl} download target="_blank" rel="noopener noreferrer" color="primary">
                    <Download />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
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
              }}
            >
              {contractUrl ? "Remplacer le contrat" : "Télécharger un contrat"}
              <input
                type="file"
                hidden
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0], "contract", true);
                  }
                }}
                accept="application/pdf"
              />
            </Button>

            {uploadStatus["contract"] === "uploading" && (
              <Box flexGrow={1}>
                <LinearProgress variant="determinate" value={uploadProgress} sx={{ borderRadius: 2 }} />
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CloudUpload color="primary" />
            Uploader un nouveau document
          </Box>
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Type de document</InputLabel>
            <Select value={selectedDocumentType} label="Type de document" onChange={(e) => setSelectedDocumentType(e.target.value)}>
              <MenuItem value="CNI">CNI</MenuItem>
              <MenuItem value="Kbis">Kbis</MenuItem>
              <MenuItem value="Justificatif">Justificatif</MenuItem>
              <MenuItem value="RIB">RIB</MenuItem>
              <MenuItem value="Contrat">Contrat</MenuItem>
              <MenuItem value="Autre">Autre</MenuItem>
            </Select>
          </FormControl>

          <Button component="label" variant="outlined" fullWidth sx={{ mt: 2 }} startIcon={<UploadFile />}>
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
          <Button variant="contained" onClick={handleNewDocumentUpload} disabled={!selectedFile || !selectedDocumentType}>
            Uploader
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentsPage;

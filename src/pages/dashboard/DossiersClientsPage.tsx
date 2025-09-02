import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Button,
  Stack,
  CircularProgress,
  Dialog,
  IconButton,
  Chip,
  Alert,
  alpha,
  useTheme,
  Paper,
  Grid,
  Avatar,
  LinearProgress,
  Tooltip,
  Menu,
  MenuItem,
  Snackbar,
  styled,
} from "@mui/material";
import {
  Close,
  Visibility,
  Delete,
  Download,
  PictureAsPdf,
  Image,
  Description,
  MoreVert,
  Refresh,
  FolderOpen,
  Search,
  FilterList,
} from "@mui/icons-material";
import ClientAutocomplete from "@/components/ClientAutocomplete";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/firebase";
import {
  collection,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";

// Styled Components
const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  fontSize: '0.875rem',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
  '&:last-child td': {
    borderBottom: 0,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  padding: theme.spacing(0.5, 1),
  fontSize: '0.75rem',
  borderRadius: 8,
}));

interface Client {
  id: string;
  name: string;
  siren: string;
  logo?: string;
}

interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  createdAt: Date;
  status: "pending" | "approved" | "rejected";
  size?: number;
}

const DossiersClientsPage = () => {
  const theme = useTheme();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const fetchClientDocuments = async (clientId: string) => {
    setLoadingDocs(true);
    try {
      const q = query(
        collection(db, "documents"),
        where("clientId", "==", clientId),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const docsData: Document[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          url: data.url,
          type: data.type,
          createdAt: data.createdAt.toDate(),
          status: data.status,
          size: data.size,
        };
      });

      setDocuments(docsData);
    } catch (error) {
      console.error("Erreur chargement documents client:", error);
      setSnackbar({ open: true, message: "Erreur lors du chargement des documents", severity: "error" });
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (selectedClient) {
      fetchClientDocuments(selectedClient.id);
      setPage(0);
    } else {
      setDocuments([]);
    }
  }, [selectedClient]);

  const handleDeleteDocument = async (docId: string, url: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.")) return;
    
    try {
      await deleteObject(ref(storage, url));
      await deleteDoc(doc(db, "documents", docId));
      if (selectedClient) fetchClientDocuments(selectedClient.id);
      setSnackbar({ open: true, message: "Document supprimé avec succès", severity: "success" });
    } catch (error) {
      console.error("Erreur suppression document:", error);
      setSnackbar({ open: true, message: "Erreur lors de la suppression", severity: "error" });
    }
  };

  const handleOpenPreview = (url: string) => setPreviewUrl(url);
  const handleClosePreview = () => setPreviewUrl(null);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return "N/A";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  const getStatusColor = (status: Document["status"]) => {
    switch (status) {
      case "approved": return "success";
      case "pending": return "warning";
      case "rejected": return "error";
      default: return "default";
    }
  };

  const getStatusText = (status: Document["status"]) => {
    switch (status) {
      case "approved": return "Approuvé";
      case "pending": return "En attente";
      case "rejected": return "Rejeté";
      default: return status;
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <PictureAsPdf sx={{ color: "#f40f02" }} />;
    if (type.includes("image")) return <Image sx={{ color: "#4caf50" }} />;
    return <Description sx={{ color: "#2196f3" }} />;
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedDocs = filteredDocs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, minHeight: "100vh", maxWidth: 1400, mx: "auto" }}>
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
          📁 Dossiers Clients
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Gestion centralisée des documents clients
        </Typography>
      </Box>

      <GradientCard sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="600" gutterBottom>
          Sélection du Client
        </Typography>
        <ClientAutocomplete onClientSelected={setSelectedClient} />
      </GradientCard>

      {selectedClient && (
        <Box>
          {/* Header avec infos client et filtres */}
          <GradientCard sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  src={selectedClient.logo} 
                  sx={{ width: 60, height: 60, bgcolor: theme.palette.primary.main }}
                >
                  {selectedClient.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="600">
                    {selectedClient.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    SIREN: {selectedClient.siren}
                  </Typography>
                  <Chip 
                    label={`${documents.length} document${documents.length !== 1 ? 's' : ''}`} 
                    size="small" 
                    variant="outlined" 
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Tooltip title="Actualiser">
                  <IconButton onClick={() => fetchClientDocuments(selectedClient.id)}>
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </GradientCard>

          {/* Filtres et recherche */}
          <GradientCard sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2, px: 2, py: 1 }}>
                <Search sx={{ color: 'text.secondary', mr: 1 }} />
                <input
                  placeholder="Rechercher un document..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    color: theme.palette.text.primary,
                    fontSize: '0.875rem',
                    minWidth: 200
                  }}
                />
              </Box>

              <Tooltip title="Filtrer par statut">
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                  sx={{ borderRadius: 2 }}
                >
                  Statut: {statusFilter === "all" ? "Tous" : getStatusText(statusFilter as any)}
                </Button>
              </Tooltip>
              <Menu
                anchorEl={filterMenuAnchor}
                open={Boolean(filterMenuAnchor)}
                onClose={() => setFilterMenuAnchor(null)}
              >
                <MenuItem onClick={() => { setStatusFilter("all"); setFilterMenuAnchor(null); }}>
                  Tous les statuts
                </MenuItem>
                <MenuItem onClick={() => { setStatusFilter("pending"); setFilterMenuAnchor(null); }}>
                  En attente
                </MenuItem>
                <MenuItem onClick={() => { setStatusFilter("approved"); setFilterMenuAnchor(null); }}>
                  Approuvé
                </MenuItem>
                <MenuItem onClick={() => { setStatusFilter("rejected"); setFilterMenuAnchor(null); }}>
                  Rejeté
                </MenuItem>
              </Menu>
            </Box>
          </GradientCard>

          {loadingDocs ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2 }}>Chargement des documents...</Typography>
            </Box>
          ) : filteredDocs.length === 0 ? (
            <Paper sx={{ textAlign: 'center', py: 8, borderRadius: 3 }}>
              <FolderOpen sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {searchTerm || statusFilter !== "all" ? "Aucun document trouvé" : "Aucun document"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || statusFilter !== "all" 
                  ? "Essayez de modifier vos critères de recherche" 
                  : "Ce client n'a encore aucun document"}
              </Typography>
            </Paper>
          ) : (
            <GradientCard>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Document</StyledTableCell>
                    <StyledTableCell>Type</StyledTableCell>
                    <StyledTableCell>Taille</StyledTableCell>
                    <StyledTableCell>Date</StyledTableCell>
                    <StyledTableCell>Statut</StyledTableCell>
                    <StyledTableCell align="center">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedDocs.map((doc) => (
                    <StyledTableRow key={doc.id} hover>
                      <StyledTableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {getFileIcon(doc.type)}
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {doc.name}
                          </Typography>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Chip label={doc.type} size="small" variant="outlined" />
                      </StyledTableCell>
                      <StyledTableCell>{formatFileSize(doc.size)}</StyledTableCell>
                      <StyledTableCell>
                        {doc.createdAt.toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </StyledTableCell>
                      <StyledTableCell>
                        <Chip
                          label={getStatusText(doc.status)}
                          color={getStatusColor(doc.status)}
                          size="small"
                          variant="filled"
                        />
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Visualiser">
                            <ActionButton
                              variant="outlined"
                              color="primary"
                              onClick={() => handleOpenPreview(doc.url)}
                            >
                              <Visibility fontSize="small" />
                            </ActionButton>
                          </Tooltip>
                          <Tooltip title="Télécharger">
                            <ActionButton
                              variant="outlined"
                              color="secondary"
                              component="a"
                              href={doc.url}
                              download
                            >
                              <Download fontSize="small" />
                            </ActionButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <ActionButton
                              variant="outlined"
                              color="error"
                              onClick={() => handleDeleteDocument(doc.id, doc.url)}
                            >
                              <Delete fontSize="small" />
                            </ActionButton>
                          </Tooltip>
                        </Stack>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredDocs.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Documents par page:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}–${to} sur ${count !== -1 ? count : `plus de ${to}`}`
                }
                sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}
              />
            </GradientCard>
          )}

          {/* Preview modal */}
          <Dialog 
            open={Boolean(previewUrl)} 
            onClose={handleClosePreview} 
            maxWidth="lg" 
            fullWidth
            sx={{
              '& .MuiDialog-paper': {
                borderRadius: 3,
                overflow: 'hidden',
              }
            }}
          >
            <Box position="relative">
              <IconButton
                onClick={handleClosePreview}
                sx={{ 
                  position: "absolute", 
                  top: 8, 
                  right: 8, 
                  zIndex: 10,
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  '&:hover': {
                    backgroundColor: theme.palette.background.paper,
                  }
                }}
              >
                <Close />
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
                      <Alert severity="info" sx={{ m: 2 }}>
                        Impossible d'afficher le PDF. <a href={previewUrl} download>Télécharger le document</a>
                      </Alert>
                    </object>
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Aperçu du document"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Dialog>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          variant="filled"
          sx={{ borderRadius: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DossiersClientsPage;
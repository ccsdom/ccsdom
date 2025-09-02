import React, { useState, useMemo, useCallback } from "react";
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
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  useTheme
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  UploadFile as UploadFileIcon,
  Refresh as RefreshIcon,
  Description as DescriptionIcon
} from "@mui/icons-material";

interface Document {
  id: string;
  type: string;
  fileName: string;
  uploadDate: string;
  status: "validé" | "en attente" | "refusé";
  url: string;
  fileSize?: string;
}

interface UploadStatus {
  [key: string]: "idle" | "uploading" | "success" | "error";
}

const DOCUMENT_TYPES = ["CNI", "Kbis", "Justificatif", "Contrat"] as const;

const mockDocuments: Document[] = [
  {
    id: "1",
    type: "CNI",
    fileName: "carte_identite.pdf",
    uploadDate: "2025-07-10",
    status: "validé",
    url: "/mock_docs/cni.pdf",
    fileSize: "2.4 MB"
  },
  {
    id: "2",
    type: "Kbis",
    fileName: "extrait_kbis.pdf",
    uploadDate: "2025-06-15",
    status: "en attente",
    url: "/mock_docs/kbis.pdf",
    fileSize: "1.8 MB"
  },
  {
    id: "3",
    type: "Justificatif",
    fileName: "justificatif_domicile.pdf",
    uploadDate: "2025-06-01",
    status: "refusé",
    url: "/mock_docs/justificatif.pdf",
    fileSize: "3.2 MB"
  },
];

const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [contractUrl, setContractUrl] = useState<string | undefined>("/mock_docs/contrat_domiciliation.pdf");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterType, setFilterType] = useState<string>("all");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [previewDialog, setPreviewDialog] = useState<{ open: boolean; url: string; title: string }>({
    open: false,
    url: '',
    title: ''
  });
  const theme = useTheme();

  // Filtrer documents selon type sélectionné
  const filteredDocs = useMemo(() => {
    if (filterType === "all") return documents;
    return documents.filter((doc) => doc.type === filterType);
  }, [documents, filterType]);

  // Pagination documents affichés
  const displayedDocs = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredDocs.slice(start, start + rowsPerPage);
  }, [filteredDocs, page, rowsPerPage]);

  const handleChangePage = (e: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const showSnackbar = useCallback((message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handlePreview = useCallback((url: string, title: string) => {
    setPreviewDialog({ open: true, url, title });
  }, []);

  const handleClosePreview = () => {
    setPreviewDialog({ open: false, url: '', title: '' });
  };

  // Simuler un upload avec délai
  const simulateUpload = useCallback((id: string, file: File, callback: () => void) => {
    setUploadStatus(prev => ({ ...prev, [id]: 'uploading' }));
    
    setTimeout(() => {
      setUploadStatus(prev => ({ ...prev, [id]: 'success' }));
      callback();
      showSnackbar('Document mis à jour avec succès');
      
      // Réinitialiser le statut après un délai
      setTimeout(() => {
        setUploadStatus(prev => ({ ...prev, [id]: 'idle' }));
      }, 2000);
    }, 1500);
  }, [showSnackbar]);

  // Upload contrat
  const handleContractUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      simulateUpload('contract', file, () => {
        setContractUrl(URL.createObjectURL(file));
      });
    }
  };

  // Upload document individuel
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      simulateUpload(id, file, () => {
        setDocuments((docs) =>
          docs.map((doc) =>
            doc.id === id
              ? {
                  ...doc,
                  fileName: file.name,
                  uploadDate: new Date().toISOString().slice(0, 10),
                  url: URL.createObjectURL(file),
                  status: "en attente",
                  fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                }
              : doc
          )
        );
      });
    }
  };

  const getStatusColor = (status: Document["status"]) => {
    switch (status) {
      case "validé": return "success";
      case "en attente": return "warning";
      case "refusé": return "error";
      default: return "default";
    }
  };

  const getStatusText = (status: Document["status"]) => {
    switch (status) {
      case "validé": return "Validé";
      case "en attente": return "En attente";
      case "refusé": return "Refusé";
      default: return status;
    }
  };

  return (
    <Box p={{ xs: 2, md: 4 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <DescriptionIcon color="primary" />
        <Typography variant="h4" gutterBottom>
          Mes documents
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Tous vos documents doivent être au format PDF et ne pas dépasser 10 Mo.
      </Alert>

      <Box
        mb={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexDirection={{ xs: "column", sm: "row" }}
        gap={2}
      >
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Type de document</InputLabel>
          <Select
            value={filterType}
            label="Type de document"
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="all">Tous les documents</MenuItem>
            {DOCUMENT_TYPES.map(type => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button 
          startIcon={<RefreshIcon />} 
          onClick={() => {
            setFilterType("all");
            setPage(0);
          }}
        >
          Réinitialiser
        </Button>
      </Box>

      <Paper elevation={2} sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <TableRow>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Nom du fichier</strong></TableCell>
                <TableCell><strong>Date d'upload</strong></TableCell>
                <TableCell><strong>Taille</strong></TableCell>
                <TableCell><strong>Statut</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
                <TableCell align="center"><strong>Remplacer</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedDocs.length ? (
                displayedDocs.map((doc) => (
                  <TableRow key={doc.id} hover>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {doc.fileName}
                    </TableCell>
                    <TableCell>{doc.uploadDate}</TableCell>
                    <TableCell>{doc.fileSize || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(doc.status)}
                        color={getStatusColor(doc.status)}
                        size="small"
                        variant={doc.status === "en attente" ? "outlined" : "filled"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Visualiser">
                        <IconButton
                          onClick={() => handlePreview(doc.url, doc.fileName)}
                          color="primary"
                          size="large"
                        >
                          <VisibilityIcon />
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
                          size="large"
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Button 
                        variant="outlined" 
                        component="label" 
                        startIcon={
                          uploadStatus[doc.id] === 'uploading' 
                            ? <CircularProgress size={16} /> 
                            : <UploadFileIcon />
                        }
                        disabled={uploadStatus[doc.id] === 'uploading'}
                      >
                        {uploadStatus[doc.id] === 'uploading' ? 'Envoi...' : 'Remplacer'}
                        <input
                          type="file"
                          hidden
                          onChange={(e) => handleDocumentUpload(e, doc.id)}
                          accept="application/pdf"
                        />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      {filterType === "all" 
                        ? "Aucun document disponible" 
                        : `Aucun document de type "${filterType}" trouvé`}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredDocs.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
          }
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      <Box mt={6} p={3} boxShadow={1} borderRadius={2} bgcolor="background.paper">
        <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
          <DescriptionIcon /> Contrat de domiciliation
        </Typography>

        <Typography variant="body2" color="textSecondary" paragraph>
          Téléchargez votre contrat de domiciliation signé. Format accepté: PDF (max. 10 Mo)
        </Typography>

        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          {contractUrl ? (
            <>
              <Button
                variant="outlined"
                startIcon={<VisibilityIcon />}
                onClick={() => handlePreview(contractUrl, "Contrat de domiciliation")}
              >
                Voir le contrat
              </Button>
              <Button
                variant="contained"
                component="label"
                startIcon={
                  uploadStatus.contract === 'uploading' 
                    ? <CircularProgress size={16} /> 
                    : <UploadFileIcon />
                }
                disabled={uploadStatus.contract === 'uploading'}
              >
                {uploadStatus.contract === 'uploading' ? 'Envoi...' : 'Remplacer le contrat'}
                <input type="file" hidden onChange={handleContractUpload} accept="application/pdf" />
              </Button>
              <Tooltip title="Télécharger le contrat">
                <IconButton
                  component="a"
                  href={contractUrl}
                  download="contrat_domiciliation.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="primary"
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Button variant="contained" component="label" startIcon={<UploadFileIcon />}>
              Télécharger un contrat
              <input type="file" hidden onChange={handleContractUpload} accept="application/pdf" />
            </Button>
          )}
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog 
        open={previewDialog.open} 
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Aperçu: {previewDialog.title}
        </DialogTitle>
        <DialogContent sx={{ minHeight: '60vh' }}>
          <iframe 
            src={previewDialog.url} 
            width="100%" 
            height="100%" 
            style={{ border: 'none', minHeight: '500px' }}
            title="Aperçu du document"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>Fermer</Button>
          <Button 
            component="a"
            href={previewDialog.url}
            download
            target="_blank"
            variant="contained"
          >
            Télécharger
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentsPage;
import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  useTheme,
  Chip,
  IconButton,
  Alert,
  alpha,
  styled,
  Avatar,
  AvatarGroup,
  CircularProgress,
  Snackbar,
  Tooltip,
  Fade,
} from "@mui/material";
import {
  Folder as FolderIcon,
  InsertDriveFile as InsertDriveFileIcon,
  CloudUpload as CloudUploadIcon,
  Send as SendIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import ClientAutocomplete from "./ClientAutocomplete";
import { motion, AnimatePresence } from "framer-motion";

// Styled Components
const GradientPaper = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const StyledFolderCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'selected' && prop !== 'primaryColor',
})<{ selected?: boolean; primaryColor: string }>(({ theme, selected, primaryColor }) => ({
  cursor: "pointer",
  padding: theme.spacing(2.5),
  textAlign: "center",
  borderRadius: 16,
  border: selected ? `2.5px solid ${primaryColor}` : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  backgroundColor: selected ? alpha(primaryColor, 0.08) : alpha(theme.palette.background.paper, 0.8),
  boxShadow: selected ? `0 8px 24px ${alpha(primaryColor, 0.3)}` : theme.shadows[1],
  transition: "all 0.3s ease",
  userSelect: "none",
  "&:hover": {
    boxShadow: `0 12px 32px ${alpha(primaryColor, 0.4)}`,
    transform: "translateY(-4px)",
  },
}));

const DropZoneArea = styled(Paper)(({ theme }) => ({
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.4)}`,
  padding: theme.spacing(4),
  textAlign: "center",
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderColor: theme.palette.primary.main,
  },
}));

// Exemple de données clients avec dossiers et fichiers
const clientsData = [
  {
    id: "client1",
    name: "Société Alpha",
    siren: "123456789",
    logo: "/logos/alpha.png",
    folders: [
      { id: "urssaf", label: "Courrier URSSAF", files: ["document1.pdf", "lettre2.doc"], color: "#ff6b6b" },
      { id: "impots", label: "Impôts", files: ["avis_imposition.pdf"], color: "#4ecdc4" },
      { id: "clients", label: "Clients/Fournisseurs", files: ["facture1.pdf", "contrat.docx"], color: "#45b7d1" },
      { id: "autres", label: "Autres", files: [], color: "#f9ca24" },
    ],
  },
  {
    id: "client2",
    name: "Entreprise Beta",
    siren: "987654321",
    logo: "/logos/beta.png",
    folders: [
      { id: "urssaf", label: "Courrier URSSAF", files: [], color: "#ff6b6b" },
      { id: "impots", label: "Impôts", files: ["taxe_fonciere.pdf"], color: "#4ecdc4" },
      { id: "clients", label: "Clients/Fournisseurs", files: ["contrat_beta.pdf"], color: "#45b7d1" },
      { id: "autres", label: "Autres", files: ["notes.doc"], color: "#f9ca24" },
    ],
  },
];

// Composant dossier (style moderne)
const FolderCard = ({
  folder,
  selected,
  onClick,
  primaryColor,
}: {
  folder: any;
  selected: boolean;
  onClick: (id: string) => void;
  primaryColor: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <StyledFolderCard
      selected={selected}
      primaryColor={primaryColor}
      onClick={() => onClick(folder.id)}
    >
      <FolderIcon
        sx={{
          fontSize: 64,
          color: selected ? primaryColor : folder.color,
          filter: selected ? "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" : "none",
          transition: "all 0.3s ease",
          mb: 1,
        }}
      />
      <Typography 
        variant="subtitle1" 
        fontWeight={selected ? 600 : 500}
        sx={{ 
          background: selected ? `linear-gradient(135deg, ${primaryColor} 0%, ${alpha(primaryColor, 0.8)} 100%)` : 'none',
          backgroundClip: selected ? 'text' : 'none',
          textFillColor: selected ? 'transparent' : 'none',
          WebkitBackgroundClip: selected ? 'text' : 'none',
          WebkitTextFillColor: selected ? 'transparent' : 'none',
        }}
      >
        {folder.label}
      </Typography>
      <Chip
        label={`${folder.files.length} fichier${folder.files.length !== 1 ? 's' : ''}`}
        size="small"
        variant="outlined"
        sx={{ 
          mt: 1,
          fontSize: '0.75rem',
          backgroundColor: alpha(primaryColor, 0.1),
          borderColor: alpha(primaryColor, 0.2),
        }}
      />
    </StyledFolderCard>
  </motion.div>
);

const AdminDashboardView = () => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const isDarkMode = theme.palette.mode === "dark";

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [filesInDropzone, setFilesInDropzone] = useState<File[]>([]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const folders = selectedClient ? selectedClient.folders : [];
  const selectedFolder = folders.find((f: any) => f.id === selectedFolderId);

  // Dropzone pour drag & drop fichiers
  const onDrop = (acceptedFiles: File[]) => {
    setFilesInDropzone((prev) => [...prev, ...acceptedFiles]);
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSendFiles = async () => {
    if (!selectedFolderId) {
      setSnackbar({ open: true, message: "Veuillez sélectionner un dossier.", severity: 'error' });
      return;
    }
    if (filesInDropzone.length === 0) {
      setSnackbar({ open: true, message: "Veuillez sélectionner au moins un fichier.", severity: 'error' });
      return;
    }
    if (!selectedClient) {
      setSnackbar({ open: true, message: "Veuillez sélectionner un client.", severity: 'error' });
      return;
    }

    setUploading(true);
    
    // Simulation d'upload
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(
        "Envoi fichiers:",
        filesInDropzone,
        "dans dossier",
        selectedFolderId,
        "du client",
        selectedClient.name
      );

      setSnackbar({ 
        open: true, 
        message: `${filesInDropzone.length} fichier(s) envoyé(s) avec succès !`, 
        severity: 'success' 
      });
      
      setFilesInDropzone([]);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: "Erreur lors de l'envoi des fichiers.", 
        severity: 'error' 
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFilesInDropzone(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
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
          Organisation du Courrier
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Gestion et distribution des documents clients
        </Typography>
      </Box>

      {/* Sélecteur client avec autocomplétion */}
      <GradientPaper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight="600">
            Sélection du Client
          </Typography>
          <Tooltip title="Actualiser">
            <IconButton size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <ClientAutocomplete
          clients={clientsData}
          value={selectedClient}
          onChange={setSelectedClient}
        />
      </GradientPaper>

      <AnimatePresence>
        {selectedClient && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Affichage dossiers client */}
            <Typography variant="h6" fontWeight="600" mb={3}>
              Dossiers de {selectedClient.name}
            </Typography>

            <Grid container spacing={3} mb={4}>
              {folders.map((folder: any) => (
                <Grid item xs={12} sm={6} md={3} key={folder.id}>
                  <FolderCard
                    folder={folder}
                    selected={folder.id === selectedFolderId}
                    onClick={setSelectedFolderId}
                    primaryColor={primaryColor}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Contenu dossier sélectionné */}
            {selectedFolder && (
              <GradientPaper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight="600">
                    📁 {selectedFolder.label}
                  </Typography>
                  <Chip 
                    label={`${selectedFolder.files.length} fichier${selectedFolder.files.length !== 1 ? 's' : ''}`} 
                    size="small" 
                    variant="outlined" 
                  />
                </Box>

                {selectedFolder.files.length === 0 ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Aucun fichier dans ce dossier
                  </Alert>
                ) : (
                  <List 
                    sx={{ 
                      maxHeight: 200, 
                      overflowY: "auto", 
                      mb: 2,
                      backgroundColor: alpha(theme.palette.background.paper, 0.5),
                      borderRadius: 2,
                    }}
                  >
                    {selectedFolder.files.map((file: string, idx: number) => (
                      <ListItem key={idx} divider>
                        <InsertDriveFileIcon sx={{ mr: 2, color: 'text.secondary' }} />
                        <ListItemText 
                          primary={file} 
                          primaryTypographyProps={{ 
                            fontSize: '0.9rem',
                            fontFamily: 'Monospace'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}

                {/* Dropzone */}
                <DropZoneArea
                  {...getRootProps()}
                  sx={{
                    backgroundColor: isDragActive
                      ? alpha(theme.palette.primary.main, 0.1)
                      : alpha(theme.palette.primary.main, 0.03),
                    mb: 2,
                  }}
                >
                  <input {...getInputProps()} />
                  <CloudUploadIcon 
                    sx={{ 
                      fontSize: 48, 
                      color: theme.palette.primary.main, 
                      mb: 1 
                    }} 
                  />
                  {isDragActive ? (
                    <Typography variant="h6" color="primary">
                      Déposez les fichiers ici...
                    </Typography>
                  ) : (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Glissez-déposez vos fichiers
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ou cliquez pour parcourir vos fichiers
                      </Typography>
                    </Box>
                  )}
                </DropZoneArea>

                {/* Liste fichiers sélectionnés */}
                {filesInDropzone.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Fichiers sélectionnés ({filesInDropzone.length})
                    </Typography>
                    <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                      {filesInDropzone.map((file, idx) => (
                        <Paper
                          key={idx}
                          sx={{
                            p: 1.5,
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <InsertDriveFileIcon sx={{ mr: 2, color: 'text.secondary' }} />
                            <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                              {file.name}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(idx);
                            }}
                            color="error"
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Paper>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Bouton envoyer */}
                <Button
                  variant="contained"
                  color="primary"
                  disabled={filesInDropzone.length === 0 || uploading}
                  onClick={handleSendFiles}
                  startIcon={uploading ? <CircularProgress size={16} /> : <SendIcon />}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    '&:hover': {
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                  }}
                >
                  {uploading ? 'Envoi en cours...' : `Envoyer dans ${selectedFolder.label}`}
                </Button>
              </GradientPaper>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
          sx={{ 
            borderRadius: 3,
            alignItems: 'center',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboardView;
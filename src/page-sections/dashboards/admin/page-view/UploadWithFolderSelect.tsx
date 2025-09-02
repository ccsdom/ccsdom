import React, { useState } from "react";
import {
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import { useDropzone } from "react-dropzone";

const folders = [
  { id: "urssaf", label: "Courrier URSSAF" },
  { id: "impots", label: "Impôts" },
  { id: "clients", label: "Clients/Fournisseurs" },
  { id: "autres", label: "Autres" },
];

type UploadWithFolderSelectProps = {
  onUpload: (files: File[], folder: string) => void;
};

const UploadWithFolderSelect: React.FC<UploadWithFolderSelectProps> = ({ onUpload }) => {
  const [selectedFolder, setSelectedFolder] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleFolderChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedFolder(event.target.value as string);
  };

  const handleSend = () => {
    if (!selectedFolder) {
      alert("Veuillez sélectionner un dossier.");
      return;
    }
    if (files.length === 0) {
      alert("Veuillez sélectionner au moins un fichier.");
      return;
    }
    onUpload(files, selectedFolder);
    setFiles([]);
    setSelectedFolder("");
  };

  return (
    <Box mt={3}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="folder-select-label">Sélectionner un dossier</InputLabel>
        <Select
          labelId="folder-select-label"
          value={selectedFolder}
          label="Sélectionner un dossier"
          onChange={handleFolderChange}
        >
          {folders.map((folder) => (
            <MenuItem key={folder.id} value={folder.id}>
              {folder.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Paper
        {...getRootProps()}
        sx={{
          border: "2px dashed #ccc",
          p: 4,
          textAlign: "center",
          backgroundColor: isDragActive ? "#eee" : "#fafafa",
          cursor: "pointer",
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <Typography>Déposez vos fichiers ici...</Typography>
        ) : (
          <Typography>Glissez-déposez les fichiers ou cliquez pour sélectionner</Typography>
        )}
      </Paper>

      {files.length > 0 && (
        <List sx={{ mt: 2, maxHeight: 200, overflowY: "auto" }}>
          {files.map((file, idx) => (
            <ListItem key={idx}>
              <ListItemText primary={file.name} />
            </ListItem>
          ))}
        </List>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleSend}
        disabled={!selectedFolder || files.length === 0}
        sx={{ mt: 2 }}
      >
        Envoyer dans le dossier
      </Button>
    </Box>
  );
};

export default UploadWithFolderSelect;

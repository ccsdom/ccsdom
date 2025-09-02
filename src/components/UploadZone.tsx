// src/components/UploadZone.tsx
import React, { useState, useRef } from "react";
import { Box, Button, TextField, MenuItem, Typography, LinearProgress, Stack } from "@mui/material";

type UploadZoneProps = {
  clientsList: string[];
  onUpload: (file: File, client: string) => Promise<void>;
  uploading: boolean;
  progress: number;
};

const UploadZone: React.FC<UploadZoneProps> = ({ clientsList, onUpload, uploading, progress }) => {
  const [selectedClient, setSelectedClient] = useState<string>(clientsList[0]);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadClick = async () => {
    if (file) {
      await onUpload(file, selectedClient);
      setFile(null);
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" mb={3}>
        <TextField
          select
          label="Sélectionner le client"
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          sx={{ minWidth: 200 }}
          size="small"
        >
          {clientsList.map((client) => (
            <MenuItem key={client} value={client}>
              {client}
            </MenuItem>
          ))}
        </TextField>

        <Button variant="contained" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {file ? `Fichier: ${file.name}` : "Choisir un fichier"}
        </Button>

        <input
          type="file"
          hidden
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        />

        <Button
          variant="outlined"
          onClick={handleUploadClick}
          disabled={!file || uploading}
        >
          {uploading ? "Téléversement..." : "Téléverser"}
        </Button>
      </Stack>

      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          border: `2px dashed ${dragActive ? "primary.main" : "grey.400"}`,
          borderRadius: 2,
          p: 4,
          textAlign: "center",
          cursor: "pointer",
          bgcolor: dragActive ? "primary.light" : "transparent",
          transition: "background-color 0.3s ease",
        }}
      >
        <Typography variant="body1" color={dragActive ? "primary.main" : "text.secondary"}>
          {dragActive ? "Déposez le fichier ici..." : "Glissez-déposez un fichier pour téléverser"}
        </Typography>
        <Typography variant="caption" color="text.secondary" mt={1}>
          Formats acceptés: PDF, DOC, DOCX, PNG, JPG. Taille max: 10 Mo.
        </Typography>
      </Box>

      {uploading && <LinearProgress variant="determinate" value={progress} sx={{ mt: 2 }} />}
    </Box>
  );
};

export default UploadZone;

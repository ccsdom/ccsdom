import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Paper, Typography } from "@mui/material";

const DropzoneArea = ({ onFilesSelected }) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Paper
      {...getRootProps()}
      sx={{
        p: 4,
        textAlign: "center",
        border: "2px dashed #888",
        backgroundColor: isDragActive ? "#eee" : "#fafafa",
        cursor: "pointer",
        mb: 3,
      }}
    >
      <input {...getInputProps()} />
      <Typography variant="body1">
        {isDragActive
          ? "Déposez les fichiers ici..."
          : "Glissez-déposez des fichiers ici, ou cliquez pour sélectionner"}
      </Typography>
    </Paper>
  );
};

export default DropzoneArea;

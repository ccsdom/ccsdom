// src/pages/client/documents/upload.tsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const UploadDocumentPage: React.FC = () => {
  const navigate = useNavigate();

  const handleUpload = () => {
    // Logique upload à implémenter
    alert("Upload du document...");

    // Retour à la liste documents après upload
    navigate("/client/documents");
  };

  return (
    <Box p={3} sx={{ border: "1px solid #ccc", borderRadius: 2 }}>
      <Typography variant="h5" mb={2}>
        Ajouter un nouveau document
      </Typography>

      {/* Ton formulaire upload ici */}

      <Button variant="contained" onClick={handleUpload}>
        Upload
      </Button>
    </Box>
  );
};

export default UploadDocumentPage;

// src/components/DocumentPreview.tsx
import React from "react";
import { Dialog, Box, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

interface DocumentPreviewProps {
  open: boolean;
  url: string | null;
  onClose: () => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ open, url, onClose }) => {
  if (!url) return null;

  const isPdf = url.endsWith(".pdf");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <Box position="relative" sx={{ height: "80vh" }}>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8, zIndex: 10, color: "white" }}
          aria-label="Fermer l'aperçu"
        >
          <Close />
        </IconButton>

        {isPdf ? (
          <object
            data={url}
            type="application/pdf"
            width="100%"
            height="100%"
            aria-label="Aperçu PDF"
          />
        ) : (
          <img
            src={url}
            alt="Aperçu du document"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        )}
      </Box>
    </Dialog>
  );
};

export default DocumentPreview;

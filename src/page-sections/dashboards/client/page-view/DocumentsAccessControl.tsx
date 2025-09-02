// src/page-sections/dashboards/client/page-view/components/DocumentsAccessControl.tsx
import React from "react";
import { Typography, Box } from "@mui/material";

interface DocumentsAccessControlProps {
  accessible: boolean;
}

const DocumentsAccessControl: React.FC<DocumentsAccessControlProps> = ({ accessible }) => (
  <Box sx={{ mt: 3 }}>
    <Typography sx={{ color: accessible ? "success.main" : "error.main" }}>
      {accessible
        ? "Vos documents sont accessibles."
        : "Vos documents sont bloqués jusqu'au règlement de la facture."}
    </Typography>
  </Box>
);

export default DocumentsAccessControl;

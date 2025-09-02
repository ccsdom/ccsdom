import React from "react";
import { Typography, Box } from "@mui/material";

const CancelPage = () => {
  return (
    <Box p={4} textAlign="center">
      <Typography variant="h4" color="error" gutterBottom>
        ❌ Paiement annulé
      </Typography>
      <Typography variant="subtitle1">
        Votre paiement a été annulé. Vous pouvez réessayer à tout moment.
      </Typography>
    </Box>
  );
};

export default CancelPage;

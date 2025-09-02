import React from "react";
import { Box, Card, CardContent, Stack, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ErrorIcon from "@mui/icons-material/Error";

export default function Cancel(): JSX.Element {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
      <Card sx={{ maxWidth: 560, width: "100%" }}>
        <CardContent>
          <Stack spacing={2} alignItems="center">
            <ErrorIcon color="warning" fontSize="large" />
            <Typography variant="h5">Paiement annulé</Typography>
            <Typography color="text.secondary" align="center">
              Aucun débit n’a été effectué. Vous pouvez réessayer quand vous voulez.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/client/abonnement", { replace: true })}
            >
              Retour au tableau de bord
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

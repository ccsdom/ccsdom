import { useEffect } from "react";
import { Box, Card, CardContent, Stack, Typography, Button } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Success() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");

  useEffect(() => {
    const t = setTimeout(() => navigate("/client/abonnement", { replace: true }), 2000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
      <Card sx={{ maxWidth: 560, width: "100%" }}>
        <CardContent>
          <Stack spacing={2} alignItems="center">
            <CheckCircleIcon color="success" fontSize="large" />
            <Typography variant="h5">Paiement confirmé</Typography>
            <Typography color="text.secondary" align="center">
              {sessionId ? `Session #${sessionId}` : "Votre paiement a été pris en compte."}
            </Typography>
            <Button variant="contained" onClick={() => navigate("/client/abonnement", { replace: true })}>
              Voir mon abonnement
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

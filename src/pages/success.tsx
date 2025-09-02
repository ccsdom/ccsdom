import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const FUNCTIONS_BASE =
  import.meta.env.VITE_FUNCTIONS_BASE_URL ??
  "https://us-central1-ccs-dom.cloudfunctions.net";

const SuccessPage: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const calledRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setErrorMsg("Aucun session_id fourni dans l'URL.");
      setVerifying(false);
      return;
    }

    // anti double appel (Fast Refresh, ré-montage, etc.)
    if (calledRef.current) return;
    calledRef.current = true;

    (async () => {
      try {
        const url = `${FUNCTIONS_BASE}/verifyPayment?session_id=${encodeURIComponent(
          sessionId
        )}`;
        const res = await fetch(url, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        const raw = await res.text();
        let data: any = {};
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          // non-JSON => on force une erreur exploitable
          throw new Error(`Réponse non JSON: ${raw?.slice(0, 200) || "(vide)"}`);
        }

        if (!res.ok) {
          throw new Error(data?.error || `HTTP ${res.status} ${res.statusText}`);
        }

        if (data.success) {
          setOpen(true);
          toast.success("Inscription validée et paiement confirmé !");
        } else {
          setErrorMsg(data?.error || "Paiement non confirmé.");
          toast.error(data?.error || "Paiement non confirmé.");
        }
      } catch (err: any) {
        const msg = err?.message ?? "Erreur de vérification du paiement.";
        setErrorMsg(msg);
        toast.error(msg);
      } finally {
        setVerifying(false);
      }
    })();
  }, []);

  const handleClose = () => {
    setOpen(false);
    navigate("/login"); // ou "/client/dashboard"
  };

  return (
    <Box textAlign="center" mt={10}>
      {verifying && <CircularProgress />}

      {!verifying && errorMsg && (
        <Box>
          <Typography variant="h5" color="error" gutterBottom>
            Vérification échouée
          </Typography>
          <Typography>{errorMsg}</Typography>
          <Button sx={{ mt: 3 }} variant="outlined" onClick={() => navigate("/client/paiement")}>
            Réessayer le paiement
          </Button>
        </Box>
      )}

      {!verifying && !errorMsg && (
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>🎉 Inscription réussie !</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Votre paiement a été confirmé. Bienvenue !
            </Typography>
            <Button variant="contained" onClick={handleClose} sx={{ mt: 2 }}>
              Accéder à mon espace
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default SuccessPage;

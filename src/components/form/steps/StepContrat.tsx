import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Paper,
  Alert,
  useTheme,
  alpha,
  Stack,
  Chip,
  IconButton,
  Fade,
  Collapse,
  Divider,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  TouchApp as TouchAppIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import SignatureCanvas from "react-signature-canvas";
import { PDFViewer } from "@react-pdf/renderer";
import { motion, AnimatePresence } from "framer-motion";
import ContratDocument from "./ContratDocument";

interface StepContratProps {
  data: any;
  contratAccepte: boolean;
  onAccept: (accepted: boolean) => void;
  onBack: () => void;
  onNext: () => void;
  onSignatureChange: (dataURL: string | null) => void;
  signatureDataURL: string | null;
}

const StepContrat: React.FC<StepContratProps> = ({
  data,
  contratAccepte,
  onAccept,
  onBack,
  onNext,
  onSignatureChange,
  signatureDataURL,
}) => {
  const theme = useTheme();
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Appelé à la fin de la signature pour récupérer le DataURL
  const handleEndSignature = () => {
    if (!sigCanvas.current) return;

    if (sigCanvas.current.isEmpty()) {
      setIsEmpty(true);
      onSignatureChange(null);
    } else {
      setIsEmpty(false);
      const trimmedDataURL = sigCanvas.current
        .getTrimmedCanvas()
        .toDataURL("image/png");
      onSignatureChange(trimmedDataURL);
    }
    setIsSigning(false);
  };

  const handleBeginSignature = () => {
    setIsSigning(true);
  };

  // Effacer la signature et notifier le parent
  const clearSignature = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
    onSignatureChange(null);
  };

  // Vérifier si on peut procéder
  const canProceed = contratAccepte && !isEmpty;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{ px: { xs: 1, sm: 2 }, py: 2 }}
    >
      {/* En-tête */}
      <Box textAlign="center" mb={4}>
        <motion.div variants={itemVariants}>
          <Typography
            variant="h3"
            fontWeight="bold"
            gutterBottom
            color="primary.main"
          >
            Signature du contrat
          </Typography>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Typography variant="subtitle1" color="text.secondary">
            Veuillez signer électroniquement et accepter le contrat de domiciliation
          </Typography>
        </motion.div>
      </Box>

      <Stack spacing={4}>
        {/* Section de signature */}
        <motion.div variants={itemVariants}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(10px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <TouchAppIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Signature électronique
              </Typography>
              <Chip
                label="Requis"
                color="primary"
                size="small"
                sx={{ ml: 2 }}
              />
            </Box>

            <Paper
              variant="outlined"
              sx={{
                height: 200,
                mb: 2,
                borderRadius: 2,
                overflow: "hidden",
                position: "relative",
                border: `2px dashed ${
                  isSigning
                    ? theme.palette.primary.main
                    : alpha(theme.palette.divider, 0.3)
                }`,
                transition: "all 0.3s ease",
              }}
            >
              <SignatureCanvas
                ref={sigCanvas}
                penColor={theme.palette.primary.main}
                minWidth={2}
                maxWidth={3}
                canvasProps={{
                  width: 600,
                  height: 200,
                  className: "sigCanvas",
                  "aria-label": "Zone de signature - Signez avec votre souris ou votre doigt",
                  role: "img",
                  style: {
                    width: "100%",
                    height: "100%",
                    cursor: "crosshair",
                  },
                }}
                onBegin={handleBeginSignature}
                onEnd={handleEndSignature}
                backgroundColor="#fafafa"
              />

              {isEmpty && !isSigning && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontStyle: "italic" }}
                  >
                    Signez ici avec votre souris ou votre doigt
                  </Typography>
                </Box>
              )}
            </Paper>

            <Button
              variant="outlined"
              onClick={clearSignature}
              startIcon={<RefreshIcon />}
              disabled={isEmpty}
              sx={{ borderRadius: 2 }}
            >
              Effacer la signature
            </Button>

            <AnimatePresence>
              {!isEmpty && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert
                    severity="success"
                    sx={{ mt: 2, borderRadius: 2 }}
                    icon={false}
                  >
                    <Typography variant="body2">
                      Signature enregistrée avec succès
                    </Typography>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </Paper>
        </motion.div>

        {/* Section d'acceptation */}
        <motion.div variants={itemVariants}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(10px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={contratAccepte}
                  onChange={(e) => onAccept(e.target.checked)}
                  inputProps={{ "aria-required": true }}
                  color="primary"
                  sx={{ '&.Mui-checked': { color: 'primary.main' } }}
                />
              }
              label={
                <Typography variant="body1">
                  Je reconnais avoir lu et accepté le contrat de domiciliation
                </Typography>
              }
              sx={{ alignItems: "flex-start" }}
            />

            <AnimatePresence>
              {!contratAccepte && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert
                    severity="error"
                    sx={{ mt: 1, borderRadius: 2 }}
                  >
                    Vous devez accepter le contrat pour continuer
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </Paper>
        </motion.div>

        {/* Aperçu du contrat */}
        <motion.div variants={itemVariants}>
          <Paper
            elevation={2}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Box
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <Box display="flex" alignItems="center">
                <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Aperçu du contrat
                </Typography>
              </Box>
              <IconButton
                onClick={() => setShowPreview(!showPreview)}
                aria-label={
                  showPreview
                    ? "Masquer l'aperçu"
                    : "Afficher l'aperçu"
                }
                size="small"
              >
                {showPreview ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </Box>

            <Collapse in={showPreview}>
              <Box
                sx={{
                  height: { xs: 400, md: 500 },
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <PDFViewer
                  width="100%"
                  height="100%"
                  aria-label="Aperçu du contrat PDF"
                >
                  <ContratDocument
                    data={data}
                    signatureDataURL={signatureDataURL}
                  />
                </PDFViewer>
              </Box>
            </Collapse>
          </Paper>
        </motion.div>

        {/* Navigation */}
        <motion.div variants={itemVariants}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexDirection={{ xs: "column-reverse", sm: "row" }}
            gap={2}
            mt={2}
          >
            <Button
              variant="outlined"
              onClick={onBack}
              startIcon={<ArrowBackIcon />}
              sx={{ borderRadius: 2, minWidth: 140 }}
            >
              Précédent
            </Button>

            <Box display="flex" alignItems="center" gap={1}>
              <AnimatePresence>
                {!canProceed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Chip
                      label="Signature et acceptation requises"
                      color="warning"
                      size="small"
                      variant="outlined"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                variant="contained"
                onClick={onNext}
                disabled={!canProceed}
                endIcon={<ArrowForwardIcon />}
                sx={{ borderRadius: 2, minWidth: 140 }}
              >
                Finaliser
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Stack>
    </Box>
  );
};

export default StepContrat;
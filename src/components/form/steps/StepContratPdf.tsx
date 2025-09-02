import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  useTheme,
  alpha,
  Stack,
  Chip,
  Alert,
  IconButton,
  Fade,
  Collapse,
  Divider,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  OpenInNew as OpenInNewIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";

interface StepContratPdfProps {
  data: {
    nomEntreprise: string;
    adresseEntreprise: string;
    nomRepresentant: string;
    prenomRepresentant: string;
    emailRepresentant: string;
    telephoneRepresentant: string;
  };
  signatureDataURL: string | null;
  onSignatureChange: (dataURL: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepContratPdf: React.FC<StepContratPdfProps> = ({
  data,
  signatureDataURL,
  onSignatureChange,
  onNext,
  onBack,
}) => {
  const theme = useTheme();
  const sigCanvas = useRef<SignatureCanvas>(null);
  const contratRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isSigned, setIsSigned] = useState(!!signatureDataURL);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mise à jour de l'état de signature quand les props changent
  useEffect(() => {
    setIsSigned(!!signatureDataURL);
  }, [signatureDataURL]);

  // Efface la signature
  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
    onSignatureChange(null);
    setIsSigned(false);
    setError(null);
  };

  // Capture la signature manuscrite en base64
  const saveSignature = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      try {
        const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
        onSignatureChange(dataURL);
        setIsSigned(true);
        setError(null);
      } catch (err) {
        setError("Erreur lors de l'enregistrement de la signature");
      }
    } else {
      onSignatureChange(null);
      setIsSigned(false);
    }
  };

  // Génère le PDF avec contenu + signature
  const generatePdf = async () => {
    if (!contratRef.current) return;
    
    if (!signatureDataURL) {
      setError("Veuillez signer le contrat avant de générer le PDF");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Capture la section HTML (contrat)
      const canvas = await html2canvas(contratRef.current, { 
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
      });
      const imgData = canvas.toDataURL("image/png");

      // Crée un PDF jsPDF (format A4)
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calcule le ratio pour l'image
      const imgProps = pdf.getImageProperties(imgData);
      const pdfImgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Ajoute l'image du contrat
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfImgHeight);

      // Ajoute la signature manuscrite en bas à droite
      const sigWidthMM = 50;
      const sigHeightMM = 25;
      const sigX = pdfWidth - sigWidthMM - 15;
      const sigY = pdfHeight - sigHeightMM - 20;
      
      pdf.addImage(signatureDataURL, "PNG", sigX, sigY, sigWidthMM, sigHeightMM);

      // Ajoute la date de génération
      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Généré le ${dateStr}`, 15, pdfHeight - 10);

      // Enregistre ou crée une URL pour visualisation
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setShowPreview(true);

    } catch (err) {
      console.error("Erreur lors de la génération du PDF:", err);
      setError("Une erreur est survenue lors de la génération du PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  // Télécharge le PDF
  const downloadPdf = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `Contrat-${data.nomEntreprise}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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
            Veuillez signer électroniquement le contrat de domiciliation
          </Typography>
        </motion.div>
      </Box>

      <Stack spacing={4}>
        {/* Aperçu du contrat */}
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
              <DescriptionIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Aperçu du contrat
              </Typography>
            </Box>

            <Paper
              ref={contratRef}
              variant="outlined"
              sx={{ 
                p: 3, 
                maxHeight: 400, 
                overflowY: "auto",
                backgroundColor: "#ffffff"
              }}
            >
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                CONTRAT DE DOMICILIATION
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" fontWeight="bold" color="text.secondary">
                    Entreprise
                  </Typography>
                  <Typography variant="body1">
                    {data.nomEntreprise || "Non renseigné"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight="bold" color="text.secondary">
                    Adresse
                  </Typography>
                  <Typography variant="body1">
                    {data.adresseEntreprise || "Non renseigné"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight="bold" color="text.secondary">
                    Représentant légal
                  </Typography>
                  <Typography variant="body1">
                    {data.prenomRepresentant || "Non renseigné"} {data.nomRepresentant || ""}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight="bold" color="text.secondary">
                    Contact
                  </Typography>
                  <Typography variant="body1">
                    {data.emailRepresentant || "Non renseigné"}
                    {data.telephoneRepresentant && ` • ${data.telephoneRepresentant}`}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" paragraph>
                  Par la présente, l'entreprise <strong>{data.nomEntreprise || "[Nom de l'entreprise]"}</strong>, 
                  représentée par <strong>{data.prenomRepresentant || "[Prénom]"} {data.nomRepresentant || "[Nom]"}</strong>,
                  accepte les termes et conditions de la domiciliation commerciale.
                </Typography>

                <Typography variant="body2" paragraph>
                  Le présent contrat est conclu pour une durée d'un an renouvelable tacitement. 
                  Les parties conviennent des conditions générales de domiciliation telles que précisées 
                  dans les documents contractuels annexés.
                </Typography>

                <Typography variant="body2" fontStyle="italic" color="text.secondary">
                  Fait à Paris, le {new Date().toLocaleDateString('fr-FR', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </Typography>
              </Stack>
            </Paper>
          </Paper>
        </motion.div>

        {/* Signature */}
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
              <DescriptionIcon color="primary" sx={{ mr: 1 }} />
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
                border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
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
                  style: {
                    width: "100%",
                    height: "100%",
                    cursor: "crosshair",
                  },
                }}
                onEnd={saveSignature}
                backgroundColor="#fafafa"
              />

              {!isSigned && (
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
              disabled={!isSigned}
              sx={{ borderRadius: 2 }}
            >
              Effacer la signature
            </Button>

            <AnimatePresence>
              {isSigned && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert
                    severity="success"
                    sx={{ mt: 2, borderRadius: 2 }}
                    icon={<CheckCircleIcon />}
                  >
                    Signature enregistrée avec succès
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </Paper>
        </motion.div>

        {/* Messages d'erreur */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert
                severity="error"
                sx={{ borderRadius: 2 }}
                icon={<ErrorIcon />}
              >
                {error}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <motion.div variants={itemVariants}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexDirection={{ xs: "column-reverse", sm: "row" }}
            gap={2}
          >
            <Button
              variant="outlined"
              onClick={onBack}
              startIcon={<ArrowBackIcon />}
              sx={{ borderRadius: 2, minWidth: 140 }}
            >
              Précédent
            </Button>

            <Button
              variant="contained"
              onClick={generatePdf}
              disabled={isGenerating || !isSigned}
              startIcon={isGenerating ? <CircularProgress size={16} /> : <DownloadIcon />}
              sx={{ borderRadius: 2, minWidth: 160 }}
            >
              {isGenerating ? "Génération..." : "Générer le PDF"}
            </Button>
          </Box>
        </motion.div>

        {/* Aperçu PDF */}
        <AnimatePresence>
          {pdfUrl && showPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
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
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Aperçu du PDF généré
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={downloadPdf}
                      startIcon={<DownloadIcon />}
                    >
                      Télécharger
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => window.open(pdfUrl, "_blank")}
                      startIcon={<OpenInNewIcon />}
                    >
                      Ouvrir
                    </Button>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    height: 500,
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <iframe
                    src={pdfUrl}
                    style={{ width: "100%", height: "100%", border: "none" }}
                    title="Aperçu du contrat PDF"
                  />
                </Box>

                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <Button
                    variant="contained"
                    onClick={onNext}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    Continuer
                  </Button>
                </Box>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </Stack>
    </Box>
  );
};

export default StepContratPdf;
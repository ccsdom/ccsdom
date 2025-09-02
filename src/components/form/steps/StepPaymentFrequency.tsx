import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  useTheme,
  alpha,
  Chip,
  Stack,
  Divider,
  IconButton,
  Collapse,
  Tooltip,
} from "@mui/material";
import Alert from "@mui/material/Alert";
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Savings as SavingsIcon,
  EventRepeat as EventRepeatIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { FormData, SectionEditable } from "./types/form";

interface StepPaymentFrequencyProps {
  data: Partial<Pick<FormData, "frequencePaiement" | "prixOffreCourrierNum">>;
  onChange: (values: Partial<Pick<FormData, "frequencePaiement" | "prixOffreCourrierNum">>) => void;
  onBack: () => void;
  onNext: () => void;
  onEdit?: (section: SectionEditable) => void;
  /** (Optionnel) Navigation directe vers l'étape Offres — prioritaire si fourni */
  goToOffersStep?: () => void;
}

const TVA_RATE = 0.2;
const DISCOUNT_ANNUEL = 0.1;

const formatEuros = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

const StepPaymentFrequency: React.FC<StepPaymentFrequencyProps> = ({
  data,
  onChange,
  onBack,
  onNext,
  onEdit,
  goToOffersStep,
}) => {
  const theme = useTheme();
  const [isAnnuel, setIsAnnuel] = useState(data.frequencePaiement === "annuelle");
  const [showDetails, setShowDetails] = useState(false);

  // Navigation robuste vers l’étape Offres
  const goToOffers = () => {
    if (typeof goToOffersStep === "function") {
      goToOffersStep();
      return;
    }
    if (typeof onEdit === "function") {
      onEdit("courrier");
      return;
    }
    onBack();
  };

  // Sync fréquence vers le parent
  useEffect(() => {
    onChange({ frequencePaiement: isAnnuel ? "annuelle" : "mensuelle" });
  }, [isAnnuel, onChange]);

  // Base mensuelle (HT) de l'offre courrier choisie
  const prixMensuelHT = data.prixOffreCourrierNum ?? 0;

  const calc = useMemo(() => {
    const mensuelHT = prixMensuelHT;
    const annuelHTSansRemise = mensuelHT * 12;
    const remiseAnnuelle = annuelHTSansRemise * DISCOUNT_ANNUEL;
    const annuelHT = annuelHTSansRemise - remiseAnnuelle;

    const prixHT = isAnnuel ? annuelHT : mensuelHT;
    const tva = prixHT * TVA_RATE;
    const ttc = prixHT + tva;

    // équivalent mensuel quand on est en "annuel"
    const equivMensuelHT = isAnnuel ? annuelHT / 12 : mensuelHT;

    return {
      mensuelHT,
      annuelHTSansRemise,
      remiseAnnuelle,
      annuelHT,
      prixHT,
      tva,
      ttc,
      equivMensuelHT,
    };
  }, [prixMensuelHT, isAnnuel]);

  const toggleFrequence = () => setIsAnnuel((prev) => !prev);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <Box
      component={motion.form}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit}
      noValidate
      sx={{ px: { xs: 1, sm: 2 }, py: 2 }}
    >
      {/* En-tête */}
      <Box textAlign="center" mb={4}>
        <motion.div variants={itemVariants}>
          <Typography variant="h3" fontWeight="bold" gutterBottom color="primary.main">
            Fréquence de paiement
          </Typography>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Typography variant="subtitle1" color="text.secondary">
            Choisissez un paiement mensuel sans engagement ou un paiement annuel avec{" "}
            {Math.round(DISCOUNT_ANNUEL * 100)}% de réduction.
          </Typography>
        </motion.div>
      </Box>

      <Stack spacing={4}>
        {/* Options de paiement */}
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
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <EventRepeatIcon color="primary" />
                <Typography variant="h6" fontWeight={800}>
                  Fréquence de paiement
                </Typography>
                {isAnnuel && calc.remiseAnnuelle > 0 && (
                  <Chip
                    size="small"
                    color="success"
                    icon={<SavingsIcon />}
                    label={`Économie ${formatEuros(calc.remiseAnnuelle)} HT/an`}
                    sx={{ ml: 1, fontWeight: 700 }}
                  />
                )}
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="text"
                  size="small"
                  onClick={goToOffers}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goToOffers();
                    }
                  }}
                  sx={{ textTransform: "none", fontWeight: 700 }}
                >
                  Modifier l’offre
                </Button>

                <Tooltip title="Modifier l'offre courrier">
                  <IconButton
                    onClick={goToOffers}
                    size="small"
                    aria-label="Modifier l'offre courrier"
                    sx={{ color: "primary.main" }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>

            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  Paiement {isAnnuel ? "annuel" : "mensuel"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isAnnuel ? "Avec économie de 10%" : "Sans engagement"}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={2}>
                <Chip
                  label="Mensuel"
                  variant={!isAnnuel ? "filled" : "outlined"}
                  color={!isAnnuel ? "primary" : "default"}
                  onClick={!isAnnuel ? undefined : () => setIsAnnuel(false)}
                  sx={{ fontWeight: 600 }}
                />

                <FormControlLabel
                  control={<Switch checked={isAnnuel} onChange={toggleFrequence} color="primary" />}
                  label=""
                />

                <Chip
                  label="Annuel"
                  variant={isAnnuel ? "filled" : "outlined"}
                  color={isAnnuel ? "primary" : "default"}
                  onClick={isAnnuel ? undefined : () => setIsAnnuel(true)}
                  icon={isAnnuel ? <SavingsIcon /> : undefined}
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Box>

            <AnimatePresence>
              {isAnnuel && calc.remiseAnnuelle > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert severity="success" icon={<SavingsIcon />} sx={{ mt: 2, borderRadius: 2 }}>
                    <Typography variant="body2" fontWeight="medium">
                      Économisez {formatEuros(calc.remiseAnnuelle)} HT par an avec le paiement annuel
                    </Typography>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </Paper>
        </motion.div>

        {/* Détails du prix */}
        <motion.div variants={itemVariants}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(10px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              cursor: "pointer",
              "&:hover": {
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
              },
            }}
            onClick={() => setShowDetails(!showDetails)}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  {formatEuros(calc.ttc)} TTC
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isAnnuel ? "Pour 12 mois" : "Par mois"}
                </Typography>
              </Box>
              <Chip label={`${formatEuros(calc.prixHT)} HT`} color="primary" variant="outlined" />
            </Box>

            <Collapse in={showDetails}>
              <Box mt={2}>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Prix HT:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatEuros(calc.prixHT)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">TVA (20%):</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatEuros(calc.tva)}
                    </Typography>
                  </Box>
                  {isAnnuel && (
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="success.main">
                        Économie (10%):
                      </Typography>
                      <Typography variant="body2" fontWeight="medium" color="success.main">
                        -{formatEuros(calc.remiseAnnuelle)}
                      </Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body1" fontWeight="bold">
                      Total TTC:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary.main">
                      {formatEuros(calc.ttc)}
                    </Typography>
                  </Box>
                </Stack>
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

            <Button
              variant="contained"
              type="submit"
              endIcon={<ArrowForwardIcon />}
              sx={{ borderRadius: 2, minWidth: 140 }}
            >
              Valider
            </Button>
          </Box>
        </motion.div>
      </Stack>
    </Box>
  );
};

export default StepPaymentFrequency;

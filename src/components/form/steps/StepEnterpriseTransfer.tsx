import React, { ReactNode } from "react";
import {
  Box,
  Button,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Grid,
  FormHelperText,
  Chip,
  Stack,
  useTheme,
  alpha,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  BusinessCenter as BusinessCenterIcon,
  SelfImprovement as SelfImprovementIcon,
  Security as SecurityIcon,
  OnlinePrediction as OnlinePredictionIcon,
  GppGood as GppGoodIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  InfoOutlined as InfoOutlinedIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";

interface StepEnterpriseTransferProps {
  data: { transferOption?: string };
  onChange: (values: { transferOption: string }) => void;
  onNext: () => void;
  onBack: () => void;
}

/** Types sûrs pour la config d’options */
type OptionKey = "creation" | "self";

type OptionFeature = { icon: React.ReactNode; text: string };

type OptionConfig = {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: "primary" | "secondary";
  recommended: boolean;
  features?: OptionFeature[]; // optionnel
  price: string;
  priceDescription: string;
  caption: string;
  guarantee?: string; // optionnel
  customContent?: ReactNode; // optionnel (self)
};

const StepEnterpriseTransfer: React.FC<StepEnterpriseTransferProps> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  const formik = useFormik({
    initialValues: {
      transferOption: data.transferOption || "",
    },
    validationSchema: Yup.object({
      transferOption: Yup.string().required("Veuillez sélectionner une option."),
    }),
    onSubmit: (values) => {
      onChange(values);
      onNext();
    },
    validateOnMount: true,
  });

  const handleSelect = (value: string) => {
    formik.setFieldValue("transferOption", value, true);
    // on marque le champ comme touché pour afficher l'erreur éventuelle
    formik.setFieldTouched("transferOption", true, false);
  };

  const cardSx = (selected: boolean) => ({
    p: 4,
    borderRadius: 3,
    transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease",
    cursor: "pointer",
    outline: "none",
    background: alpha(theme.palette.background.paper, 0.9),
    backdropFilter: "blur(10px)",
    border: `2px solid ${
      selected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.12)
    }`,
    boxShadow: selected
      ? `0 16px 40px ${alpha(theme.palette.primary.main, 0.18)}`
      : `0 8px 28px ${alpha(theme.palette.common.black, 0.08)}`,
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: `0 18px 48px ${alpha(theme.palette.primary.main, 0.22)}`,
      borderColor: alpha(theme.palette.primary.main, 0.5),
    },
    "&:focus-visible": {
      outline: `3px solid ${alpha(theme.palette.primary.main, 0.35)}`,
    },
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 1.5,
    isolation: "isolate",
    "&::after": selected
      ? {
          content: '""',
          position: "absolute",
          inset: -4,
          borderRadius: 16,
          zIndex: -1,
          boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.06)}`,
        }
      : {},
  });

  /** Configuration des deux options, typée solidement */
  const optionConfig: Record<OptionKey, OptionConfig> = {
    creation: {
      title: "Accompagnement expert",
      description: "Création prise en charge de A à Z",
      icon: <BusinessCenterIcon sx={{ fontSize: 48 }} />,
      color: "primary",
      recommended: true,
      features: [
        { icon: <SecurityIcon fontSize="small" />, text: "Prise en charge complète du dossier" },
        { icon: <OnlinePredictionIcon fontSize="small" />, text: "Création 100% en ligne" },
        { icon: <GppGoodIcon fontSize="small" />, text: "Assistance juridique incluse (≥ 1 an)" },
      ],
      price: "400€ HT",
      priceDescription: "Aucun frais supplémentaires pour nos services",
      caption: "Frais greffe & annonces légales à votre charge",
      guarantee: "Satisfait ou révisé",
    },
    self: {
      title: "Gestion autonome",
      description: "Vous gérez la création vous-même",
      icon: <SelfImprovementIcon sx={{ fontSize: 48 }} />,
      color: "secondary",
      recommended: false,
      features: [],
      price: "Variables",
      priceDescription: "Selon les prestataires choisis",
      caption: "Tous les frais & démarches à votre charge",
      customContent: (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 2,
          }}
        >
          <Stack spacing={1.5} alignItems="center">
            <InfoOutlinedIcon color="action" />
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ fontStyle: "italic" }}>
              Vous réalisez seul l’ensemble des démarches administratives
            </Typography>
          </Stack>
        </Box>
      ),
    },
  };

  const Header = (
    <Box textAlign="center" mb={6}>
      <Typography
        variant="h3"
        fontWeight={800}
        gutterBottom
        sx={{
          fontSize: { xs: "2rem", md: "2.5rem" },
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Création de votre entreprise
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ maxWidth: 680, mx: "auto", fontSize: "1.05rem", lineHeight: 1.7 }}
      >
        Choisissez le niveau d’accompagnement le plus adapté pour sécuriser vos démarches administratives.
      </Typography>
      <Stack direction="row" spacing={1} justifyContent="center" mt={2}>
        <Chip size="small" variant="outlined" label="Conseils d’expert" sx={{ fontWeight: 700 }} />
        <Chip size="small" variant="outlined" label="Démarches en ligne" sx={{ fontWeight: 700 }} />
      </Stack>
    </Box>
  );

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ py: 2 }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {Header}

        <RadioGroup
          name="transferOption"
          value={formik.values.transferOption}
          aria-label="Choix du mode de création d'entreprise"
        >
          <Grid container spacing={3}>
            {(["creation", "self"] as const).map((option, index) => {
              const cfg = optionConfig[option];
              const selected = formik.values.transferOption === option;

              return (
                <Grid item xs={12} md={6} key={option}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.08 }}
                    whileHover={{ y: -2 }}
                  >
                    <Paper
                      role="radio"
                      aria-checked={selected}
                      tabIndex={0}
                      sx={cardSx(selected)}
                      onClick={() => handleSelect(option)}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault();
                          handleSelect(option);
                        }
                      }}
                    >
                      {/* Badge recommandé, remonté */}
                      {cfg.recommended && (
                        <Chip
                          label="Recommandé"
                          color="primary"
                          size="small"
                          icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            position: "absolute",
                            top: -10,
                            right: 12,
                            fontWeight: 700,
                            zIndex: 2,
                            boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                          }}
                        />
                      )}

                      {/* Radio accessible */}
                      <FormControlLabel
                        value={option}
                        control={
                          <Radio
                            sx={{
                              position: "absolute",
                              top: 14,
                              left: 14,
                              "&.Mui-checked": { color: `${cfg.color}.main` },
                            }}
                            inputProps={{ "aria-label": cfg.title }}
                            checked={selected}
                            onChange={() => handleSelect(option)}
                          />
                        }
                        label={null}
                        sx={{ m: 0 }}
                      />

                      {/* En-tête carte */}
                      <Box textAlign="center" mt={2} mb={2} sx={{ color: `${cfg.color}.main` }}>
                        {cfg.icon}
                        <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mt: 1 }}>
                          {cfg.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {cfg.description}
                        </Typography>
                      </Box>

                      {/* Contenu : features OU customContent, avec garantie si présente */}
                      {(cfg.features && cfg.features.length > 0) ? (
                        <Stack spacing={1.5} sx={{ flex: 1 }}>
                          {cfg.features.map((item, idx) => (
                            <Stack key={idx} direction="row" alignItems="flex-start" spacing={1.25}>
                              <CheckCircleIcon color="success" sx={{ fontSize: 18, mt: "2px" }} />
                              <Typography variant="body2" sx={{ lineHeight: 1.45 }}>
                                {item.text}
                              </Typography>
                            </Stack>
                          ))}
                          {cfg.guarantee && (
                            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                              <GppGoodIcon
                                sx={{
                                  fontSize: 18,
                                  color: isLight ? theme.palette.success.dark : theme.palette.success.light,
                                }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {cfg.guarantee}
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                      ) : (
                        cfg.customContent ?? null
                      )}

                      {/* Pied de carte */}
                      <Box
                        mt={3}
                        pt={3}
                        sx={{
                          borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          {cfg.caption}
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight={900}
                          color={`${cfg.color}.main`}
                          sx={{ lineHeight: 1.15 }}
                        >
                          {cfg.price}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {cfg.priceDescription}
                        </Typography>
                      </Box>
                    </Paper>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </RadioGroup>

        {/* Erreur validation */}
        <AnimatePresence>
          {formik.touched.transferOption && formik.errors.transferOption && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FormHelperText error sx={{ mt: 3, textAlign: "center", fontSize: "1rem" }}>
                {formik.errors.transferOption}
              </FormHelperText>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zone actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 6,
            gap: 2,
            flexDirection: { xs: "column-reverse", sm: "row" },
            position: "sticky",
            bottom: 0,
            pt: 2,
            background:
              isLight
                ? `linear-gradient(to top, ${alpha(theme.palette.background.paper, 0.96)} 60%, transparent)`
                : `linear-gradient(to top, ${alpha(theme.palette.background.paper, 0.9)} 60%, transparent)`,
            backdropFilter: "blur(6px)",
            zIndex: 1,
          }}
        >
          <Button
            variant="outlined"
            onClick={onBack}
            startIcon={<ArrowBackIcon />}
            sx={{ minWidth: 140, borderRadius: 2, height: 48, flex: { xs: 1, sm: 0 }, fontWeight: 600 }}
          >
            Précédent
          </Button>

          <Button
            type="submit"
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            disabled={!formik.values.transferOption}
            sx={{
              minWidth: 160,
              borderRadius: 2,
              height: 48,
              fontWeight: 700,
              fontSize: "1rem",
            }}
          >
            Continuer
          </Button>
        </Box>
      </motion.div>
    </Box>
  );
};

export default StepEnterpriseTransfer;

import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Radio,
  Typography,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Chip,
  FormHelperText,
  Tooltip,
  useMediaQuery,
  useTheme,
  alpha,
  IconButton,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  Zoom,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RecommendIcon from "@mui/icons-material/Recommend";
import CompareIcon from "@mui/icons-material/Compare";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import MailIcon from "@mui/icons-material/Mail";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";

import { FormData } from "./types/form";

interface StepCourrierOptionsProps {
  data: Partial<FormData>;
  onChange: (data: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

type OfferId = "classic" | "starter" | "business" | "premium";

type Offer = {
  id: OfferId;
  title: string;
  summary?: string;
  priceText: string;
  priceNum: number;
  highlight?: boolean;
  options: Record<string, boolean | string>;
};

const baseOffers: Offer[] = [
  {
    id: "classic",
    title: "Classic",
    summary: "Retrait sur place uniquement",
    priceText: "20€ HT/mois",
    priceNum: 20,
    highlight: false,
    options: {
      "Retrait sur place": true,
      "Scan du courrier": false,
      "Réexpédition": false,
      "Notification email": false,
      "Suivi postal": false,
      "Stockage 3 mois": true,
    },
  },
  {
    id: "starter",
    title: "Starter",
    summary: "Scan uniquement, sans réexpédition",
    priceText: "30€ HT/mois",
    priceNum: 30,
    highlight: false,
    options: {
      "Retrait sur place": true,
      "Scan du courrier": true,
      "Réexpédition": false,
      "Notification email": true,
      "Suivi postal": false,
      "Stockage 6 mois": true,
    },
  },
  {
    id: "business",
    title: "Business",
    summary: "Scan + réexpédition mensuelle",
    priceText: "35€ HT/mois",
    priceNum: 35,
    highlight: true,
    options: {
      "Retrait sur place": true,
      "Scan du courrier": true,
      "Réexpédition": "mensuelle",
      "Notification email": true,
      "Suivi postal": true,
      "Stockage 12 mois": true,
      "Support prioritaire": true,
    },
  },
  {
    id: "premium",
    title: "Premium",
    summary: "Scan + réexpédition hebdomadaire",
    priceText: "40€ HT/mois",
    priceNum: 40,
    highlight: false,
    options: {
      "Retrait sur place": true,
      "Scan du courrier": true,
      "Réexpédition": "hebdomadaire",
      "Notification email": true,
      "Suivi postal": true,
      "Stockage illimité": true,
      "Support prioritaire": true,
      "Numérisation avancée": true,
    },
  },
];

const DISCOUNT_BY_FREQ: Record<string, number> = {
  annuelle: 0.1,
  trimestrielle: 0.05,
  mensuelle: 0,
};

const formatEuros = (value: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);

const StepCourrierOptions: React.FC<StepCourrierOptionsProps> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const mode = theme.palette.mode; // "light" | "dark"
  const [compareOpen, setCompareOpen] = useState(false);

  const freq = data.frequencePaiement ?? "mensuelle";
  const discount = DISCOUNT_BY_FREQ[freq] ?? 0;

  const offers = useMemo(() => {
    return baseOffers.map((o) => {
      const remised = o.priceNum * (1 - discount);
      const display =
        discount > 0
          ? `${formatEuros(remised)} HT/mois (-${Math.round(discount * 100)}%)`
          : `${formatEuros(o.priceNum)} HT/mois`;
      return {
        ...o,
        priceNum: remised,
        priceText: display,
      };
    });
  }, [discount]);

  const formik = useFormik({
    initialValues: {
      courrierOption: (data?.courrierOption as OfferId) || "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      courrierOption: Yup.string()
        .oneOf(["classic", "starter", "business", "premium"], "Option invalide.")
        .required("Veuillez sélectionner une offre."),
    }),
    onSubmit: (values) => {
      const offer = offers.find((o) => o.id === (values.courrierOption as OfferId));
      onChange({
        courrierOption: values.courrierOption as OfferId,
        libelleOffreCourrier: offer?.title ?? "",
        prixOffreCourrier: offer?.priceText ?? "",
        prixOffreCourrierNum: offer?.priceNum ?? 0,
      });
      onNext();
    },
  });

  const handleSelect = (offerId: OfferId) => {
    formik.setFieldValue("courrierOption", offerId, true);
    const offer = offers.find((o) => o.id === offerId);
    onChange({
      courrierOption: offerId,
      libelleOffreCourrier: offer?.title ?? "",
      prixOffreCourrier: offer?.priceText ?? "",
      prixOffreCourrierNum: offer?.priceNum ?? 0,
    });
  };

  const cardSx = (selected: boolean, highlight?: boolean) => ({
    position: "relative",
    height: "100%",
    borderRadius: 3,
    transition: "all 0.3s ease",
    background: selected
      ? alpha(theme.palette.primary.main, 0.05)
      : alpha(theme.palette.background.paper, 0.9),
    backdropFilter: "blur(20px)",
    border: `2px solid ${
      selected
        ? theme.palette.primary.main
        : highlight
        ? alpha(theme.palette.secondary.main, 0.3)
        : alpha(theme.palette.divider, 0.1)
    }`,
    boxShadow: selected
      ? `0 16px 48px ${alpha(theme.palette.primary.main, 0.15)}`
      : `0 8px 32px ${alpha(theme.palette.common.black, 0.05)}`,
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.2)}`,
      cursor: "pointer",
      borderColor: alpha(theme.palette.primary.main, 0.5),
    },
  });

  const allFeatures = useMemo(() => {
    const set = new Set<string>();
    baseOffers.forEach((o) => Object.keys(o.options).forEach((k) => set.add(k)));
    return Array.from(set);
  }, []);

  const renderFeatureCell = (value: boolean | string | undefined) => {
    if (value === true) {
      return (
        <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="center">
          <CheckCircleIcon fontSize="small" color="success" />
          <Typography variant="body2">Inclus</Typography>
        </Stack>
      );
    }
    if (value === false || value === undefined) {
      return (
        <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="center" sx={{ opacity: 0.5 }}>
          <CancelIcon fontSize="small" color="disabled" />
          <Typography variant="body2">Non</Typography>
        </Stack>
      );
    }
    return (
      <Stack direction="row" alignItems="center" spacing={0.75} justifyContent="center">
        <CheckCircleIcon fontSize="small" color="success" />
        <Typography variant="body2" fontWeight={600}>
          {String(value)}
        </Typography>
      </Stack>
    );
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      {/* Header Section */}
      <Box textAlign="center" mb={6}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <MailIcon sx={{ fontSize: 40, color: "white" }} />
        </Box>

        <Typography
          variant="h3"
          fontWeight={800}
          gutterBottom
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 2,
          }}
        >
          Gestion de Courrier Professionnelle
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            maxWidth: 600,
            mx: "auto",
            lineHeight: 1.6,
            fontSize: "1.2rem",
          }}
        >
          Choisissez la formule qui correspond à vos besoins. Service complet pour une gestion optimale de votre
          courrier d'entreprise.
        </Typography>

        <Box mt={3}>
          <Chip
            label={discount > 0 ? `-${Math.round(discount * 100)}% en paiement ${freq}` : "Tarifs mensuels HT"}
            color={discount > 0 ? "secondary" : "default"}
            variant="outlined"
            sx={{ fontWeight: 700, mr: 2 }}
          />
          <Tooltip title="Comparez toutes les offres en détail">
            <Button
              variant="outlined"
              size="small"
              startIcon={<CompareIcon />}
              onClick={() => setCompareOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              Comparer
            </Button>
          </Tooltip>
        </Box>
      </Box>

      <form onSubmit={formik.handleSubmit} noValidate>
        <FormControl
          component="fieldset"
          fullWidth
          error={Boolean(formik.touched.courrierOption && formik.errors.courrierOption)}
        >
          <RadioGroup
            name="courrierOption"
            value={formik.values.courrierOption}
            onChange={(e) => handleSelect(e.target.value as OfferId)}
            aria-label="Options de gestion du courrier"
          >
            <Grid container spacing={3}>
              {offers.map((offer) => {
                const selected = formik.values.courrierOption === offer.id;

                // Couleur de prix BUSINESS plus lisible en mode clair
                const businessPriceColor =
                  offer.id === "business"
                    ? mode === "light"
                      ? theme.palette.secondary.dark
                      : theme.palette.secondary.light
                    : undefined;

                return (
                  // COLONNES PLUS LARGES : 3 cartes par ligne en desktop
                  <Grid item xs={12} md={6} lg={4} key={offer.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      whileHover={{ y: -5 }}
                    >
                      <Card onClick={() => handleSelect(offer.id)} sx={cardSx(selected, offer.highlight)}>
                        <CardContent sx={{ p: 4, height: "100%", display: "flex", flexDirection: "column" }}>
                          {/* Header */}
                          <Box sx={{ position: "relative", mb: 3, pt: 1 }}>
                            {offer.highlight && (
                              <Chip
                                icon={<RecommendIcon />}
                                label="Recommandé"
                                color="primary"
                                size="small"
                                sx={{
                                  position: "absolute",
                                  top: -24,              // ↑ remonté
                                  right: 8,
                                  fontWeight: 700,
                                  backdropFilter: "blur(10px)",
                                  zIndex: 2,
                                }}
                              />
                            )}

                            <FormControlLabel
                              value={offer.id}
                              control={
                                <Radio
                                  checked={selected}
                                  sx={{
                                    mr: 1,
                                    "&.Mui-checked": {
                                      color: "primary.main",
                                    },
                                  }}
                                />
                              }
                              label={
                                <Typography variant="h6" fontWeight={700} color={selected ? "primary.main" : "text.primary"}>
                                  {offer.title}
                                </Typography>
                              }
                              sx={{ m: 0 }}
                            />

                            {offer.summary && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, ml: 6 }}>
                                {offer.summary}
                              </Typography>
                            )}
                          </Box>

                          {/* Price — police diminuée */}
                          <Box sx={{ mb: 3, textAlign: "center" }}>
                            <Typography
                              variant="h5"                 // ↓ taille plus petite
                              fontWeight={800}
                              color={businessPriceColor ?? (offer.highlight ? "secondary.main" : "primary.main")}
                              sx={{ mb: 0.5, lineHeight: 1.2 }}
                            >
                              {offer.priceText}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Prix HT / mois {discount > 0 ? "— remise incluse" : ""}
                            </Typography>
                          </Box>

                          <Divider sx={{ mb: 3 }} />

                          {/* Features */}
                          <Box sx={{ flex: 1 }}>
                            {Object.entries(offer.options).map(([option, included]) => (
                              <Stack
                                key={option}
                                direction="row"
                                alignItems="center"
                                spacing={1.5}
                                mb={2}
                                sx={{ opacity: included ? 1 : 0.6 }}
                              >
                                {included ? (
                                  <CheckCircleIcon fontSize="small" color="success" sx={{ flexShrink: 0 }} />
                                ) : (
                                  <CancelIcon fontSize="small" color="disabled" sx={{ flexShrink: 0 }} />
                                )}
                                <Typography variant="body2">
                                  {option}
                                  {typeof included === "string" ? ` (${included})` : ""}
                                </Typography>
                              </Stack>
                            ))}
                          </Box>

                          {/* CTA */}
                          <Button variant={selected ? "contained" : "outlined"} fullWidth sx={{ mt: 3, borderRadius: 2, fontWeight: 600 }}>
                            {selected ? "Sélectionné" : "Choisir"}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                );
              })}
            </Grid>
          </RadioGroup>

          {formik.touched.courrierOption && formik.errors.courrierOption && (
            <FormHelperText sx={{ mt: 2, textAlign: "center" }}>{formik.errors.courrierOption}</FormHelperText>
          )}
        </FormControl>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 6,
            pt: 4,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          }}
        >
          <Button
            variant="outlined"
            onClick={onBack}
            startIcon={<ArrowBackIcon />}
            sx={{
              borderRadius: 3,
              minWidth: 140,
              height: 48,
              fontWeight: 600,
            }}
          >
            Précédent
          </Button>

          <Zoom in={!!formik.values.courrierOption} timeout={500}>
            <Button
              type="submit"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              disabled={!formik.values.courrierOption}
              sx={{
                minWidth: 160,
                height: 56,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: "1.1rem",
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                "&:hover": {
                  boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                  transform: "translateY(-2px)",
                },
                "&:disabled": {
                  background: alpha(theme.palette.action.disabled, 0.2),
                  color: alpha(theme.palette.action.disabled, 0.5),
                },
              }}
            >
              Continuer
            </Button>
          </Zoom>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block", textAlign: "center" }}>
          Frais postaux éventuels non inclus. Service soumis à conditions d'utilisation.
        </Typography>
      </form>

      {/* Comparison Dialog */}
      <Dialog
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: "blur(20px)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            Comparaison des offres
          </Typography>
          <IconButton onClick={() => setCompareOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Petit header explicatif pour “afficher quelque chose” immédiatement */}
        <Box sx={{ px: 3, pt: 2, pb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Retrouvez ci-dessous les fonctionnalités incluses par formule ainsi que le tarif selon votre fréquence de
            paiement.
          </Typography>
        </Box>

        <DialogContent dividers sx={{ p: 0 }}>
          <Table
            size="small"
            sx={{
              "& th, & td": {
                py: 1.5,
                px: 1.5, // ↓ padding gauche/droite réduit
                borderColor: alpha(theme.palette.divider, 0.1),
                whiteSpace: "nowrap",
              },
              "& th": {
                fontWeight: 700,
                backgroundColor: alpha(theme.palette.background.default, 0.5),
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: "28%" }}>Fonctionnalités</TableCell>
                {offers.map((o) => (
                  <TableCell key={o.id} align="center" sx={{ fontWeight: 700, minWidth: 140 }}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                      <Typography variant="body1" fontWeight={800}>
                        {o.title}
                      </Typography>
                      {o.highlight && (
                        <Chip label="Recommandé" color="primary" size="small" sx={{ fontSize: "0.7rem", height: 20 }} />
                      )}
                    </Stack>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {allFeatures.map((feature) => (
                <TableRow key={feature} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{feature}</TableCell>
                  {offers.map((o) => (
                    <TableCell key={`${o.id}-${feature}`} align="center">
                      {renderFeatureCell(o.options[feature])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}

              {/* Ligne prix récap avec contraste Business */}
              <TableRow
                sx={{
                  "& td": {
                    borderBottom: "none",
                    py: 2.5,
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                <TableCell sx={{ fontWeight: 700 }}>Tarif {discount > 0 ? `(${freq} remisé)` : "(mensuel)"}</TableCell>
                {offers.map((o) => {
                  const priceColor =
                    o.id === "business"
                      ? mode === "light"
                        ? theme.palette.secondary.dark
                        : theme.palette.secondary.light
                      : o.highlight
                      ? "secondary.main"
                      : "primary.main";
                  return (
                    <TableCell key={`${o.id}-price`} align="center">
                      <Typography fontWeight={800} color={priceColor} variant="h6" sx={{ lineHeight: 1.1 }}>
                        {o.priceText}
                      </Typography>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default StepCourrierOptions;

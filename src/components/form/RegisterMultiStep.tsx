import React, { useState, useEffect, useContext, forwardRef } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Chip,
  IconButton,
  Stack,
  Fade,
  useMediaQuery,
  Drawer,
  Fab,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";

// Steps
import StepProjectChoice from "./steps/StepProjectChoice";
import StepStatutJuridique from "./steps/StepStatutJuridique";
import StepDenomination from "./steps/StepDenomination";
import StepCoordinates from "./steps/StepCoordinates";
import StepDomiciliationAddress from "./steps/StepDomiciliationAddress";
import StepMailHandling from "./steps/StepMailHandling";
import StepRechercheEntreprise from "./steps/transfert/StepRechercheEntreprise";
import StepSummary from "./steps/StepSummary";
import StepSummaryTransfert from "./steps/transfert/StepSummaryTransfert";
import StepPaymentFrequency from "./steps/StepPaymentFrequency";
import StepPaymentInfo from "./steps/StepPaymentInfo";
import StepAccompagnementTransfert from "./steps/transfert/StepAccompagnementTransfert";
import StepEnterpriseTransfer from "./steps/StepEnterpriseTransfer";
import StepContrat from "./steps/StepContrat";

import logoCCS from "@/components/logoccs.svg";
import PromoBar from "@/layouts/layout-parts/PromoBar";
import AppFooter from "@/layouts/layout-parts/AppFooter";

// Icônes
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import MenuLeft from "@/icons/MenuLeft";
import MenuLeftRight from "@/icons/MenuLeftRight";
import ThemeIcon from "@/icons/ThemeIcon";

import { FormData, CardInfo } from "./steps/types/form";

// === Switchers (langue / direction / thème) ===
import { SettingsContext } from "@/contexts/settingsContext";
import LanguagePopover from "@/layouts/layout-parts/popovers/LanguagePopover";

const stepsCreation = [
  "Projet",
  "Statut juridique",
  "Dénomination",
  "Représentant légal",
  "Domiciliation",
  "Gestion courrier",
  "Accompagnement",
  "Récapitulatif",
  "Contrat",
  "Fréquence",
  "Paiement",
];

const stepsTransfert = [
  "Projet",
  "Recherche entreprise",
  "Représentant légal",
  "Domiciliation",
  "Gestion courrier",
  "Accompagnement",
  "Récapitulatif",
  "Contrat",
  "Fréquence",
  "Paiement",
];

const RegisterMultiStep: React.FC = () => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.up("md"));

  // Settings (thème / direction)
  const { settings, saveSettings } = useContext(SettingsContext);
  const toggleTheme = () =>
    saveSettings({
      ...settings,
      theme: settings.theme === "light" ? "dark" : "light",
    });
  const toggleDirection = () =>
    saveSettings({
      ...settings,
      direction: settings.direction === "rtl" ? "ltr" : "rtl",
    });

  const [step, setStep] = useState(0);
  const [summaryOpen, setSummaryOpen] = useState(false); // <-- Drawer mobile

  const [formData, setFormData] = useState<FormData>({
    projet: "creation",
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    statutRepr: "",
    adresseComplete: "",
    numeroRue: "",
    rue: "",
    codePostal: "",
    ville: "",
    pays: "",
    siren: "",
    siret: "",
    nomEntreprise: "",
    adresseEntreprise: "",
    statutJuridique: "",
    autreStatut: "",
    optionCourrier: "",
    libelleOffreCourrier: "",
    prixOffreCourrier: "",
    prixOffreCourrierNum: 0,
    optionTransfert: "",
    idAdresse: "",
    frequencePaiement: "mensuelle",
    amount: 9900,
    currency: "EUR",
    cardInfo: undefined,
    contratAccepte: false,
    signatureDataURL: null,
    prixAdresse: undefined, // supposé TTC en euros si défini
  });

  const currentSteps =
    formData.projet === "transfert" ? stepsTransfert : stepsCreation;

  useEffect(() => {
    setStep(0);
  }, [formData.projet]);

  const updateData = (newData: Partial<FormData>) =>
    setFormData((p) => ({ ...p, ...newData }));

  const nextStep = () =>
    setStep((s) => Math.min(s + 1, currentSteps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));
  const goto = (i: number) => i <= step && setStep(i);

  const handleSubmitFinal = (cardInfo: CardInfo) => {
    updateData({ cardInfo });
  };

  // ————— Helpers format —————
  const fmtEuro = (cents?: number) =>
    typeof cents === "number"
      ? new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
        }).format(cents / 100)
      : "—";

  const fmtMulti = (v?: string) => (v ? v : "—");

  const buildAdressePerso = () => {
    if (formData.adresseComplete) return formData.adresseComplete;
    const parts = [
      [formData.numeroRue, formData.rue].filter(Boolean).join(" "),
      [formData.codePostal, formData.ville].filter(Boolean).join(" "),
      formData.pays,
    ]
      .filter(Boolean)
      .join("\n");
    return parts;
  };

  // Prix gestion courrier
  const prixMensuelHT = formData.prixOffreCourrierNum ?? 0;
  const baseHTCents = Math.round(prixMensuelHT * 100);
  const annuelHTCents = Math.round(baseHTCents * 12 * 0.9); // -10% annuel
  const isAnnuel = formData.frequencePaiement === "annuelle";
  const prixHTCents = isAnnuel ? annuelHTCents : baseHTCents;
  const tvaCents = Math.round(prixHTCents * 0.2);
  const prixTTCCents = prixHTCents + tvaCents;

  // Synchronisation automatique du total TTC à payer
  useEffect(() => {
    // Adresse supposée TTC en euros si définie
    const adresseTtcCents =
      typeof formData.prixAdresse === "number"
        ? Math.round(formData.prixAdresse * 100)
        : 0;

    const total = prixTTCCents + adresseTtcCents;

    if (total !== formData.amount) {
      setFormData((p) => ({ ...p, amount: total }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.prixOffreCourrierNum, formData.frequencePaiement, formData.prixAdresse]);

  // —— UI de progression stylée (timeline)
  const StepLabelStyled = (label: string, index: number) => {
    const isUnlocked = index <= step;
    return (
      <Step key={label} completed={index < step}>
        <StepLabel
          role={isUnlocked ? "button" : undefined}
          tabIndex={isUnlocked ? 0 : -1}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && isUnlocked) goto(index);
          }}
          onClick={() => isUnlocked && goto(index)}
          title={!isUnlocked ? "Étape verrouillée" : undefined}
          sx={{
            cursor: isUnlocked ? "pointer" : "default",
            "& .MuiStepLabel-label": {
              fontSize: "0.95rem",
              fontWeight: index === step ? 600 : 400,
              color: isUnlocked
                ? theme.palette.primary.main
                : alpha(theme.palette.text.secondary, 0.6),
            },
            "& .MuiStepIcon-root": {
              fontSize: 28,
              color:
                index < step
                  ? theme.palette.primary.main
                  : alpha(theme.palette.text.secondary, 0.4),
              "&.Mui-active": {
                color: theme.palette.primary.main,
              },
            },
            "& .MuiStepIcon-text": {
              fontSize: 12,
              fontWeight: 700,
              fill: theme.palette.common.white,
            },
          }}
        >
          {label}
        </StepLabel>
      </Step>
    );
  };

  // ———— Composant de ligne ————
  const Row = ({
    label,
    value,
    strong,
    multiline,
  }: {
    label: string;
    value: string;
    strong?: boolean;
    multiline?: boolean;
  }) => (
    <Box
      sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 2, py: 0.5 }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ pr: 2, fontSize: "0.8rem" }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: strong ? 700 : 500,
          whiteSpace: multiline ? "pre-wrap" : "nowrap",
          textAlign: "right",
          fontSize: "0.9rem",
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  );

  // —— Résumé complet (utilisé en colonne desktop + Drawer mobile)
  const SummaryPanel = forwardRef<HTMLDivElement>((props, ref) => (
    <Paper
      ref={ref}
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: "blur(10px)",
        display: "grid",
        gap: 2.5,
        position: "sticky",
        top: 20,
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, color: "primary.main", mb: 1 }}
      >
        Récapitulatif
      </Typography>

      <Box sx={{ display: "grid", gap: 2.5 }}>
        {/* Projet */}
        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              fontSize: "0.75rem",
              letterSpacing: 0.5,
            }}
          >
            Projet
          </Typography>
          <Box sx={{ display: "grid", gap: 1, mt: 1 }}>
            <Row
              label="Type"
              value={formData.projet === "transfert" ? "Transfert" : "Création"}
            />
            {formData.optionTransfert && (
              <Row label="Accompagnement" value={formData.optionTransfert} />
            )}
          </Box>
        </Box>

        <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.2) }} />

        {/* Représentant légal */}
        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              fontSize: "0.75rem",
              letterSpacing: 0.5,
            }}
          >
            Représentant légal
          </Typography>
          <Box sx={{ display: "grid", gap: 1, mt: 1 }}>
            <Row
              label="Identité"
              value={[formData.prenom, formData.nom].filter(Boolean).join(" ")}
            />
            <Row label="Email" value={formData.email || "—"} />
            <Row label="Téléphone" value={formData.telephone || "—"} />
            <Row
              label="Adresse"
              value={fmtMulti(buildAdressePerso())}
              multiline
            />
            {formData.statutRepr && (
              <Row label="Statut" value={formData.statutRepr} />
            )}
          </Box>
        </Box>

        <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.2) }} />

        {/* Entreprise */}
        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              fontSize: "0.75rem",
              letterSpacing: 0.5,
            }}
          >
            Entreprise
          </Typography>
          <Box sx={{ display: "grid", gap: 1, mt: 1 }}>
            <Row label="Dénomination" value={formData.nomEntreprise || "—"} />
            <Row
              label="Statut juridique"
              value={formData.statutJuridique || "—"}
            />
            {formData.autreStatut && (
              <Row label="Autre statut" value={formData.autreStatut} />
            )}
            <Row label="SIREN" value={formData.siren || "—"} />
            <Row label="SIRET" value={formData.siret || "—"} />
            <Row
              label="Adresse entreprise"
              value={fmtMulti(formData.adresseEntreprise)}
              multiline
            />
          </Box>
        </Box>

        <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.2) }} />

        {/* Domiciliation */}
        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              fontSize: "0.75rem",
              letterSpacing: 0.5,
            }}
          >
            Domiciliation
          </Typography>
          <Box sx={{ display: "grid", gap: 1, mt: 1 }}>
            <Row label="Adresse sélectionnée" value={formData.idAdresse || "—"} />
            {typeof formData.prixAdresse === "number" && (
              <Row
                label="Prix adresse (TTC)"
                value={fmtEuro(Math.round((formData.prixAdresse ?? 0) * 100))}
              />
            )}
          </Box>
        </Box>

        <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.2) }} />

        {/* Gestion du courrier */}
        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              fontSize: "0.75rem",
              letterSpacing: 0.5,
            }}
          >
            Gestion du courrier
          </Typography>
          <Box sx={{ display: "grid", gap: 1, mt: 1 }}>
            <Row
              label="Offre"
              value={
                formData.libelleOffreCourrier ||
                formData.optionCourrier ||
                "—"
              }
            />
            <Row
              label="Fréquence"
              value={isAnnuel ? "Annuelle (-10%)" : "Mensuelle"}
            />
            <Row label="Montant HT" value={fmtEuro(prixHTCents)} />
            <Row label="TVA (20%)" value={fmtEuro(tvaCents)} />
            <Row label="Montant TTC" value={fmtEuro(prixTTCCents)} strong />
          </Box>
        </Box>

        <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.2) }} />

        {/* Paiement */}
        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              fontSize: "0.75rem",
              letterSpacing: 0.5,
            }}
          >
            Paiement
          </Typography>
          <Box sx={{ display: "grid", gap: 1, mt: 1 }}>
            <Row label="Devise" value={formData.currency || "EUR"} />
            <Row label="Total à régler (TTC)" value={fmtEuro(formData.amount)} strong />
          </Box>
        </Box>

        <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.2) }} />

        {/* Contrat */}
        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              fontSize: "0.75rem",
              letterSpacing: 0.5,
            }}
          >
            Contrat
          </Typography>
          <Box sx={{ display: "grid", gap: 1, mt: 1 }}>
            <Row
              label="Acceptation"
              value={formData.contratAccepte ? "Accepté" : "Non accepté"}
              strong={!!formData.contratAccepte}
            />
            <Row
              label="Signature"
              value={formData.signatureDataURL ? "Signée" : "Non signée"}
            />
          </Box>
        </Box>

        <Chip
          icon={<SecurityRoundedIcon />}
          label="Paiement 100% sécurisé"
          color="success"
          variant="filled"
          sx={{
            mt: 2,
            fontWeight: 600,
            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
          }}
        />
      </Box>
    </Paper>
  ));

  SummaryPanel.displayName = "SummaryPanel";

  // —— rendu des étapes
  const renderStep = () => {
    const common = { onNext: nextStep, onBack: prevStep, onChange: updateData };
    const S = currentSteps[step];

    if (formData.projet === "transfert") {
      switch (S) {
        case "Projet":
          return (
            <StepProjectChoice
              data={{ projet: formData.projet }}
              onChange={(d) => {
                updateData(d);
                setStep(1);
              }}
              onNext={nextStep}
            />
          );
        case "Recherche entreprise":
          return <StepRechercheEntreprise data={formData} {...common} />;
        case "Représentant légal":
          return <StepCoordinates data={formData} {...common} />;
        case "Domiciliation":
          return <StepDomiciliationAddress data={formData} {...common} />;
        case "Gestion courrier":
          return <StepMailHandling data={formData} {...common} />;
        case "Accompagnement":
          return (
            <StepAccompagnementTransfert
              data={{ transferOption: formData.optionTransfert }}
              onChange={(v: { transferOption: string }) =>
                updateData({ optionTransfert: v.transferOption })
              }
              onNext={nextStep}
              onBack={prevStep}
            />
          );
        case "Récapitulatif":
          return (
            <StepSummaryTransfert
              data={formData}
              onBack={prevStep}
              onEdit={() => setStep(1)}
              onNext={nextStep}
            />
          );
        case "Contrat":
          return (
            <StepContrat
              data={formData}
              contratAccepte={formData.contratAccepte}
              signatureDataURL={formData.signatureDataURL}
              onAccept={(accepted) => updateData({ contratAccepte: accepted })}
              onSignatureChange={(url) => updateData({ signatureDataURL: url })}
              onBack={prevStep}
              onNext={nextStep}
            />
          );
        case "Fréquence":
          return (
            <StepPaymentFrequency
              data={{
                frequencePaiement: formData.frequencePaiement,
                prixOffreCourrierNum: formData.prixOffreCourrierNum,
              }}
              onChange={updateData}
              onBack={prevStep}
              onNext={nextStep}
            />
          );
        case "Paiement":
          return (
            <StepPaymentInfo
              onBack={prevStep}
              data={{
                amount:
                  typeof formData.amount === "number"
                    ? formData.amount / 100
                    : undefined,
                currency: formData.currency,
                cardInfo: formData.cardInfo,
              }}
              onSubmit={handleSubmitFinal}
            />
          );
      }
    } else {
      switch (S) {
        case "Projet":
          return (
            <StepProjectChoice
              data={{ projet: formData.projet }}
              onChange={(d) => {
                updateData(d);
                setStep(1);
              }}
              onNext={nextStep}
            />
          );
        case "Statut juridique":
          return <StepStatutJuridique data={formData} {...common} />;
        case "Dénomination":
          return <StepDenomination data={formData} {...common} />;
        case "Représentant légal":
          return <StepCoordinates data={formData} {...common} />;
        case "Domiciliation":
          return <StepDomiciliationAddress data={formData} {...common} />;
        case "Gestion courrier":
          return <StepMailHandling data={formData} {...common} />;
        case "Accompagnement":
          return (
            <StepEnterpriseTransfer
              data={{ transferOption: formData.optionTransfert }}
              onChange={(v: { transferOption: string }) =>
                updateData({ optionTransfert: v.transferOption })
              }
              onNext={nextStep}
              onBack={prevStep}
            />
          );
        case "Récapitulatif":
          return (
            <StepSummary
              data={formData}
              onBack={prevStep}
              onEdit={() => setStep(1)}
              onNext={nextStep}
            />
          );
        case "Contrat":
          return (
            <StepContrat
              data={formData}
              contratAccepte={formData.contratAccepte}
              signatureDataURL={formData.signatureDataURL}
              onAccept={(accepted) => updateData({ contratAccepte: accepted })}
              onSignatureChange={(url) => updateData({ signatureDataURL: url })}
              onBack={prevStep}
              onNext={nextStep}
            />
          );
        case "Fréquence":
          return (
            <StepPaymentFrequency
              data={{
                frequencePaiement: formData.frequencePaiement,
                prixOffreCourrierNum: formData.prixOffreCourrierNum,
              }}
              onChange={updateData}
              onBack={prevStep}
              onNext={nextStep}
            />
          );
        case "Paiement":
          return (
            <StepPaymentInfo
              onBack={prevStep}
              data={{
                amount:
                  typeof formData.amount === "number"
                    ? formData.amount / 100
                    : undefined,
                currency: formData.currency,
                cardInfo: formData.cardInfo,
              }}
              onSubmit={handleSubmitFinal}
            />
          );
      }
    }

    return <Typography>Étape inconnue</Typography>;
  };

  return (
    <>
      <PromoBar
        message="🔥 Promotion de rentrée : -10% sur le paiement annuel !"
        ctaLabel="J'en profite"
        ctaHref="/offres"
      />

      {/* Header avec contrôles */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton
            aria-label="Retour"
            onClick={prevStep}
            disabled={step === 0}
            sx={{
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.2),
              "&:disabled": { opacity: 0.5 },
            }}
          >
            <ArrowBackIosNewRoundedIcon />
          </IconButton>
        </Box>

        <Stack direction="row" alignItems="center" spacing={1}>
          <LanguagePopover />
          <IconButton
            onClick={toggleDirection}
            size="small"
            aria-label={settings.direction === "rtl" ? "Passer en LTR" : "Passer en RTL"}
          >
            {settings.direction === "rtl" ? (
              <MenuLeft sx={{ color: "grey.600" }} />
            ) : (
              <MenuLeftRight sx={{ color: "grey.600" }} />
            )}
          </IconButton>
          <IconButton onClick={toggleTheme} size="small" aria-label="Changer le thème">
            <ThemeIcon />
          </IconButton>
          <IconButton
            aria-label="Contact"
            sx={{
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.2),
            }}
          >
            <PhoneRoundedIcon />
          </IconButton>
        </Stack>
      </Box>

      <Box
        sx={{
          minHeight: "100vh",
          background: theme.palette.background.default,
          py: 2,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "90%",
            maxWidth: 1600,
          }}
        >
          <Grid container spacing={4}>
            {/* Colonne gauche : timeline + logo - visible seulement sur grands écrans */}
            {isLargeScreen && (
              <Grid item md={2}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: "blur(10px)",
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    position: "sticky",
                    top: 100,
                  }}
                >
                  <Box
                    component="img"
                    src={logoCCS}
                    alt="CCS"
                    sx={{ height: 60, width: "auto", mb: 3 }}
                  />

                  <Stepper
                    activeStep={step}
                    orientation="vertical"
                    sx={{
                      "& .MuiStepConnector-line": {
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      },
                    }}
                  >
                    {currentSteps.map((s, i) => StepLabelStyled(s, i))}
                  </Stepper>

                  <Box sx={{ mt: 4, display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckCircleRoundedIcon color="success" fontSize="small" />
                    <Typography variant="caption" color="text.secondary">
                      Processus sécurisé
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            )}

            {/* Colonne centrale - espace principal adaptatif */}
            <Grid item xs={12} md={isLargeScreen ? 7 : 12} lg={isLargeScreen ? 7 : 12}>
              <Fade in timeout={500}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    background: alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: "blur(10px)",
                    minHeight: 600,
                  }}
                >
                 {/* Stepper horizontal : uniquement sur md (pas sur mobile, pas sur desktop lg) */}
{isMediumScreen && !isLargeScreen && (
  <Box sx={{ mb: 4 }}>
    <Stepper activeStep={step} alternativeLabel>
      {currentSteps.map((label, index) => (
        <Step key={label}>
          <StepLabel>
            {index === step ? `${label} (${step + 1}/${currentSteps.length})` : ""}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  </Box>
)}

                  {renderStep()}
                </Paper>
              </Fade>
            </Grid>

            {/* Colonne récapitulative - visible sur écrans moyens et grands */}
            {isMediumScreen && (
              <Grid item xs={12} md={5} lg={3}>
                <Fade in timeout={700}>
                  <div>
                    <SummaryPanel />
                  </div>
                </Fade>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>

      {/* FAB + Drawer pour mobile */}
      {!isMediumScreen && (
        <>
          <Fab
            variant="extended"
            color="primary"
            onClick={() => setSummaryOpen(true)}
            sx={{
              position: "fixed",
              right: 16,
              bottom: 16,
              zIndex: 1500,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: 6,
            }}
            aria-label="Ouvrir le récapitulatif"
          >
            Récapitulatif
          </Fab>

          <Drawer
            anchor="bottom"
            open={summaryOpen}
            onClose={() => setSummaryOpen(false)}
            PaperProps={{
              sx: {
                maxHeight: "85vh",
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                p: 2,
              },
            }}
          >
            <Box sx={{ textAlign: "center", fontWeight: 800, mb: 1 }}>Récapitulatif</Box>
            <SummaryPanel />
            <Box sx={{ height: 8 }} />
          </Drawer>
        </>
      )}

      <AppFooter />
    </>
  );
};

export default RegisterMultiStep;

import React from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  IconButton,
  useTheme,
  alpha,
  Chip,
  Fade,
  Collapse,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  MailOutline as MailOutlineIcon,
  Domain as DomainIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { FormData, SectionEditable } from "./types/form";

interface StepSummaryProps {
  data: FormData;
  onBack: () => void;
  onNext: () => void;
  onEdit: (section: SectionEditable) => void;
}

const InfoBlock: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  onEdit?: () => void;
  completed?: boolean;
  required?: boolean;
}> = ({ label, value, icon, onEdit, completed = true, required = false }) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        p={3}
        borderRadius={2}
        sx={{
          backgroundColor: completed
            ? alpha(theme.palette.primary.main, 0.03)
            : alpha(theme.palette.warning.main, 0.05),
          border: `1px solid ${
            completed
              ? alpha(theme.palette.primary.main, 0.1)
              : alpha(theme.palette.warning.main, 0.3)
          }`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          whiteSpace: "pre-line",
          position: "relative",
          overflow: "hidden",
          "&:hover": {
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
            transform: "translateY(-2px)",
            transition: "all 0.2s ease-in-out",
          },
        }}
      >
        <Box display="flex" alignItems="flex-start" gap={2} flex={1}>
          <Box
            sx={{
              color: completed ? "primary.main" : "warning.main",
              mt: 0.5,
            }}
          >
            {icon}
          </Box>
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography fontWeight="bold" fontSize="1rem">
                {label}
              </Typography>
              {required && !completed && (
                <Chip
                  label="Requis"
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              )}
              {completed && (
                <CheckCircleIcon
                  fontSize="small"
                  color="success"
                  sx={{ ml: 0.5 }}
                />
              )}
            </Box>
            <Typography
              variant="body2"
              color={completed ? "text.primary" : "text.secondary"}
              sx={{
                fontStyle: !completed ? "italic" : "normal",
                lineHeight: 1.6,
              }}
            >
              {value || (completed ? "Non renseigné" : "À compléter")}
            </Typography>
          </Box>
        </Box>
        {onEdit && (
          <IconButton
            onClick={onEdit}
            size="small"
            sx={{
              color: completed ? "primary.main" : "warning.main",
              alignSelf: "flex-start",
            }}
            aria-label={`Modifier ${label}`}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </motion.div>
  );
};

const StepSummary: React.FC<StepSummaryProps> = ({
  data,
  onBack,
  onEdit,
  onNext,
}) => {
  const theme = useTheme();
  
  // Vérification des champs requis
  const isNextDisabled = !data.statutJuridique || !data.libelleOffreCourrier;
  
  // Vérification de l'état de complétion de chaque section
  const sections = {
    projet: !!data.projet,
    statutJuridique: !!data.statutJuridique,
    denomination: !!data.nomEntreprise,
    representant: !!(data.prenom || data.nom || data.email || data.telephone),
    adresse: !!data.adresseComplete,
    courrier: !!data.libelleOffreCourrier,
    optionTransfert: !!data.optionTransfert,
  };

  // Formatage des coordonnées
  const formatCoordonnees = (): string => {
    const parts: string[] = [];
    if (data.prenom || data.nom) {
      parts.push(`${data.prenom ?? ""} ${data.nom ?? ""}`.trim());
    }
    if (data.email) parts.push(data.email);
    if (data.telephone) parts.push(data.telephone);
    return parts.length > 0 ? parts.join("\n") : "";
  };

  // Formatage adresse domiciliation avec prix
  const formatAdresseDomiciliation = (): string => {
    if (!data.adresseComplete) return "";
    const prix = data.prixAdresse ? `\n${data.prixAdresse} € / mois (HT)` : "";
    return `${data.adresseComplete}${prix}`;
  };

  // Formatage de l'offre courrier avec prix
  const formatOffreCourrier = (): string => {
    if (!data.libelleOffreCourrier) return "";
    const label = data.libelleOffreCourrier;
    const prix = data.prixOffreCourrier ? `${data.prixOffreCourrier} €` : "—";
    return `${label}\n${prix}`;
  };

  return (
    <Box
      sx={{
        maxHeight: "70vh",
        overflowY: "auto",
        px: { xs: 1, sm: 2 },
        py: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" fontWeight="bold" mb={1} color="primary.main">
            Récapitulatif de votre projet
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Vérifiez que toutes les informations ci-dessous sont correctes avant de finaliser.
          </Typography>
        </Box>

        <Stack spacing={3} mb={4}>
          <InfoBlock
            label="Projet choisi"
            value={
              data.projet === "creation"
                ? "Création d'entreprise"
                : data.projet === "transfert"
                ? "Transfert de siège"
                : ""
            }
            icon={<DomainIcon />}
            onEdit={() => onEdit("projet")}
            completed={sections.projet}
          />

          <InfoBlock
            label="Statut juridique"
            value={data.statutJuridique || ""}
            icon={<InfoIcon />}
            onEdit={() => onEdit("statutJuridique")}
            completed={sections.statutJuridique}
            required={true}
          />

          <InfoBlock
            label="Dénomination sociale"
            value={data.nomEntreprise || ""}
            icon={<DomainIcon />}
            onEdit={() => onEdit("denomination")}
            completed={sections.denomination}
          />

          <InfoBlock
            label="Coordonnées représentant légal"
            value={formatCoordonnees()}
            icon={<PersonIcon />}
            onEdit={() => onEdit("representant")}
            completed={sections.representant}
          />

          <InfoBlock
            label="Adresse de domiciliation"
            value={formatAdresseDomiciliation()}
            icon={<LocationOnIcon />}
            onEdit={() => onEdit("adresse")}
            completed={sections.adresse}
          />

          <InfoBlock
            label="Gestion du courrier"
            value={formatOffreCourrier()}
            icon={<MailOutlineIcon />}
            onEdit={() => onEdit("courrier")}
            completed={sections.courrier}
            required={true}
          />

          <InfoBlock
            label="Accompagnement"
            value={
              data.optionTransfert === "self"
                ? "Je m'en charge seul·e"
                : data.optionTransfert === "creation"
                ? "Accompagnement à la création"
                : data.optionTransfert === "transfert"
                ? "Accompagnement au transfert"
                : ""
            }
            icon={<InfoIcon />}
            onEdit={() => onEdit("optionTransfert")}
            completed={sections.optionTransfert}
          />
        </Stack>

        <AnimatePresence>
          {isNextDisabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Box
                sx={{
                  backgroundColor: alpha(theme.palette.warning.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                  borderRadius: 2,
                  p: 2,
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <InfoIcon color="warning" />
                <Typography variant="body2" color="warning.dark">
                  Veuillez compléter le statut juridique et la gestion du courrier pour continuer
                </Typography>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Button
            variant="outlined"
            onClick={onBack}
            startIcon={<ArrowBackIcon />}
            sx={{ minWidth: 140 }}
          >
            Précédent
          </Button>
          <Tooltip
            title={
              isNextDisabled
                ? "Veuillez compléter les sections obligatoires"
                : "Toutes les informations sont complètes"
            }
            arrow
          >
            <span>
              <Button
                variant="contained"
                onClick={onNext}
                disabled={isNextDisabled}
                endIcon={<ArrowForwardIcon />}
                sx={{ minWidth: 140 }}
              >
                Valider
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </motion.div>
    </Box>
  );
};

export default StepSummary;
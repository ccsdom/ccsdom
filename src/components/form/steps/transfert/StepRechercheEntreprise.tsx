import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Card,
  CardContent,
  Fade,
  Collapse,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RefreshIcon from "@mui/icons-material/Refresh";

// ---- Types ----
interface Etablissement {
  siret: string;
  greffeImmatriculation?: string | null;
  adresseEtablissement?: {
    complementAdresseEtablissement?: string;
    numeroVoieEtablissement?: string;
    typeVoieEtablissement?: string;
    libelleVoieEtablissement?: string;
    codePostalEtablissement?: string;
    libelleCommuneEtablissement?: string;
  };
  uniteLegale?: {
    siren: string;
    denominationUniteLegale?: string;
    dateCreationUniteLegale?: string;
    etatAdministratifUniteLegale: "A" | "C";
    categorieJuridiqueUniteLegale?: string;
    capitalSocial?: number;
  };
}

interface Dirigeant {
  nom?: string;
  prenoms?: string;
  denomination?: string;
  typeDirigeant: "personne physique" | "personne morale";
  qualite?: string;
  dateNaissance?: string;
}

interface ApiResponse {
  etablissement: Etablissement;
  dirigeants?: Dirigeant[];
}

interface FormData {
  nomEntreprise?: string;
  siren?: string;
  siret?: string;
  statutJuridique?: string;
  adresseEntreprise?: string;
}

interface Props {
  data?: Partial<FormData>;
  onNext?: () => void;
  onBack?: () => void;
  onChange: (newData: Partial<FormData>) => void;
}

// ---- Constantes & utils ----
const formeJuridiqueMap: Record<string, string> = {
  // complétez votre mapping si besoin
};

const onlyDigits = (v: string) => v.replace(/\D+/g, "");
const isSiretFormat = (v: string) => /^\d{14}$/.test(v);

/** Vérif Luhn pour 14 chiffres */
const luhnOk = (siret: string): boolean => {
  if (!isSiretFormat(siret)) return false;
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let n = parseInt(siret.charAt(i), 10);
    if (i % 2 === 0) n *= 2;
    if (n > 9) n -= 9;
    sum += n;
  }
  return sum % 10 === 0;
};

const fetchWithTimeout = async (url: string, timeoutMs = 5000) => {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
};

const formatSiret = (s: string): string =>
  s.replace(/^(\d{3})(\d{3})(\d{3})(\d{5})$/, "$1 $2 $3 $4");

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "Non renseignée";
  try {
    const [year, month, day] = dateStr.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString("fr-FR");
  } catch {
    return dateStr;
  }
};

const formatCurrency = (amount?: number): string =>
  amount?.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }) ?? "Non renseigné";

const formatAdresse = (adresse?: Etablissement["adresseEtablissement"]): string => {
  if (!adresse) return "Non renseignée";
  return [
    adresse.complementAdresseEtablissement,
    [adresse.numeroVoieEtablissement, adresse.typeVoieEtablissement, adresse.libelleVoieEtablissement]
      .filter(Boolean)
      .join(" "),
    [adresse.codePostalEtablissement, adresse.libelleCommuneEtablissement].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join("\n");
};

type Manual = {
  denomination?: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
};

// ---- Component ----
const RechercheEntrepriseParSiret: React.FC<Props> = ({ data: _dataIgnored, onNext, onBack, onChange }) => {
  const theme = useTheme();
  const [siret, setSiret] = useState<string>("");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // saisie manuelle de secours
  const [manualOpen, setManualOpen] = useState(false);
  const [manual, setManual] = useState<Manual>({});

  const siretValid = useMemo(() => luhnOk(siret), [siret]);

  const handleSearch = useCallback(async () => {
    setError(null);
    setData(null);
    if (!siretValid) {
      setError("Le numéro SIRET n'est pas valide (format/Luhn).");
      return;
    }
    setLoading(true);
    const url = `/apiEntreprise?siret=${siret}`;
    const doFetch = async () => {
      try {
        return await fetchWithTimeout(url, 5000);
      } catch {
        // retry 1 fois (timeout/erreur réseau)
        return await fetchWithTimeout(url, 5000);
      }
    };

    try {
      const response = await doFetch();
      if (response.status === 404) {
        setError("SIRET introuvable dans la base. Vous pouvez continuer et saisir les infos manuellement.");
        setManualOpen(true);
        return;
      }
      if (!response.ok) {
        const text = await response.text();
        let message = "Erreur lors de la récupération des données.";
        try {
          const maybe = JSON.parse(text);
          message = maybe?.error ?? message;
        } catch {
          if (text) message = text;
        }
        throw new Error(message);
      }
      const json: ApiResponse = await response.json();
      setData(json);
    } catch (e) {
      setError(
        "Impossible de récupérer les données (API INSEE indisponible ou délai dépassé). " +
          "Vous pouvez continuer et compléter les informations manuellement."
      );
      setManualOpen(true);
    } finally {
      setLoading(false);
    }
  }, [siretValid, siret]);

  // Propage vers le parent quand on a des données auto
  useEffect(() => {
    if (data?.etablissement?.uniteLegale) {
      onChange({
        nomEntreprise: data.etablissement.uniteLegale.denominationUniteLegale || "",
        siren: data.etablissement.uniteLegale.siren || "",
        siret: data.etablissement.siret || "",
        statutJuridique: data.etablissement.uniteLegale.categorieJuridiqueUniteLegale || "",
        adresseEntreprise: formatAdresse(data.etablissement.adresseEtablissement) || "",
      });
    }
  }, [data, onChange]);

  const handleCopy = () => {
    if (siret) {
      navigator.clipboard.writeText(siret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const denomination =
    data?.etablissement.uniteLegale?.denominationUniteLegale || manual.denomination || "Nom non disponible";
  const formeJuridiqueCode = data?.etablissement.uniteLegale?.categorieJuridiqueUniteLegale || "";
  const formeJuridiqueLibelle = formeJuridiqueMap[formeJuridiqueCode] || formeJuridiqueCode || "Non renseignée";
  const capitalSocial = formatCurrency(data?.etablissement.uniteLegale?.capitalSocial);
  const greffe = data?.etablissement.greffeImmatriculation || "Non renseigné";

  // Peut-on passer à l'étape suivante ?
  const canContinue =
    // 1) SIRET valide (même si API down) → autorisé
    siretValid ||
    // 2) Ou bien on a eu des données via l'API
    !!data;

  const continuePayload = (): Partial<FormData> => {
    // Si on a des données API, priorité à celles-ci
    if (data?.etablissement) {
      return {
        nomEntreprise: data.etablissement.uniteLegale?.denominationUniteLegale || manual.denomination || "",
        siren: data.etablissement.uniteLegale?.siren || "",
        siret,
        statutJuridique: data.etablissement.uniteLegale?.categorieJuridiqueUniteLegale || "",
        adresseEntreprise:
          formatAdresse(data.etablissement.adresseEtablissement) ||
          [manual.adresse, [manual.codePostal, manual.ville].filter(Boolean).join(" ")].filter(Boolean).join("\n"),
      };
    }
    // Sinon, on envoie au moins le SIRET + ce que l’utilisateur a tapé
    return {
      nomEntreprise: manual.denomination || "",
      siret,
      adresseEntreprise:
        [manual.adresse, [manual.codePostal, manual.ville].filter(Boolean).join(" ")].filter(Boolean).join("\n") ||
        "",
    };
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 3 }}>
      {/* Header Section */}
      <Box textAlign="center" mb={6}>
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
          Recherche d'entreprise par SIRET
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
          Entrez le numéro SIRET de l'entreprise que vous souhaitez transférer
        </Typography>
      </Box>

      {/* Search Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField
            label="Numéro SIRET"
            value={siret}
            onChange={(e) => setSiret(onlyDigits(e.target.value).slice(0, 14))}
            inputProps={{ maxLength: 14, inputMode: "numeric" }}
            fullWidth
            error={!!error && !data}
            helperText={
              error && !data
                ? error
                : siret.length === 0
                ? "14 chiffres (ex: 81210767000034)"
                : siretValid
                ? "SIRET valide"
                : "SIRET invalide (vérification Luhn)"
            }
            disabled={loading}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: "blur(10px)",
                fontSize: "1.1rem",
                height: 56,
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Stack direction="row" spacing={1}>
            <Button
              onClick={handleSearch}
              variant="contained"
              fullWidth
              size="large"
              disabled={loading || !siretValid}
              sx={{
                height: 56,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: 16,
                textTransform: "none",
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                "&:hover": {
                  boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                  transform: "translateY(-2px)",
                },
              }}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
            >
              {loading ? "Recherche..." : "Rechercher"}
            </Button>
            <Tooltip title="Réinitialiser">
              <IconButton
                onClick={() => {
                  setData(null);
                  setError(null);
                  setManual({});
                  setManualOpen(false);
                }}
                sx={{
                  height: 56,
                  width: 56,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: alpha(theme.palette.divider, 0.2),
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Grid>
      </Grid>

      {/* Piste de saisie manuelle quand API en échec / 404 */}
      <Collapse in={!!error && !data}>
        <Alert
          severity="warning"
          sx={{
            mb: 2,
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.warning.main, 0.08),
            backdropFilter: "blur(10px)",
          }}
          action={
            <Button variant="outlined" size="small" onClick={() => setManualOpen((v) => !v)}>
              {manualOpen ? "Masquer" : "Saisie manuelle"}
            </Button>
          }
        >
          {error}
        </Alert>
      </Collapse>

      <Collapse in={manualOpen}>
        <Card
          variant="outlined"
          sx={{
            mb: 3,
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.6),
            borderColor: alpha(theme.palette.primary.main, 0.2),
            backdropFilter: "blur(10px)",
          }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Compléter manuellement
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Dénomination"
                value={manual.denomination ?? ""}
                onChange={(e) => setManual((m) => ({ ...m, denomination: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Adresse"
                value={manual.adresse ?? ""}
                onChange={(e) => setManual((m) => ({ ...m, adresse: e.target.value }))}
                multiline
                minRows={2}
                fullWidth
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Code postal"
                  value={manual.codePostal ?? ""}
                  onChange={(e) => setManual((m) => ({ ...m, codePostal: e.target.value }))}
                  sx={{ width: { xs: "100%", sm: 180 } }}
                />
                <TextField
                  label="Ville"
                  value={manual.ville ?? ""}
                  onChange={(e) => setManual((m) => ({ ...m, ville: e.target.value }))}
                  fullWidth
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Collapse>

      {/* Résultats */}
      {(data || manualOpen) && (
        <Fade in timeout={500}>
          <Box
            sx={{
              mt: 2,
              border: "2px solid",
              borderColor: alpha(theme.palette.primary.main, 0.2),
              borderRadius: 3,
              p: 4,
              backgroundColor: alpha(theme.palette.background.paper, 0.7),
              backdropFilter: "blur(20px)",
              boxShadow: `0 16px 48px ${alpha(theme.palette.primary.main, 0.15)}`,
            }}
          >
            {/* Header infos */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4} flexWrap="wrap" gap={2}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: "primary.main", mb: 2 }}>
                  {denomination}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ color: "text.secondary" }}>
                  {data?.etablissement?.uniteLegale?.dateCreationUniteLegale && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarTodayIcon fontSize="small" />
                      <Typography variant="body2">
                        Créée le {formatDate(data.etablissement.uniteLegale.dateCreationUniteLegale)}
                      </Typography>
                    </Stack>
                  )}
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <BusinessIcon fontSize="small" />
                    <Typography variant="body2">{formatSiret(siret)}</Typography>
                  </Stack>
                </Stack>
              </Box>
              <Stack direction="row" alignItems="center" spacing={1} flexShrink={0}>
                <Chip
                  label={
                    data?.etablissement.uniteLegale?.etatAdministratifUniteLegale === "A" ? "Active" : "Cessée"
                  }
                  color={data?.etablissement.uniteLegale?.etatAdministratifUniteLegale === "A" ? "success" : "error"}
                  icon={
                    data?.etablissement.uniteLegale?.etatAdministratifUniteLegale === "A" ? (
                      <CheckCircleOutlineIcon />
                    ) : (
                      <ErrorOutlineIcon />
                    )
                  }
                  sx={{ fontWeight: 700, fontSize: "0.9rem" }}
                />
                <Tooltip title={copied ? "Copié !" : "Copier le SIRET"}>
                  <IconButton
                    onClick={handleCopy}
                    size="small"
                    aria-label="Copier le SIRET"
                    sx={{
                      border: "2px solid",
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                      borderRadius: 2,
                      "&:hover": {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    {copied ? <CheckCircleOutlineIcon color="success" /> : <ContentCopyIcon />}
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            <Divider sx={{ mb: 4, borderColor: alpha(theme.palette.divider, 0.3) }} />

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Stack spacing={4}>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ display: "flex", alignItems: "center", fontWeight: 700, color: "primary.main", mb: 3 }}
                    >
                      <BusinessIcon sx={{ mr: 2 }} /> Informations juridiques
                    </Typography>
                    <Stack spacing={3}>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontWeight: 700,
                            display: "block",
                            mb: 1,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          Forme juridique
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
                          {formeJuridiqueLibelle}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontWeight: 700,
                            display: "block",
                            mb: 1,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          Capital social
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
                          {capitalSocial}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontWeight: 700,
                            display: "block",
                            mb: 1,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          Greffe d'immatriculation
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
                          {greffe}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={4}>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ display: "flex", alignItems: "center", fontWeight: 700, color: "primary.main", mb: 3 }}
                    >
                      <LocationOnIcon sx={{ mr: 2 }} /> Adresse du siège
                    </Typography>
                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.background.paper, 0.5),
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="body1" sx={{ whiteSpace: "pre-line", lineHeight: 1.6, fontWeight: 500 }}>
                          {data
                            ? formatAdresse(data.etablissement.adresseEtablissement)
                            : [manual.adresse, [manual.codePostal, manual.ville].filter(Boolean).join(" ")]
                                .filter(Boolean)
                                .join("\n") || "—"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Stack>
              </Grid>
            </Grid>

            {/* Dirigeants */}
            {data && (
              <>
                <Divider sx={{ my: 4, borderColor: alpha(theme.palette.divider, 0.3) }} />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ display: "flex", alignItems: "center", fontWeight: 700, color: "primary.main", mb: 4 }}
                  >
                    <PersonIcon sx={{ mr: 2 }} /> Dirigeants
                  </Typography>

                  {data.dirigeants && data.dirigeants.length > 0 ? (
                    <Grid container spacing={3}>
                      {data.dirigeants.map((dirigeant, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Card
                            variant="outlined"
                            sx={{
                              height: "100%",
                              borderRadius: 3,
                              backgroundColor: alpha(theme.palette.background.paper, 0.5),
                              borderColor: alpha(theme.palette.primary.main, 0.2),
                              backdropFilter: "blur(10px)",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                              },
                            }}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                                {dirigeant.typeDirigeant === "personne physique" ? (
                                  <>
                                    <Box
                                      sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: "50%",
                                        background: `linear-gradient(135deg, ${alpha(
                                          theme.palette.primary.main,
                                          0.1
                                        )} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <PersonIcon color="primary" />
                                    </Box>
                                    <Typography variant="h6" fontWeight={700}>
                                      {dirigeant.prenoms || ""} {dirigeant.nom || ""}
                                    </Typography>
                                  </>
                                ) : (
                                  <>
                                    <Box
                                      sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: "50%",
                                        background: `linear-gradient(135deg, ${alpha(
                                          theme.palette.secondary.main,
                                          0.1
                                        )} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <CorporateFareIcon color="secondary" />
                                    </Box>
                                    <Typography variant="h6" fontWeight={700}>
                                      {dirigeant.denomination || "Personne morale"}
                                    </Typography>
                                  </>
                                )}
                              </Stack>

                              <Stack spacing={2}>
                                {dirigeant.qualite && (
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{
                                        fontWeight: 700,
                                        display: "block",
                                        mb: 0.5,
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                      }}
                                    >
                                      Fonction
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {dirigeant.qualite}
                                    </Typography>
                                  </Box>
                                )}

                                {dirigeant.dateNaissance && dirigeant.typeDirigeant === "personne physique" && (
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{
                                        fontWeight: 700,
                                        display: "block",
                                        mb: 0.5,
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                      }}
                                    >
                                      Date de naissance
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {formatDate(dirigeant.dateNaissance)}
                                    </Typography>
                                  </Box>
                                )}
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Alert
                      severity="info"
                      sx={{
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.info.main, 0.1),
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      Aucun dirigeant trouvé pour cette entreprise
                    </Alert>
                  )}
                </Box>
              </>
            )}

            {/* Navigation */}
            <Box mt={6} display="flex" justifyContent="space-between" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                onClick={onBack}
                disabled={!onBack}
                sx={{
                  borderRadius: 3,
                  minWidth: 140,
                  height: 48,
                  fontWeight: 600,
                }}
              >
                Précédent
              </Button>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="text"
                  onClick={() => {
                    onChange(continuePayload());
                    onNext?.();
                  }}
                  disabled={!siretValid}
                >
                  Continuer sans auto-remplissage
                </Button>

                <Button
                  variant="contained"
                  onClick={() => {
                    onChange(continuePayload());
                    onNext?.();
                  }}
                  disabled={!canContinue}
                  sx={{
                    borderRadius: 3,
                    minWidth: 160,
                    height: 56,
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                    "&:hover": {
                      boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                      transform: "translateY(-2px)",
                    },
                  }}
                  endIcon={<ArrowForwardIcon />}
                >
                  Continuer
                </Button>
              </Stack>
            </Box>
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default RechercheEntrepriseParSiret;

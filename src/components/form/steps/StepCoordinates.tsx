import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  Paper,
  useTheme,
  alpha,
  Fade,
  Zoom,
  InputAdornment,
  Divider,
  Alert,
  Slide,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContactPageIcon from "@mui/icons-material/ContactPage";
import InfoIcon from "@mui/icons-material/Info";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

declare global {
  interface Window {
    google?: any;
  }
}

type FormValues = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresseComplete: string;
};

type Props = {
  data: Partial<FormValues>;
  onChange: (values: Partial<FormValues>) => void;
  onNext?: () => void;
  onBack?: () => void;
};

const StepCoordinates: React.FC<Props> = ({ data, onChange, onNext, onBack }) => {
  const theme = useTheme();
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [autocompleteReady, setAutocompleteReady] = useState(false);

  const formik = useFormik<FormValues>({
    enableReinitialize: true,
    initialValues: {
      nom: data.nom || "",
      prenom: data.prenom || "",
      email: data.email || "",
      telephone: data.telephone || "",
      adresseComplete: data.adresseComplete || "",
    },
    validationSchema: Yup.object({
      nom: Yup.string()
        .trim()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .required("Le nom est requis"),
      prenom: Yup.string()
        .trim()
        .min(2, "Le prénom doit contenir au moins 2 caractères")
        .required("Le prénom est requis"),
      email: Yup.string()
        .email("Email invalide")
        .required("L'email est requis"),
      telephone: Yup.string()
        .matches(/^(\+\d{1,3})?[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}$/, "Numéro de téléphone invalide"),
      adresseComplete: Yup.string()
        .min(10, "L'adresse doit être complète")
        .required("L'adresse est requise"),
    }),
    onSubmit: (values) => {
      onChange(values);
      onNext?.();
    },
  });

  useEffect(() => {
    if (!window.google || !addressInputRef.current) return;

    const autocomplete: any = new window.google.maps.places.Autocomplete(
      addressInputRef.current,
      {
        types: ["geocode"],
        componentRestrictions: { country: "fr" },
        fields: ["formatted_address", "geometry", "address_components"]
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace?.();
      if (!place?.formatted_address) return;
      formik.setFieldValue("adresseComplete", place.formatted_address);
      setAutocompleteReady(true);
    });

    return () => {
      if (window.google?.maps?.event?.clearInstanceListeners) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [formik]);

  const isFormValid = formik.isValid && formik.dirty && 
                     (autocompleteReady || formik.values.adresseComplete.length > 10);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header Section */}
      <Box textAlign="center" mb={6}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3
          }}
        >
          <ContactPageIcon sx={{ fontSize: 40, color: 'white' }} />
        </Box>
        
        <Typography 
          variant="h3" 
          fontWeight={800} 
          gutterBottom
          sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          Coordonnées du Représentant
        </Typography>
        
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ 
            maxWidth: 600, 
            mx: 'auto', 
            lineHeight: 1.6,
            fontSize: '1.2rem'
          }}
        >
          Informations personnelles du représentant légal de l'entreprise. 
          Ces coordonnées seront utilisées pour les documents officiels.
        </Typography>
      </Box>

      <Fade in timeout={500}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            background: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(20px)',
            boxShadow: `0 16px 48px ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <form onSubmit={formik.handleSubmit} noValidate>
            <Grid container spacing={3}>
              {/* Nom et Prénom */}
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} color="primary" gutterBottom>
                    Nom de famille *
                  </Typography>
                  <TextField
                    fullWidth
                    name="nom"
                    placeholder="Dupont"
                    value={formik.values.nom}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.nom && Boolean(formik.errors.nom)}
                    helperText={formik.touched.nom && formik.errors.nom}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                      }
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} color="primary" gutterBottom>
                    Prénom *
                  </Typography>
                  <TextField
                    fullWidth
                    name="prenom"
                    placeholder="Jean"
                    value={formik.values.prenom}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.prenom && Boolean(formik.errors.prenom)}
                    helperText={formik.touched.prenom && formik.errors.prenom}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                      }
                    }}
                  />
                </Box>
              </Grid>

              {/* Email et Téléphone */}
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} color="primary" gutterBottom>
                    Email professionnel *
                  </Typography>
                  <TextField
                    fullWidth
                    name="email"
                    type="email"
                    placeholder="jean.dupont@entreprise.fr"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                      }
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} color="primary" gutterBottom>
                    Téléphone
                  </Typography>
                  <TextField
                    fullWidth
                    name="telephone"
                    placeholder="+33 6 12 34 56 78"
                    value={formik.values.telephone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.telephone && Boolean(formik.errors.telephone)}
                    helperText={formik.touched.telephone && formik.errors.telephone}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                      }
                    }}
                  />
                </Box>
              </Grid>

              {/* Adresse complète */}
              <Grid item xs={12}>
                <Box>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="subtitle2" fontWeight={600} color="primary">
                      Adresse complète *
                    </Typography>
                    <Tooltip title="Saisissez l'adresse pour voir les suggestions automatiques">
                      <InfoIcon fontSize="small" color="action" />
                    </Tooltip>
                  </Box>
                  <TextField
                    fullWidth
                    inputRef={addressInputRef}
                    name="adresseComplete"
                    placeholder="Commencez à saisir votre adresse..."
                    value={formik.values.adresseComplete}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.adresseComplete && Boolean(formik.errors.adresseComplete)}
                    helperText={formik.touched.adresseComplete && formik.errors.adresseComplete}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                      }
                    }}
                  />
                  {autocompleteReady && (
                    <Chip
                      icon={<AutoAwesomeIcon />}
                      label="Adresse validée"
                      color="success"
                      size="small"
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Tips Section */}
            <Box mt={4}>
              <Button
                variant="text"
                size="small"
                startIcon={<InfoIcon />}
                onClick={() => setShowTips(!showTips)}
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                {showTips ? "Masquer les informations" : "Pourquoi ces informations ?"}
              </Button>

              <Slide in={showTips} direction="down" timeout={300}>
                <Box mt={2}>
                  <Alert 
                    severity="info" 
                    variant="outlined"
                    sx={{
                      borderRadius: 3,
                      backgroundColor: alpha(theme.palette.info.main, 0.05),
                      borderColor: alpha(theme.palette.info.main, 0.2),
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      📋 Informations requises
                    </Typography>
                    <Typography variant="body2">
                      Ces coordonnées sont essentielles pour l'immatriculation de votre entreprise 
                      et figureront sur tous les documents officiels. Assurez-vous de leur exactitude.
                    </Typography>
                  </Alert>
                </Box>
              </Slide>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              pt: 4,
              mt: 3,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`
            }}>
              {onBack && (
                <Button 
                  variant="outlined" 
                  onClick={onBack}
                  startIcon={<ArrowBackIcon />}
                  sx={{ 
                    borderRadius: 3,
                    minWidth: 140,
                    height: 48,
                    fontWeight: 600
                  }}
                >
                  Précédent
                </Button>
              )}
              
              <Zoom in={isFormValid} timeout={500}>
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  disabled={!isFormValid}
                  sx={{
                    minWidth: 160,
                    height: 56,
                    borderRadius: 3,
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                      transform: 'translateY(-2px)'
                    },
                    '&:disabled': {
                      background: alpha(theme.palette.action.disabled, 0.2),
                      color: alpha(theme.palette.action.disabled, 0.5)
                    }
                  }}
                >
                  Continuer
                </Button>
              </Zoom>
            </Box>
          </form>
        </Paper>
      </Fade>
    </Box>
  );
};

export default StepCoordinates;
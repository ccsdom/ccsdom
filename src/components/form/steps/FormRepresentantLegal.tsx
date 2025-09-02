import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  useTheme,
  alpha,
  Paper,
  Fade,
  Zoom,
  InputAdornment,
  Divider,
  Chip,
  Alert,
  Slide,
  IconButton,
  Tooltip,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoIcon from "@mui/icons-material/Info";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

interface RepresentantLegal {
  nom: string;
  prenoms: string;
  qualite: string;
  email: string;
  telephone: string;
  adresse: string;
}

interface Props {
  initialData?: RepresentantLegal;
  onNext: (data: RepresentantLegal) => void;
  onBack?: () => void;
}

const FormRepresentantLegal: React.FC<Props> = ({ initialData, onNext, onBack }) => {
  const theme = useTheme();
  const [nom, setNom] = useState(initialData?.nom || "");
  const [prenoms, setPrenoms] = useState(initialData?.prenoms || "");
  const [qualite, setQualite] = useState(initialData?.qualite || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [telephone, setTelephone] = useState(initialData?.telephone || "");
  const [adresse, setAdresse] = useState(initialData?.adresse || "");
  const [error, setError] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(false);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!window.google || !inputRef.current) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "fr" },
      fields: ["formatted_address", "geometry", "name"]
    });

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (place?.formatted_address) {
        setAdresse(place.formatted_address);
      }
    });
  }, []);

  const handleSubmit = () => {
    if (
      !nom.trim() ||
      !prenoms.trim() ||
      !qualite.trim() ||
      !email.trim() ||
      !telephone.trim() ||
      !adresse.trim()
    ) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Veuillez saisir une adresse email valide.");
      return;
    }

    if (!/^(\+\d{1,3})?[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}$/.test(telephone)) {
      setError("Veuillez saisir un numéro de téléphone valide.");
      return;
    }

    setError(null);
    onNext({ nom, prenoms, qualite, email, telephone, adresse });
  };

  const qualiteSuggestions = [
    "Président",
    "Directeur Général",
    "Gérant",
    "Associé",
    "Gérant Majoritaire",
    "Gérant Minoritaire",
    "Président du Conseil d'Administration",
    "Administrateur"
  ];

  const isFormValid = nom.trim() && prenoms.trim() && qualite.trim() && 
                     email.trim() && telephone.trim() && adresse.trim() &&
                     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
                     /^(\+\d{1,3})?[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}$/.test(telephone);

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
          <ContactPhoneIcon sx={{ fontSize: 40, color: 'white' }} />
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
          Représentant Légal
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
          Personne habilitée à représenter l'entreprise juridiquement. 
          Ces informations sont cruciales pour les documents officiels.
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
          <Grid container spacing={3}>
            {/* Nom et Prénoms */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                fullWidth
                required
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
                    backdropFilter: 'blur(10px)',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Prénoms"
                value={prenoms}
                onChange={(e) => setPrenoms(e.target.value)}
                fullWidth
                required
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
            </Grid>

            {/* Qualité / Fonction */}
            <Grid item xs={12}>
              <Box>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="subtitle2" fontWeight={600} color="primary">
                    Qualité / Fonction
                  </Typography>
                  <Tooltip title="Sélectionnez ou saisissez la fonction du représentant">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
                <TextField
                  value={qualite}
                  onChange={(e) => setQualite(e.target.value)}
                  fullWidth
                  required
                  placeholder="Ex: Gérant, Président, Directeur Général..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WorkIcon color="primary" />
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
                <Box mt={1}>
                  {qualiteSuggestions.map((suggestion, index) => (
                    <Chip
                      key={index}
                      label={suggestion}
                      variant="outlined"
                      size="small"
                      onClick={() => setQualite(suggestion)}
                      sx={{
                        m: 0.5,
                        borderRadius: 2,
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Email et Téléphone */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email professionnel"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
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
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Téléphone"
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                fullWidth
                required
                placeholder="+33 6 12 34 56 78"
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
            </Grid>

            {/* Adresse avec autocomplete */}
            <Grid item xs={12}>
              <Box>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="subtitle2" fontWeight={600} color="primary">
                    Adresse complète
                  </Typography>
                  <Tooltip title="Saisissez l'adresse pour voir les suggestions">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
                <TextField
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  fullWidth
                  inputRef={inputRef}
                  required
                  placeholder="Commencez à saisir l'adresse..."
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
              </Box>
            </Grid>
          </Grid>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 3, 
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                backdropFilter: 'blur(10px)'
              }}
            >
              {error}
            </Alert>
          )}

          {/* Tips Section */}
          <Box mt={4}>
            <Button
              variant="text"
              size="small"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => setShowTips(!showTips)}
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              {showTips ? "Masquer les informations" : "À propos du représentant légal"}
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
                    ℹ️ Rôle du représentant légal
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Le représentant légal est la personne habilitée à engager l'entreprise 
                    juridiquement. Il signe les documents officiels et représente la société 
                    auprès des administrations.
                  </Typography>
                  <Typography variant="body2">
                    Ces informations doivent correspondre exactement aux pièces d'identité officielles.
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
                variant="contained"
                onClick={handleSubmit}
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
        </Paper>
      </Fade>
    </Box>
  );
};

export default FormRepresentantLegal;
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
  alpha,
  Fade,
  Paper,
  Chip,
  Grid,
  InputAdornment,
  Alert,
  Slide,
  Zoom,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PsychologyIcon from "@mui/icons-material/Psychology";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface StepDenominationProps {
  data: { nomEntreprise?: string };
  onChange: (data: { nomEntreprise: string }) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepDenomination: React.FC<StepDenominationProps> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const theme = useTheme();
  const [characterCount, setCharacterCount] = useState(data.nomEntreprise?.length || 0);
  const [showTips, setShowTips] = useState(false);

  const nameSuggestions = [
    "Innovation",
    "Solutions",
    "Expert",
    "Pro",
    "Premium",
    "Elite",
    "Concept",
    "Vision",
    "Future",
    "Digital"
  ];

  const formik = useFormik({
    initialValues: {
      nomEntreprise: data.nomEntreprise || "",
    },
    validationSchema: Yup.object({
      nomEntreprise: Yup.string()
        .trim()
        .min(2, "La dénomination doit contenir au moins 2 caractères")
        .max(100, "La dénomination ne peut pas dépasser 100 caractères")
        .required("Veuillez saisir la dénomination sociale")
        .matches(/^[a-zA-Z0-9\s\-&àâäéèêëîïôöùûüÿçÀÂÄÉÈÊËÎÏÔÖÙÛÜŸÇ']+$/, 
          "Caractères spéciaux non autorisés (sauf - &)"),
    }),
    onSubmit: (values) => {
      onChange({ nomEntreprise: values.nomEntreprise.trim() });
      onNext();
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formik.handleChange(e);
    setCharacterCount(e.target.value.length);
  };

  const generateSuggestion = () => {
    const baseName = formik.values.nomEntreprise.trim() || "Votre";
    const randomSuffix = nameSuggestions[Math.floor(Math.random() * nameSuggestions.length)];
    const newName = `${baseName} ${randomSuffix}`.trim();
    
    formik.setFieldValue("nomEntreprise", newName);
    setCharacterCount(newName.length);
  };

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
          <CorporateFareIcon sx={{ fontSize: 40, color: 'white' }} />
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
          Nommez votre entreprise
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
          Donnez une identité à votre projet. Ce nom représentera votre entreprise 
          dans tous les documents officiels et auprès de vos clients.
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
            <Box mb={4}>
              <Typography variant="h6" fontWeight={700} gutterBottom color="primary">
                Dénomination sociale
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Le nom officiel sous lequel votre entreprise sera immatriculée
              </Typography>
              
              <TextField
                autoFocus
                fullWidth
                id="nomEntreprise"
                name="nomEntreprise"
                placeholder="Ex: Innovation Solutions SAS"
                value={formik.values.nomEntreprise}
                onChange={handleInputChange}
                onBlur={formik.handleBlur}
                error={formik.touched.nomEntreprise && Boolean(formik.errors.nomEntreprise)}
                helperText={formik.touched.nomEntreprise && formik.errors.nomEntreprise}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CorporateFareIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography 
                        variant="caption" 
                        color={characterCount > 80 ? "error" : "text.secondary"}
                      >
                        {characterCount}/100
                      </Typography>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    height: 60
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(10px)',
                  }
                }}
              />
            </Box>

            {/* Suggestions Section */}
            <Box mb={4}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight={700} color="primary">
                  Besoin d'inspiration ?
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={generateSuggestion}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Générer une suggestion
                </Button>
              </Box>

              <Grid container spacing={1}>
                {nameSuggestions.slice(0, 5).map((suggestion, index) => (
                  <Grid item key={index}>
                    <Chip
                      label={suggestion}
                      variant="outlined"
                      onClick={() => {
                        const newName = `${formik.values.nomEntreprise} ${suggestion}`.trim();
                        if (newName.length <= 100) {
                          formik.setFieldValue("nomEntreprise", newName);
                          setCharacterCount(newName.length);
                        }
                      }}
                      sx={{
                        borderRadius: 2,
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Tips Section */}
            <Box mb={4}>
              <Button
                variant="text"
                size="small"
                startIcon={<PsychologyIcon />}
                onClick={() => setShowTips(!showTips)}
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                {showTips ? "Masquer les conseils" : "Voir les conseils pour choisir"}
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
                      '& .MuiAlert-message': {
                        width: '100%'
                      }
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      💡 Conseils pour choisir votre nom
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      <li><Typography variant="body2">Soyez simple et mémorable</Typography></li>
                      <li><Typography variant="body2">Évitez les termes trop génériques</Typography></li>
                      <li><Typography variant="body2">Vérifiez la disponibilité du nom</Typography></li>
                      <li><Typography variant="body2">Pensez à l'extension .fr/.com</Typography></li>
                    </Box>
                  </Alert>
                </Box>
              </Slide>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              pt: 3,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`
            }}>
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
              
              <Zoom in={formik.isValid} timeout={500}>
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  disabled={!formik.isValid || formik.isSubmitting}
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

export default StepDenomination;
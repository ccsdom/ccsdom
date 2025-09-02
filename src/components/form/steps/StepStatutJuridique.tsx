import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  FormHelperText,
  Card,
  CardContent,
  Stack,
  Chip,
  useTheme,
  alpha,
  Fade,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FormData } from "./types/form";
import BusinessIcon from "@mui/icons-material/Business";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import StorefrontIcon from "@mui/icons-material/Storefront";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const statutOptions = [
  { 
    value: "sasu", 
    label: "SASU", 
    description: "Société par Actions Simplifiée Unipersonnelle",
    icon: <BusinessIcon />,
    features: ["Responsabilité limitée", "Souplesse de fonctionnement", "Dirigeant assimilé salarié"],
    popular: true
  },
  { 
    value: "sas", 
    label: "SAS", 
    description: "Société par Actions Simplifiée",
    icon: <AccountBalanceIcon />,
    features: ["Plusieurs associés", "Statuts sur-mesure", "Flexibilité organisationnelle"],
    popular: true
  },
  { 
    value: "micro", 
    label: "Micro-entreprise", 
    description: "Statut micro-entrepreneur (auto-entreprise)",
    icon: <StorefrontIcon />,
    features: ["Démarrage simplifié", "Régime fiscal avantageux", "Cotisations proportionnelles"],
    popular: true
  },
  { 
    value: "autre", 
    label: "Autre statut", 
    description: "Vous avez un autre statut juridique en tête ?",
    icon: <TrendingUpIcon />,
    features: ["Statut spécifique", "Besoin personnalisé", "Accompagnement expert"]
  },
];

const autresStatutsList = [
  "EURL", "SARL", "Entreprise Individuelle", "SNC", "SCP", "SCA", 
  "SELARL", "SELAS", "SCIC", "Association", "GIE", "EI"
];

interface StepStatutJuridiqueProps {
  data: Partial<FormData>;
  onChange: (data: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepStatutJuridique: React.FC<StepStatutJuridiqueProps> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const theme = useTheme();
  const [showOtherDialog, setShowOtherDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customStatut, setCustomStatut] = useState("");
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.statutJuridique && !statutOptions.some(opt => opt.value === data.statutJuridique) && 
        !autresStatutsList.includes(data.statutJuridique || "")) {
      setCustomStatut(data.statutJuridique);
    }
  }, [data.statutJuridique]);

  const formik = useFormik<Partial<FormData>>({
    initialValues: {
      statutJuridique: data.statutJuridique || "",
      autreStatut: data.autreStatut || "",
    },
    validationSchema: Yup.object({
      statutJuridique: Yup.string().required("Veuillez sélectionner un statut juridique"),
    }),
    onSubmit: (values) => {
      onChange({
        statutJuridique: values.statutJuridique || "",
        autreStatut: values.statutJuridique === "autre" ? values.autreStatut : undefined,
      });
      onNext();
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    onChange(formik.values);
  }, [formik.values, onChange]);

  const handleStatutChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    formik.setFieldValue("statutJuridique", value);
    
    if (value === "autre") {
      setShowOtherDialog(true);
    } else {
      formik.setFieldValue("autreStatut", "");
    }
  };

  const handleSelectOtherStatut = (statut: string) => {
    formik.setFieldValue("statutJuridique", statut);
    formik.setFieldValue("autreStatut", statut);
    setShowOtherDialog(false);
    setSearchTerm("");
  };

  const handleCustomStatut = () => {
    if (customStatut.trim()) {
      formik.setFieldValue("statutJuridique", customStatut.trim());
      formik.setFieldValue("autreStatut", customStatut.trim());
      setShowOtherDialog(false);
      setCustomStatut("");
    }
  };

  const filteredStatuts = autresStatutsList.filter(statut =>
    statut.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cardSx = (selected: boolean, popular?: boolean) => ({
    p: 0,
    borderRadius: 3,
    transition: 'all 0.3s ease-in-out',
    cursor: 'pointer',
    border: `2px solid ${selected ? theme.palette.primary.main : 
              popular ? alpha(theme.palette.secondary.main, 0.3) : 
              alpha(theme.palette.divider, 0.2)}`,
    background: selected 
      ? alpha(theme.palette.primary.main, 0.05) 
      : alpha(theme.palette.background.paper, 0.9),
    backdropFilter: 'blur(10px)',
    boxShadow: selected 
      ? `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}` 
      : popular
      ? `0 6px 24px ${alpha(theme.palette.secondary.main, 0.1)}`
      : `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
      borderColor: alpha(theme.palette.primary.main, 0.4),
    },
    height: '100%',
    position: 'relative',
  });

  if (data.projet !== "creation") return null;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      {/* Header Section */}
      <Box textAlign="center" mb={6}>
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
          Choisissez votre statut juridique
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
          Sélectionnez la structure qui correspond le mieux à votre projet entrepreneurial. 
          Notre équipe vous guidera dans ce choix stratégique.
        </Typography>
      </Box>

      <form onSubmit={formik.handleSubmit} noValidate>
        <RadioGroup
          name="statutJuridique"
          value={formik.values.statutJuridique}
          onChange={handleStatutChange}
        >
          <Grid container spacing={3}>
            {statutOptions.map(({ value, label, description, icon, features, popular }) => (
              <Grid item xs={12} md={6} key={value}>
                <Card
                  onClick={() => {
                    formik.setFieldValue("statutJuridique", value);
                    if (value === "autre") {
                      setShowOtherDialog(true);
                    }
                  }}
                  sx={cardSx(formik.values.statutJuridique === value, popular)}
                >
                  {popular && (
                    <Chip
                      label="Populaire"
                      color="secondary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontWeight: 700,
                        backdropFilter: 'blur(10px)',
                        backgroundColor: alpha(theme.palette.secondary.main, 0.1)
                      }}
                    />
                  )}
                  
                  <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box display="flex" alignItems="center" mb={3}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          background: formik.values.statutJuridique === value 
                            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                            : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 3
                        }}
                      >
                        {React.cloneElement(icon, { 
                          sx: { 
                            fontSize: 30, 
                            color: formik.values.statutJuridique === value ? 'white' : 'primary.main'
                          } 
                        })}
                      </Box>
                      
                      <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                          {label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {description}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ flex: 1, mb: 3 }}>
                      <Stack spacing={1.5}>
                        {features.map((feature, index) => (
                          <Box key={index} display="flex" alignItems="center" gap={1.5}>
                            <CheckCircleIcon 
                              sx={{ 
                                fontSize: 16, 
                                color: formik.values.statutJuridique === value ? 'primary.main' : 'text.secondary',
                                flexShrink: 0
                              }} 
                            />
                            <Typography variant="body2" color="text.secondary">
                              {feature}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>

                    <FormControlLabel
                      value={value}
                      control={
                        <Radio 
                          sx={{ 
                            alignSelf: 'flex-start',
                            '&.Mui-checked': {
                              color: 'primary.main',
                            }
                          }} 
                        />
                      }
                      label={null}
                      sx={{ m: 0 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </RadioGroup>

        {formik.touched.statutJuridique && formik.errors.statutJuridique && (
          <FormHelperText error sx={{ mt: 2, textAlign: 'center' }}>
            {formik.errors.statutJuridique}
          </FormHelperText>
        )}

        {/* Dialog pour sélectionner un autre statut */}
        <Dialog 
          open={showOtherDialog} 
          onClose={() => setShowOtherDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(20px)'
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            pb: 1
          }}>
            <Typography variant="h5" fontWeight={700}>
              Sélectionnez votre statut juridique
            </Typography>
            <IconButton onClick={() => setShowOtherDialog(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent>
            <TextField
              fullWidth
              placeholder="Rechercher un statut..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3, mt: 1 }}
            />
            
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {filteredStatuts.map((statut) => (
                <ListItem key={statut} disablePadding>
                  <ListItemButton 
                    onClick={() => handleSelectOtherStatut(statut)}
                    selected={formik.values.statutJuridique === statut}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      '&.Mui-selected': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        }
                      }
                    }}
                  >
                    <ListItemIcon>
                      <BusinessIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={statut} 
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    {formik.values.statutJuridique === statut && (
                      <CheckCircleIcon color="primary" />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ mt: 3, p: 2, border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Statut personnalisé
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Vous ne trouvez pas votre statut ? Saisissez-le manuellement.
              </Typography>
              
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  placeholder="Ex: SCOP, GEIE, etc."
                  value={customStatut}
                  onChange={(e) => setCustomStatut(e.target.value)}
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleCustomStatut}
                  disabled={!customStatut.trim()}
                  startIcon={<AddIcon />}
                >
                  Ajouter
                </Button>
              </Box>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setShowOtherDialog(false)}>
              Annuler
            </Button>
          </DialogActions>
        </Dialog>

        {/* Action Section */}
        <Fade in={!!formik.values.statutJuridique} timeout={500}>
          <Box sx={{ mt: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Button 
              variant="outlined" 
              onClick={onBack}
              sx={{ 
                minWidth: 120,
                borderRadius: 2,
                height: 48
              }}
            >
              Précédent
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
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
                }
              }}
            >
              Continuer
            </Button>
          </Box>
        </Fade>
      </form>
    </Box>
  );
};

export default StepStatutJuridique;
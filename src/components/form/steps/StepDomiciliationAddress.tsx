import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  FormHelperText,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Chip,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import L, { LatLngTuple, Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EuroIcon from "@mui/icons-material/Euro";

// Correction de l'icône de marqueur Leaflet
const markerIcon: Icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Adresse {
  id: string;
  centre: string;
  adresse: string;
  prixTexte: string;
  prix: number;
  position: LatLngTuple;
  features: string[];
  popular?: boolean;
}

interface FormData {
  idAdresse: string;
  adresseComplete?: string;
  prixAdresse?: number;
}

interface StepDomiciliationAddressProps {
  data: Partial<FormData>;
  onChange: (data: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const adresses: Adresse[] = [
  {
    id: "paris12",
    centre: "Paris 12e - Centre d'Affaires",
    adresse: "9 Rue Wattignies, 75012 Paris",
    prixTexte: "20€ HT / mois",
    prix: 20,
    position: [48.833726, 2.400353],
    features: [
      "Accueil professionnel",
      "Gestion du courrier incluse",
      "Accès 7j/7",
      "Espace meeting disponible",
      "Métro à proximité"
    ],
    popular: true
  },
  {
    id: "orly",
    centre: "Orly Ville - Espace Business",
    adresse: "25 Rue Edmond Rostand, 94310 Orly",
    prixTexte: "20€ HT / mois",
    prix: 20,
    position: [48.742441, 2.393309],
    features: [
      "Parking gratuit",
      "Proche aéroport",
      "Services de secrétariat",
      "Zone économique dynamique",
      "Accès RER et bus"
    ]
  },
];

const StepDomiciliationAddress: React.FC<StepDomiciliationAddressProps> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const theme = useTheme();
  const [selectedAddress, setSelectedAddress] = useState(data.idAdresse || "");

  const formik = useFormik({
    initialValues: {
      idAdresse: data.idAdresse || "",
    },
    validationSchema: Yup.object({
      idAdresse: Yup.string().required("Veuillez sélectionner une adresse de domiciliation"),
    }),
    onSubmit: (values) => {
      const selection = adresses.find((a) => a.id === values.idAdresse);
      if (selection) {
        onChange({
          ...values,
          adresseComplete: selection.adresse,
          prixAdresse: selection.prix,
        });
      } else {
        onChange(values);
      }
      onNext();
    },
  });

  const handleAddressSelect = (id: string) => {
    formik.setFieldValue("idAdresse", id);
    setSelectedAddress(id);
  };

  const selectedAdresseData = adresses.find(a => a.id === selectedAddress);

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
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
          <BusinessCenterIcon sx={{ fontSize: 40, color: 'white' }} />
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
          Domiciliation Commerciale
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
          Choisissez l'adresse prestigieuse qui représentera votre entreprise. 
          Une vitrine professionnelle pour développer votre image.
        </Typography>
      </Box>

      <form onSubmit={formik.handleSubmit} noValidate>
        <RadioGroup
          name="idAdresse"
          value={formik.values.idAdresse}
          onChange={(e) => handleAddressSelect(e.target.value)}
        >
          <Grid container spacing={4}>
            {adresses.map(({ id, centre, adresse, prixTexte, prix, position, features, popular }) => {
              const isSelected = formik.values.idAdresse === id;
              
              return (
                <Grid item xs={12} key={id}>
                  <Fade in timeout={500}>
                    <Card
                      onClick={() => handleAddressSelect(id)}
                      sx={{
                        p: 0,
                        borderRadius: 4,
                        transition: 'all 0.3s ease-in-out',
                        cursor: 'pointer',
                        border: `2px solid ${isSelected ? theme.palette.primary.main : 
                                  popular ? alpha(theme.palette.secondary.main, 0.3) : 
                                  alpha(theme.palette.divider, 0.2)}`,
                        background: isSelected 
                          ? alpha(theme.palette.primary.main, 0.05) 
                          : alpha(theme.palette.background.paper, 0.9),
                        backdropFilter: 'blur(20px)',
                        boxShadow: isSelected 
                          ? `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}` 
                          : popular
                          ? `0 6px 24px ${alpha(theme.palette.secondary.main, 0.1)}`
                          : `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                          borderColor: alpha(theme.palette.primary.main, 0.4),
                        },
                      }}
                    >
                      {popular && (
                        <Chip
                          label="Populaire"
                          color="secondary"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            zIndex: 2,
                            fontWeight: 700,
                            backdropFilter: 'blur(10px)',
                            backgroundColor: alpha(theme.palette.secondary.main, 0.1)
                          }}
                        />
                      )}

                      <CardContent sx={{ p: 4 }}>
                        <Box display="flex" alignItems="flex-start" gap={3}>
                          {/* Radio Button */}
                          <FormControlLabel
                            value={id}
                            control={
                              <Radio 
                                sx={{ 
                                  mt: -1,
                                  '&.Mui-checked': {
                                    color: 'primary.main',
                                  }
                                }} 
                              />
                            }
                            label={null}
                          />

                          {/* Content */}
                          <Box sx={{ flex: 1 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                              <Box>
                                <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
                                  {centre}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  <LocationOnIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                  {adresse}
                                </Typography>
                              </Box>
                              
                              <Chip
                                icon={<EuroIcon />}
                                label={prixTexte}
                                color="primary"
                                variant={isSelected ? "filled" : "outlined"}
                                sx={{ 
                                  fontWeight: 700,
                                  backgroundColor: isSelected 
                                    ? alpha(theme.palette.primary.main, 0.1) 
                                    : 'transparent'
                                }}
                              />
                            </Box>

                            {/* Features */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                              {features.map((feature, index) => (
                                <Grid item xs={12} sm={6} key={index}>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <CheckCircleIcon 
                                      sx={{ 
                                        fontSize: 16, 
                                        color: isSelected ? 'primary.main' : 'text.secondary',
                                        flexShrink: 0
                                      }} 
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                      {feature}
                                    </Typography>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>

                            {/* Map */}
                            <Box sx={{ height: 200, width: "100%", borderRadius: 3, overflow: 'hidden' }}>
                              <MapContainer
                                center={position}
                                zoom={15}
                                scrollWheelZoom={false}
                                style={{ height: "100%", width: "100%" }}
                                zoomControl={false}
                              >
                                <TileLayer
                                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={position} icon={markerIcon}>
                                  <Popup>{centre}</Popup>
                                </Marker>
                              </MapContainer>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              );
            })}
          </Grid>
        </RadioGroup>

        {formik.touched.idAdresse && formik.errors.idAdresse && (
          <FormHelperText error sx={{ mt: 2, textAlign: 'center' }}>
            {formik.errors.idAdresse}
          </FormHelperText>
        )}

        {/* Selection Summary */}
        {selectedAdresseData && (
          <Fade in timeout={500}>
            <Paper
              sx={{
                mt: 4,
                p: 3,
                borderRadius: 3,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                background: alpha(theme.palette.success.main, 0.05),
                backdropFilter: 'blur(10px)'
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <CheckCircleIcon color="success" />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} color="success.main">
                    Adresse sélectionnée
                  </Typography>
                  <Typography variant="body2">
                    {selectedAdresseData.adresse}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Fade>
        )}

        {/* Action Buttons */}
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          mt: 6,
          pt: 4,
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
          
          <Zoom in={!!formik.values.idAdresse} timeout={500}>
            <Button
              type="submit"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              disabled={!formik.values.idAdresse}
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
    </Box>
  );
};

export default StepDomiciliationAddress;
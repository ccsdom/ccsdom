import React from "react";
import { 
  Box, 
  Button, 
  Typography, 
  Stack, 
  Card, 
  CardContent, 
  Chip,
  useTheme,
  alpha,
  Fade
} from "@mui/material";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// Import du type centralisé pour garantir la cohérence dans le formulaire
import { FormData } from "./types/form";

interface StepProjectChoiceProps {
  data: Partial<FormData>;
  onChange: (newData: Partial<FormData>) => void;
  onNext: () => void;
}

const StepProjectChoice: React.FC<StepProjectChoiceProps> = ({ data, onChange, onNext }) => {
  const theme = useTheme();

  const handleSelect = (projet: string) => {
    onChange({ projet });
  };

  const handleNextClick = () => {
    if (!data.projet) {
      alert("Veuillez choisir un projet pour continuer.");
      return;
    }
    onNext();
  };

  const cardSx = (selected: boolean, type: 'creation' | 'transfert') => ({
    p: 0,
    borderRadius: 3,
    transition: 'all 0.3s ease-in-out',
    cursor: 'pointer',
    border: `2px solid ${selected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.2)}`,
    background: selected 
      ? alpha(theme.palette.primary.main, 0.05) 
      : alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(10px)',
    boxShadow: selected 
      ? `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}` 
      : `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
      borderColor: alpha(theme.palette.primary.main, 0.4),
    },
    height: '100%',
  });

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header Section */}
      <Box textAlign="center" mb={6}>
        <Typography 
          variant="h3" 
          fontWeight={800} 
          gutterBottom
          color="primary.main"
          sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          Donnez vie à votre projet d'entreprise
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
          Choisissez le parcours qui correspond à votre ambition entrepreneuriale
        </Typography>
      </Box>

      {/* Options Grid */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={3} mb={6}>
        {/* Création d'entreprise */}
        <Box sx={{ flex: 1 }}>
          <Card
            onClick={() => handleSelect("creation")}
            sx={cardSx(data.projet === "creation", 'creation')}
          >
            <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box textAlign="center" mb={3}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3
                  }}
                >
                  <BusinessCenterIcon 
                    sx={{ 
                      fontSize: 40, 
                      color: data.projet === "creation" ? 'primary.main' : 'text.secondary'
                    }} 
                  />
                </Box>
                
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Création d'entreprise
                </Typography>
                
                <Chip 
                  label="Démarrage" 
                  color="primary" 
                  variant={data.projet === "creation" ? "filled" : "outlined"}
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Box>

              <Box sx={{ flex: 1, mb: 3 }}>
                <Stack spacing={2}>
                  {[
                    "Création de société de A à Z",
                    "Immatriculation au registre du commerce",
                    "Accompagnement juridique complet",
                    "Solutions sur-mesure pour entrepreneurs"
                  ].map((item, index) => (
                    <Box key={index} display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: theme.palette.primary.main,
                          flexShrink: 0
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Button
                variant={data.projet === "creation" ? "contained" : "outlined"}
                fullWidth
                size="large"
                startIcon={<RocketLaunchIcon />}
                sx={{ 
                  borderRadius: 2,
                  height: 48,
                  fontWeight: 600
                }}
              >
                Choisir cette option
              </Button>
            </CardContent>
          </Card>
        </Box>

        {/* Transfert de siège social */}
        <Box sx={{ flex: 1 }}>
          <Card
            onClick={() => handleSelect("transfert")}
            sx={cardSx(data.projet === "transfert", 'transfert')}
          >
            <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box textAlign="center" mb={3}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3
                  }}
                >
                  <SwapHorizIcon 
                    sx={{ 
                      fontSize: 40, 
                      color: data.projet === "transfert" ? 'secondary.main' : 'text.secondary'
                    }} 
                  />
                </Box>
                
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Transfert de siège
                </Typography>
                
                <Chip 
                  label="Développement" 
                  color="secondary" 
                  variant={data.projet === "transfert" ? "filled" : "outlined"}
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Box>

              <Box sx={{ flex: 1, mb: 3 }}>
                <Stack spacing={2}>
                  {[
                    "Transfert de siège social simplifié",
                    "Gestion des formalités administratives",
                    "Accompagnement juridique expert",
                    "Optimisation fiscale et stratégique"
                  ].map((item, index) => (
                    <Box key={index} display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: theme.palette.secondary.main,
                          flexShrink: 0
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Button
                variant={data.projet === "transfert" ? "contained" : "outlined"}
                color="secondary"
                fullWidth
                size="large"
                startIcon={<TrendingUpIcon />}
                sx={{ 
                  borderRadius: 2,
                  height: 48,
                  fontWeight: 600
                }}
              >
                Choisir cette option
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* Action Section */}
      <Fade in={!!data.projet} timeout={500}>
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={handleNextClick}
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{
              minWidth: 200,
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
            Commencer l'aventure
          </Button>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            {data.projet === "creation" 
              ? "Démarrez votre entreprise en toute sérénité" 
              : "Optimisez la localisation de votre entreprise"
            }
          </Typography>
        </Box>
      </Fade>
    </Box>
  );
};

export default StepProjectChoice;
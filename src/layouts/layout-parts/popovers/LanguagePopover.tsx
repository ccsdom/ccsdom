import React, { useState } from "react";
import {
  IconButton,
  MenuItem,
  Popover,
  Box,
  Typography,
  ListItemIcon,
  ListItemText,
  Chip,
  alpha,
  useTheme,
  Fade,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  Language as LanguageIcon,
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";

// Options de langue avec codes complets pour i18n
const languageOptions = [
  { 
    code: "fr", 
    i18nCode: "fr-FR", 
    label: "Français", 
    nativeLabel: "Français",
    flag: "/static/flags/france-round.png",
    direction: "ltr" 
  },
  { 
    code: "en", 
    i18nCode: "en-US", 
    label: "English", 
    nativeLabel: "English",
    flag: "/static/flags/usa-round.png",
    direction: "ltr" 
  },
  { 
    code: "ar", 
    i18nCode: "ar-SA", 
    label: "Arabic", 
    nativeLabel: "العربية",
    flag: "/static/flags/saudi-round.png",
    direction: "rtl" 
  },
] as const;

type LanguageCode = typeof languageOptions[number]["code"];

// Normalisation de la langue
const normalizeLanguage = (lang?: string): LanguageCode => {
  const raw = (lang || "").toLowerCase();
  if (raw.startsWith("fr")) return "fr";
  if (raw.startsWith("en")) return "en";
  if (raw.startsWith("ar")) return "ar";
  return "fr"; // Français par défaut
};

const LanguagePopover: React.FC = () => {
  const theme = useTheme();
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);
  const currentLanguage = normalizeLanguage(i18n.resolvedLanguage || i18n.language);
  const currentOption = languageOptions.find(opt => opt.code === currentLanguage) || languageOptions[0];

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lang: LanguageCode) => {
    const option = languageOptions.find(opt => opt.code === lang);
    if (!option) return;

    i18n.changeLanguage(option.i18nCode).then(() => {
      // Mise à jour des attributs HTML
      document.documentElement.setAttribute("lang", option.code);
      document.documentElement.setAttribute("dir", option.direction);
      
      // Sauvegarde dans le localStorage
      try {
        localStorage.setItem("preferredLanguage", option.code);
      } catch (error) {
        console.warn("Failed to save language preference:", error);
      }
      
      // Dispatch event pour notifier d'autres composants
      window.dispatchEvent(new CustomEvent("languageChanged", { detail: option }));
      
      handleClose();
    }).catch(error => {
      console.error("Language change failed:", error);
    });
  };

  return (
    <>
      {/* Bouton de sélection de langue */}
      <IconButton
        aria-label={t("language.change")}
        onClick={handleOpen}
        size="medium"
        sx={{
          backgroundColor: open 
            ? alpha(theme.palette.primary.main, 0.1)
            : "transparent",
          borderRadius: 2,
          p: 1,
          transition: theme.transitions.create(["background-color", "transform"], {
            duration: theme.transitions.duration.short,
          }),
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.15),
            transform: "translateY(-1px)",
          },
        }}
      >
        <Box
          component="img"
          src={currentOption.flag}
          alt={currentOption.label}
          sx={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            objectFit: "cover",
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            mr: 1,
          }}
        />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            display: { xs: "none", sm: "block" },
          }}
        >
          {currentOption.code.toUpperCase()}
        </Typography>
        <ExpandMoreIcon
          sx={{
            fontSize: 16,
            color: theme.palette.text.secondary,
            ml: 0.5,
            transition: theme.transitions.create("transform", {
              duration: theme.transitions.duration.short,
            }),
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </IconButton>

      {/* Menu déroulant des langues */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            width: 240,
            borderRadius: 2,
            boxShadow: theme.shadows[4],
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(
              theme.palette.background.paper,
              0.98
            )} 100%)`,
            backdropFilter: "blur(20px)",
            mt: 1,
            p: 1,
          },
        }}
      >
        <Box sx={{ p: 1, mb: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <LanguageIcon sx={{ fontSize: 18 }} />
            {t("language.select")}
          </Typography>
        </Box>

        {languageOptions.map((option) => (
          <MenuItem
            key={option.code}
            selected={option.code === currentLanguage}
            onClick={() => changeLanguage(option.code)}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              "&:last-child": { mb: 0 },
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
              "&.Mui-selected": {
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.16),
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Box
                component="img"
                src={option.flag}
                alt={option.label}
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                }}
              />
            </ListItemIcon>
            
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {option.nativeLabel}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 500,
                    }}
                  >
                    {option.label}
                  </Typography>
                </Box>
              }
            />
            
            {option.code === currentLanguage && (
              <CheckIcon
                sx={{
                  fontSize: 18,
                  color: theme.palette.primary.main,
                  ml: 1,
                }}
              />
            )}
          </MenuItem>
        ))}

        {/* Indicateur de langue actuelle */}
        <Box
          sx={{
            px: 2,
            py: 1,
            mt: 1,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Chip
            label={t("language.current")}
            size="small"
            color="primary"
            variant="outlined"
            sx={{
              fontWeight: 600,
              fontSize: "0.7rem",
              "& .MuiChip-label": {
                px: 1,
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              display: "block",
              mt: 0.5,
            }}
          >
            {currentOption.nativeLabel} ({currentOption.label})
          </Typography>
        </Box>
      </Popover>
    </>
  );
};

export default LanguagePopover;
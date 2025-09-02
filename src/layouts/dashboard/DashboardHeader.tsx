import { Fragment, useContext, useState } from "react";
import {
  Box,
  IconButton,
  Theme,
  useMediaQuery,
  Badge,
  Tooltip,
  alpha,
  styled,
  useTheme
} from "@mui/material";
import ClickAwayListener from "@mui/material/ClickAwayListener";
// Hook custom pour gérer le layout
import useLayout from "./context/useLayout";
// Contexte des paramètres du site (thème, langue, direction)
import { SettingsContext } from "@/contexts/settingsContext";
// Icônes personnalisées
import Menu from "@/icons/Menu";
import MenuLeft from "@/icons/MenuLeft";
import ThemeIcon from "@/icons/ThemeIcon";
import Search from "@/icons/duotone/Search";
import MenuLeftRight from "@/icons/MenuLeftRight";
// Composants custom
import SearchBar from "../layout-parts/SearchBar";
import ProfilePopover from "../layout-parts/popovers/ProfilePopover";
import ServicePopover from "../layout-parts/popovers/ServicePopover";
import NotificationsPopover from "../layout-parts/popovers/NotificationsPopover";

// Styled components pour le header
const DashboardHeaderRoot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'scrolled',
})<{ scrolled?: boolean }>(({ theme, scrolled }) => ({
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.appBar,
  backdropFilter: scrolled ? 'blur(10px)' : 'none',
  backgroundColor: scrolled 
    ? alpha(theme.palette.background.paper, 0.8)
    : theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease-in-out',
}));

const StyledToolBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 2),
  minHeight: 70,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0, 1.5),
    minHeight: 60,
  },
}));

const ActionIconButton = styled(IconButton)(({ theme }) => ({
  width: 40,
  height: 40,
  margin: theme.spacing(0, 0.5),
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
  transition: theme.transitions.create(['background-color', 'transform'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:active': {
    transform: 'scale(0.95)',
  },
}));

const DashboardHeader = () => {
  const { handleOpenMobileSidebar } = useLayout();
  const [openSearchBar, setSearchBar] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { settings, saveSettings } = useContext(SettingsContext);
  const theme = useTheme();

  // Gestion du scroll pour l'effet de flou
  useState(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });

  // Detecte écrans >= sm
  const upSm = useMediaQuery((theme: Theme) => theme.breakpoints.up("sm"));
  // Detecte écrans < md (1200px)
  const downMd = useMediaQuery((theme: Theme) => theme.breakpoints.down(1200));

  // Change la direction du texte
  const handleChangeDirection = (value: "ltr" | "rtl") => {
    saveSettings({ ...settings, direction: value });
  };

  // Change le thème clair/sombre
  const handleChangeTheme = (value: "light" | "dark") => {
    saveSettings({ ...settings, theme: value });
  };

  return (
    <DashboardHeaderRoot scrolled={scrolled}>
      <StyledToolBar>
        {/* Partie gauche avec bouton menu et recherche */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Bouton d'ouverture sidebar sur petits écrans */}
          {downMd && (
            <Tooltip title="Ouvrir le menu">
              <ActionIconButton 
                onClick={handleOpenMobileSidebar} 
                aria-label="Ouvrir le menu"
                sx={{ mr: 1 }}
              >
                <Menu />
              </ActionIconButton>
            </Tooltip>
          )}

          {/* Recherche */}
          <ClickAwayListener onClickAway={() => setSearchBar(false)}>
            <Box>
              {!openSearchBar && (
                <Tooltip title="Rechercher">
                  <ActionIconButton
                    onClick={() => setSearchBar(true)}
                    aria-label="Ouvrir la barre de recherche"
                  >
                    <Search sx={{ color: "grey.500", fontSize: 20 }} />
                  </ActionIconButton>
                </Tooltip>
              )}
              <SearchBar open={openSearchBar} handleClose={() => setSearchBar(false)} />
            </Box>
          </ClickAwayListener>
        </Box>

        {/* Partie droite avec actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {/* Bouton changement direction texte */}
          <Tooltip title={settings.direction === "rtl" ? "Direction LTR" : "Direction RTL"}>
            <ActionIconButton
              onClick={() => handleChangeDirection(settings.direction === "rtl" ? "ltr" : "rtl")}
              aria-label="Changer la direction du texte"
            >
              {settings.direction === "rtl" ? (
                <MenuLeft sx={{ color: "grey.500", fontSize: 20 }} />
              ) : (
                <MenuLeftRight sx={{ color: "grey.500", fontSize: 20 }} />
              )}
            </ActionIconButton>
          </Tooltip>

          {/* Bouton changement thème */}
          <Tooltip title={`Passer en mode ${settings.theme === "light" ? "sombre" : "clair"}`}>
            <ActionIconButton
              onClick={() => handleChangeTheme(settings.theme === "light" ? "dark" : "light")}
              aria-label="Changer le thème"
            >
              <ThemeIcon 
                sx={{ 
                  color: settings.theme === "dark" ? "warning.main" : "grey.500",
                  fontSize: 20 
                }} 
              />
            </ActionIconButton>
          </Tooltip>

          {/* Popovers affichés sur écran ≥ sm */}
          {upSm && (
            <Fragment>
              <NotificationsPopover />
              <ServicePopover />
            </Fragment>
          )}

          {/* Profil utilisateur */}
          <ProfilePopover />
        </Box>
      </StyledToolBar>
    </DashboardHeaderRoot>
  );
};

export default DashboardHeader;
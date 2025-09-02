import React, { Fragment, useContext, useState } from "react";
import {
  Box,
  IconButton,
  useMediaQuery,
  Theme,
  Typography,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import ClickAwayListener from "@mui/material/ClickAwayListener";

import useLayout from "./context/useLayout";
import { SettingsContext } from "@/contexts/settingsContext";

// Icônes
import Menu from "@/icons/Menu";
import MenuLeft from "@/icons/MenuLeft";
import ThemeIcon from "@/icons/ThemeIcon";
import Search from "@/icons/duotone/Search";
import MenuLeftRight from "@/icons/MenuLeftRight";

// Composants
import SearchBar from "../layout-parts/SearchBar";
import ProfilePopover from "../layout-parts/popovers/ProfilePopover";
import ServicePopover from "../layout-parts/popovers/ServicePopover";
import NotificationsPopover from "../layout-parts/popovers/NotificationsPopover";

// Styles
import {
  DashboardHeaderRoot,
  StyledToolBar,
} from "../layout-parts/styles/header";

interface ClientDashboardHeaderProps {
  title?: string;
  notificationCount?: number; // on ne la passe plus au composant enfant
}

const ClientDashboardHeader: React.FC<ClientDashboardHeaderProps> = ({
  title,
}) => {
  const { handleOpenMobileSidebar } = useLayout();
  const [openSearchBar, setSearchBar] = useState(false);
  const { settings, saveSettings } = useContext(SettingsContext);
  const theme = useTheme();

  const upSm = useMediaQuery((t: Theme) => t.breakpoints.up("sm"));
  const downMd = useMediaQuery((t: Theme) => t.breakpoints.down(1200));
  const isMobile = useMediaQuery((t: Theme) => t.breakpoints.down("md"));

  const handleChangeDirection = (value: "ltr" | "rtl") => {
    saveSettings({ ...settings, direction: value });
  };

  const handleChangeTheme = (value: "light" | "dark") => {
    saveSettings({ ...settings, theme: value });
  };

  const [isThemeRotating, setThemeRotating] = useState(false);
  const handleThemeChangeWithAnimation = () => {
    setThemeRotating(true);
    handleChangeTheme(settings.theme === "light" ? "dark" : "light");
    setTimeout(() => setThemeRotating(false), 500);
  };

  return (
    <DashboardHeaderRoot position="sticky" elevation={2}>
      <StyledToolBar>
        {/* Sidebar mobile */}
        {downMd && (
          <Tooltip title="Ouvrir le menu">
            <IconButton
              onClick={handleOpenMobileSidebar}
              aria-label="Ouvrir la sidebar"
              size="large"
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                },
                mr: 1,
              }}
            >
              <Menu />
            </IconButton>
          </Tooltip>
        )}

        {/* Titre */}
        {title && !openSearchBar && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: "text",
              textFillColor: "transparent",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: { xs: "none", sm: "block" },
            }}
          >
            {title}
          </Typography>
        )}

        {/* Recherche */}
        <ClickAwayListener onClickAway={() => setSearchBar(false)}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexGrow: { xs: 1, sm: 0 },
              ml: { xs: 0, sm: 3 },
              // astuce pour occuper la largeur en mobile quand la barre est ouverte
              ...(isMobile && openSearchBar ? { maxWidth: "100%" } : {}),
            }}
          >
            {!openSearchBar && (
              <Tooltip title="Rechercher">
                <IconButton
                  onClick={() => setSearchBar(true)}
                  aria-label="Ouvrir la recherche"
                  size="large"
                  sx={{
                    color: "text.secondary",
                    "&:hover": {
                      color: "primary.main",
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  <Search sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}

            {/* Supprime la prop fullWidth non supportée */}
            <SearchBar open={openSearchBar} handleClose={() => setSearchBar(false)} />
          </Box>
        </ClickAwayListener>

        <Box flexGrow={1} />

        {/* Actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 1 },
          }}
        >
          {/* Direction LTR/RTL */}
          <Tooltip
            title={
              settings.direction === "rtl"
                ? "Passer en mode gauche à droite"
                : "Passer en mode droite à gauche"
            }
          >
            <IconButton
              onClick={() =>
                handleChangeDirection(settings.direction === "rtl" ? "ltr" : "rtl")
              }
              size="large"
              aria-label="Changer la direction du texte"
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "primary.main",
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              {settings.direction === "rtl" ? (
                <MenuLeft sx={{ fontSize: 20 }} />
              ) : (
                <MenuLeftRight sx={{ fontSize: 20 }} />
              )}
            </IconButton>
          </Tooltip>

          {/* Thème clair/sombre */}
          <Tooltip
            title={
              settings.theme === "light"
                ? "Activer le mode sombre"
                : "Activer le mode clair"
            }
          >
            <IconButton
              onClick={handleThemeChangeWithAnimation}
              size="large"
              aria-label="Changer le thème"
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "primary.main",
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
                animation: isThemeRotating ? "rotate 0.5s ease-in-out" : "none",
                "@keyframes rotate": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" },
                },
              }}
            >
              <ThemeIcon
                sx={{
                  fontSize: 20,
                  color: settings.theme === "dark" ? "warning.main" : "text.secondary",
                }}
              />
            </IconButton>
          </Tooltip>

          {/* Popovers : on retire les props non supportées (notificationCount, sx) */}
          {upSm && (
            <Fragment>
              <NotificationsPopover />
              <ServicePopover />
            </Fragment>
          )}

          <ProfilePopover />
        </Box>
      </StyledToolBar>
    </DashboardHeaderRoot>
  );
};

export default ClientDashboardHeader;

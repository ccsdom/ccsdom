import React from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import { styled, alpha, useTheme } from "@mui/material/styles";
import { Close as CloseIcon } from "@mui/icons-material";

// Hook gestion layout (mobile sidebar)
import useLayout from "./context/useLayout";
// Composants
import { Scrollbar } from "@/components/scrollbar";
import MultiLevelMenu from "./MultiLevelMenu";
import UserAccount from "../layout-parts/UserAccount";
import LayoutDrawer from "../layout-parts/LayoutDrawer";

// Navigation spécifique au client
import { clientNavigations } from "../layout-parts/navigation-client";

// Wrapper stylisé pour la navigation
const NavWrapper = styled("div")(({ theme }) => ({
  height: "100%",
  padding: theme.spacing(0, 2),
  display: "flex",
  flexDirection: "column",
}));

const HeaderSection = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(3, 0, 2),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  marginBottom: theme.spacing(1),
}));

const LogoContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: 12,
});

// Type minimal pour satisfaire MultiLevelMenu sans dépendre des types internes
type NavItemLike = { badge?: string | number; children?: NavItemLike[]; [k: string]: any };

const ClientMobileSidebar: React.FC = () => {
  const theme = useTheme();
  const { showMobileSideBar, handleCloseMobileSidebar } = useLayout();

  // Normalise la navigation en tableau pour matcher MultiLevelMenu
  const navigationList: NavItemLike[] = Array.isArray(clientNavigations)
    ? (clientNavigations as unknown as NavItemLike[])
    : [clientNavigations as unknown as NavItemLike];

  return (
    <LayoutDrawer open={showMobileSideBar} onClose={handleCloseMobileSidebar}>
      {/* On applique le style voulu sur un conteneur interne plutôt que sur LayoutDrawer.sx */}
      <Box
        sx={{
          height: "100%",
          background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${alpha(
            theme.palette.background.paper,
            0.98
          )} 100%)`,
          backdropFilter: "blur(20px)",
          borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: theme.shadows[4],
        }}
      >
        <Scrollbar
          autoHide
          clickOnTrack={false}
          sx={{
            overflowX: "hidden",
            height: "100%",
            "& .simplebar-content": {
              display: "flex",
              flexDirection: "column",
              height: "100%",
            },
          }}
        >
          <NavWrapper>
            {/* Header avec logo et bouton fermeture */}
            <HeaderSection>
              <LogoContainer>
                <Box
                  component="img"
                  src="/static/logo/logo-svg.svg"
                  alt="Logo de l'application"
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    objectFit: "contain",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                  }}
                />
                <Box>
                  <Box
                    component="span"
                    sx={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      color: "transparent",
                      display: "block",
                      lineHeight: 1.2,
                    }}
                  >
                    CCS
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      fontSize: "0.75rem",
                      color: theme.palette.text.secondary,
                      fontWeight: 500,
                      display: "block",
                      lineHeight: 1,
                    }}
                  >
                    Business Suite
                  </Box>
                </Box>
              </LogoContainer>

              <Tooltip title="Fermer le menu">
                <IconButton
                  onClick={handleCloseMobileSidebar}
                  aria-label="Fermer le menu"
                  size="medium"
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    },
                    color: theme.palette.text.primary,
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </HeaderSection>

            {/* Menu client multi-niveaux */}
            <Box sx={{ flex: 1, py: 2 }}>
              <MultiLevelMenu
                sidebarCompact={false}
                navigations={navigationList as any}
                onItemClick={handleCloseMobileSidebar}
              />
            </Box>

            <Divider sx={{ my: 2, opacity: 0.3 }} />

            {/* Profil utilisateur */}
            <Box sx={{ pb: 3 }}>
              <UserAccount />
            </Box>
          </NavWrapper>
        </Scrollbar>
      </Box>
    </LayoutDrawer>
  );
};

export default ClientMobileSidebar;

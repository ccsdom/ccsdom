import React, { Suspense, useState, useEffect, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  useMediaQuery,
  Theme,
  CircularProgress,
  Box,
  useTheme,
  Fade,
  styled,
} from "@mui/material";

import ClientMobileSidebar from "./ClientMobileSidebar";
import ClientDashboardSidebar from "./ClientDashboardSidebar";
import ClientDashboardHeader from "./ClientDashboardHeader";
import LayoutProvider from "./context/layoutContext";
import useLayout from "./context/useLayout";

// Largeurs sidebar
const DESKTOP_WIDTH = 280;
const COMPACT_WIDTH = 72;

// Couches
const AppShell = styled(Box)({
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  flexDirection: "row",
  position: "relative",
});

const MainColumn = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.background.default,
}));

const PageInner = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  width: "100%",
  minWidth: 0,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(3),
  },
  [theme.breakpoints.up("md")]: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
}));

// ---- Fix: typer explicitement children ----
type FixedSidebarDockProps = {
  width: number;
  children?: React.ReactNode;
};

const FixedSidebarDock = ({ width, children }: FixedSidebarDockProps) => (
  <Box
    sx={{
      position: "fixed",
      inset: 0,
      left: 0,
      width,
      height: "100vh",
      zIndex: (t) => t.zIndex.drawer,
      pointerEvents: "auto",
    }}
  >
    {children}
  </Box>
);

// Loader
const LoadingSpinner = () => {
  const theme = useTheme();
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
      flexDirection="column"
      gap={2}
    >
      <CircularProgress
        size={60}
        thickness={4}
        sx={{ color: theme.palette.primary.main, animationDuration: "800ms" }}
      />
      <Fade in timeout={1000}>
        <Box sx={{ textAlign: "center", color: theme.palette.text.secondary }}>
          <Box component="span" sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
            Chargement en cours
          </Box>
        </Box>
      </Fade>
    </Box>
  );
};

// Transition
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [stage, setStage] = useState<"fadeIn" | "fadeOut">("fadeIn");

  useEffect(() => {
    if (location !== displayLocation) setStage("fadeOut");
  }, [location, displayLocation]);

  const onEnd = () => {
    if (stage === "fadeOut") {
      setStage("fadeIn");
      setDisplayLocation(location);
    }
  };

  return (
    <Box
      sx={{
        opacity: stage === "fadeIn" ? 1 : 0,
        transition: "opacity 300ms ease-in-out",
        width: "100%",
        minHeight: "100%",
      }}
      onTransitionEnd={onEnd}
    >
      {children}
    </Box>
  );
};

// ---- Inner: consomme le contexte à l'intérieur du Provider ----
const ClientDashboardLayoutInner = () => {
  const theme = useTheme();
  const location = useLocation();
  const { sidebarCompact } = useLayout();

  const isDesktop = useMediaQuery((t: Theme) => t.breakpoints.up("lg"));
  const isTablet = useMediaQuery((t: Theme) => t.breakpoints.between("md", "lg"));
  const isMobile = useMediaQuery((t: Theme) => t.breakpoints.down("md"));

  // Largeur réelle de la sidebar par breakpoint
  const sidebarWidthLg = sidebarCompact ? COMPACT_WIDTH : DESKTOP_WIDTH; // desktop: compact ou large
  const sidebarWidthMd = COMPACT_WIDTH; // tablette: compact
  const gutterMd = theme.spacing(2); // espace visuel
  const gutterLg = theme.spacing(3);

  // Offset dynamique du contenu
  const mainMarginLeft = useMemo(() => {
    if (isMobile) return "0px";
    if (isTablet) return `calc(${sidebarWidthMd}px + ${gutterMd})`;
    return `calc(${sidebarWidthLg}px + ${gutterLg})`;
  }, [isMobile, isTablet, sidebarWidthMd, sidebarWidthLg, gutterMd, gutterLg]);

  return (
    <AppShell>
      {/* Sidebar fixe à GAUCHE */}
      {!isMobile && (
        <FixedSidebarDock width={isTablet ? sidebarWidthMd : sidebarWidthLg}>
          <ClientDashboardSidebar />
        </FixedSidebarDock>
      )}

      {/* Sidebar mobile: Drawer overlay */}
      {isMobile && <ClientMobileSidebar />}

      {/* Colonne principale avec marge à gauche dynamique */}
      <MainColumn sx={{ ml: mainMarginLeft }}>
        <ClientDashboardHeader title={getPageTitle(location.pathname)} />

        <PageInner component="main">
          <PageTransition>
            <Suspense fallback={<LoadingSpinner />}>
              <Outlet />
            </Suspense>
          </PageTransition>
        </PageInner>

        {/* Footer (facultatif) */}
        <Box
          component="footer"
          sx={{
            py: 3,
            px: { xs: 2, md: 4 },
            backgroundColor: theme.palette.background.paper,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: { xs: "none", md: "block" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ fontSize: "0.875rem", color: theme.palette.text.secondary }}>
              © {new Date().getFullYear()} Votre Société. Tous droits réservés.
            </Box>
            <Box sx={{ display: "flex", gap: 3, fontSize: "0.875rem", flexWrap: "wrap" }}>
              <Box
                component="a"
                href="#"
                sx={{ color: "text.secondary", textDecoration: "none", "&:hover": { color: "primary.main" } }}
              >
                Confidentialité
              </Box>
              <Box
                component="a"
                href="#"
                sx={{ color: "text.secondary", textDecoration: "none", "&:hover": { color: "primary.main" } }}
              >
                Conditions
              </Box>
              <Box
                component="a"
                href="#"
                sx={{ color: "text.secondary", textDecoration: "none", "&:hover": { color: "primary.main" } }}
              >
                Support
              </Box>
            </Box>
          </Box>
        </Box>
      </MainColumn>
    </AppShell>
  );
};

// Titre de page
const getPageTitle = (pathname: string): string => {
  const map: Record<string, string> = {
    "/client/dashboard": "Tableau de bord",
    "/client/documents": "Mes documents",
    "/client/factures": "Mes factures",
    "/client/abonnement": "Mon abonnement",
    "/client/profil": "Mon profil",
    "/client/courriers": "Mes courriers",
    "/client/parametres": "Paramètres",
    "/client/notifications": "Notifications",
    "/dashboard": "Tableau de bord",
    "/documents": "Mes documents",
    "/factures": "Mes factures",
    "/abonnement": "Mon abonnement",
    "/profil": "Mon profil",
    "/courriers": "Mes courriers",
    "/parametres": "Paramètres",
    "/notifications": "Notifications",
    "/admin/dashboard": "Administration",
    "/admin/utilisateurs": "Gestion des utilisateurs",
    "/admin/statistiques": "Statistiques",
  };
  for (const k in map) if (pathname.startsWith(k)) return map[k];
  return "Tableau de bord";
};

// ---- Export par défaut : Provider au plus haut niveau ----
export default function ClientDashboardLayout() {
  return (
    <LayoutProvider>
      <ClientDashboardLayoutInner />
    </LayoutProvider>
  );
}

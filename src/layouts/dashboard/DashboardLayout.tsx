import React, { useState, useEffect } from "react";
import {
  Theme,
  useMediaQuery,
  Box,
  styled,
  alpha,
  useTheme,
  Typography,
} from "@mui/material";

// Composants personnalisés
import MobileSidebar from "./MobileSidebar";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import LayoutBodyWrapper from "../layout-parts/LayoutBodyWrapper";

// Contexte global du layout
import LayoutProvider from "./context/layoutContext";

// ---------- Styled ----------
const MainContainer = styled(Box)({
  display: "flex",
  minHeight: "100vh",
  position: "relative",
  overflow: "hidden",
});

const ContentWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== "sidebarOpen" && prop !== "isMobile",
})<{ sidebarOpen?: boolean; isMobile?: boolean }>(({ theme, sidebarOpen, isMobile }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(!isMobile &&
    sidebarOpen && {
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
}));

const BackgroundPattern = styled(Box)(({ theme }) => ({
  position: "fixed",
  inset: 0,
  background: `
    linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, transparent 50%),
    radial-gradient(${alpha(theme.palette.primary.main, 0.04)} 1px, transparent 1px)
  `,
  backgroundSize: "cover, 24px 24px",
  backgroundPosition: "center",
  pointerEvents: "none",
  zIndex: -1,
  opacity: 0.4,
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.01)} 0%, transparent 100%)`,
  }
}));

const FloatingElements = styled(Box)(({ theme }) => ({
  position: "fixed",
  inset: 0,
  pointerEvents: "none",
  zIndex: -1,
  "&::before, &::after": {
    content: '""',
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(40px)",
    opacity: 0.15,
  },
  "&::before": {
    width: 300,
    height: 300,
    background: theme.palette.primary.main,
    top: "-10%",
    right: "-5%",
  },
  "&::after": {
    width: 200,
    height: 200,
    background: theme.palette.secondary.main,
    bottom: "-5%",
    left: "-5%",
  }
}));

const StatusIndicator = styled(Box)(({ theme }) => ({
  position: "fixed",
  bottom: 16,
  right: 16,
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 4px ${alpha(theme.palette.success.main, 0.2)}`,
  zIndex: 9999,
  animation: "pulse 2s infinite",
  "@keyframes pulse": {
    "0%": {
      boxShadow: `0 0 0 0 ${alpha(theme.palette.success.main, 0.7)}`,
    },
    "70%": {
      boxShadow: `0 0 0 10px ${alpha(theme.palette.success.main, 0)}`,
    },
    "100%": {
      boxShadow: `0 0 0 0 ${alpha(theme.palette.success.main, 0)}`,
    },
  }
}));

// ---------- Type assertions (props externes) ----------
type MobileSidebarProps = {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
};
const MobileSidebarTyped =
  MobileSidebar as unknown as React.ComponentType<MobileSidebarProps>;

type DashboardSidebarProps = {
  open: boolean;
  onToggle: () => void;
  isTransitioning: boolean;
};
const DashboardSidebarTyped =
  DashboardSidebar as unknown as React.ComponentType<DashboardSidebarProps>;

type DashboardHeaderProps = {
  onMenuClick: () => void;
};
const DashboardHeaderTyped =
  DashboardHeader as unknown as React.ComponentType<DashboardHeaderProps>;

// ---------- Composant ----------
type DashboardLayoutProps = { children?: React.ReactNode };

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const theme = useTheme();
  
  // Breakpoints
  const downLg = useMediaQuery((t: Theme) => t.breakpoints.down("lg"));
  const isMobile = useMediaQuery((t: Theme) => t.breakpoints.down("md"));

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(!downLg);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setSidebarOpen(!downLg);
  }, [downLg]);

  const handleSidebarToggle = () => {
    setIsTransitioning(true);
    setSidebarOpen((s) => !s);
    window.setTimeout(() => setIsTransitioning(false), 300);
  };

  // Effet pour désactiver le défilement lors de l'ouverture du sidebar mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, sidebarOpen]);

  return (
    <LayoutProvider>
      <MainContainer>
        <BackgroundPattern />
        <FloatingElements />
        <StatusIndicator />

        {/* Sidebar mobile / desktop */}
        {downLg ? (
          <MobileSidebarTyped
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onOpen={() => setSidebarOpen(true)}
          />
        ) : (
          <DashboardSidebarTyped
            open={sidebarOpen}
            onToggle={handleSidebarToggle}
            isTransitioning={isTransitioning}
          />
        )}

        <ContentWrapper sidebarOpen={sidebarOpen && !downLg} isMobile={isMobile}>
          <DashboardHeaderTyped
            onMenuClick={downLg ? () => setSidebarOpen(true) : handleSidebarToggle}
          />

          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.divider, 0.2)}, transparent)`,
              }
            }}
          >
            <LayoutBodyWrapper>
              {children}
            </LayoutBodyWrapper>
          </Box>

          {/* Footer minimaliste */}
          <Box
            sx={{
              py: 2,
              px: 3,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              background: alpha(theme.palette.background.paper, 0.5),
              backdropFilter: "blur(10px)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: theme.palette.success.main,
                    animation: "pulse 2s infinite",
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Système opérationnel
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                © {new Date().getFullYear()} CCS Admin • v2.1.0
              </Typography>
            </Box>
          </Box>
        </ContentWrapper>

        {/* Overlay pour mobile */}
        {isMobile && sidebarOpen && (
          <Box
            sx={{
              position: "fixed",
              inset: 0,
              background: alpha(theme.palette.common.black, 0.5),
              backdropFilter: "blur(4px)",
              zIndex: theme.zIndex.drawer - 1,
              animation: `${theme.transitions.create('opacity', {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.enteringScreen,
              })}`,
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </MainContainer>
    </LayoutProvider>
  );
};

export default DashboardLayout;
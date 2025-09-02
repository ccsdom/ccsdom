import React, { useEffect, useMemo, useState } from "react";
import { Box, IconButton, Tooltip, Divider, Chip, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import useLayout from "./context/useLayout";

import { Link } from "@/components/link";
import { Scrollbar } from "@/components/scrollbar";
import MultiLevelMenu from "./MultiLevelMenu";
import UserAccount from "../layout-parts/UserAccount";
import ArrowLeftToLine from "@/icons/duotone/ArrowLeftToLine";
import { SidebarWrapper } from "../layout-parts/styles/sidebar";
import useAuth from "@/hooks/useAuth";

// 👉 menus admin uniquement
import { adminNavigations, secretaryNavigations } from "../layout-parts/navigation-admin";

const TOP_HEADER_AREA = 80;
// largeurs
const SIDEBAR_WIDTH = 300;
const SIDEBAR_COMPACT_WIDTH = 92;

type NavItemLike = { badge?: string | number; children?: NavItemLike[]; [key: string]: any };

const hasUnread = (items: NavItemLike[] = []): boolean =>
  items.some((item) => Number(item?.badge ?? 0) > 0 || (Array.isArray(item.children) && hasUnread(item.children)));

const roleLabel = (role?: string) => {
  switch (role) {
    case "super_admin":
      return { text: "Super Admin", color: "error" as const };
    case "admin":
      return { text: "Administrateur", color: "primary" as const };
    case "secretary":
      return { text: "Secrétaire", color: "secondary" as const };
    default:
      return { text: "Utilisateur", color: "default" as const };
  }
};

const DashboardSidebar: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { sidebarCompact, handleSidebarCompactToggle } = useLayout();

  const [mounted, setMounted] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const compact = sidebarCompact && !hover;

  // 👉 Choix du menu : jamais le menu client dans le layout admin
  const navigations = useMemo(() => {
    switch (user?.role) {
      case "super_admin":
      case "admin":
        return adminNavigations;
      case "secretary":
        return secretaryNavigations ?? adminNavigations;
      default:
        return adminNavigations;
    }
  }, [user?.role]);

  const hasUnreadNotifications = useMemo(() => hasUnread(navigations), [navigations]);

  const { text: roleText, color: roleColor } = roleLabel(user?.role);

  return (
    <SidebarWrapper
      role="complementary"
      aria-label="Barre latérale de navigation administrateur"
      compact={sidebarCompact ? 1 : 0}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => sidebarCompact && setHover(false)}
      sx={{
        // largeur responsive via variable CSS (utile si tu veux la réutiliser côté main layout)
        "--sidebar-w": `${compact ? SIDEBAR_COMPACT_WIDTH : SIDEBAR_WIDTH}px`,
        width: "var(--sidebar-w)",
        height: "100dvh",
        minHeight: "100dvh",
        transition: theme.transitions.create(["width", "transform", "opacity"], {
          duration: theme.transitions.duration.standard,
          easing: theme.transitions.easing.easeInOut,
        }),
        transform: mounted ? "translateX(0)" : "translateX(-100%)",
        opacity: mounted ? 1 : 0,
        background: `linear-gradient(180deg,
          ${theme.palette.background.paper} 0%,
          ${alpha(theme.palette.background.paper, 0.96)} 100%)`,
        backdropFilter: "blur(10px)",
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: theme.shadows[3],
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,       // évite l’écrasement
        overflow: "hidden",  // on délègue le scroll au bloc interne
      }}
    >
      {/* En-tête (wordmark texte, pas de logo SVG) */}
      <Box
        sx={{
          p: 2,
          height: TOP_HEADER_AREA,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          gap: 1,
        }}
      >
        <Box
          component={Link}
          href="/"
          sx={{ display: "flex", alignItems: "center", textDecoration: "none", flex: 1, minWidth: 0 }}
          aria-label="Aller à l'accueil"
        >
          {!compact && (
            <Box sx={{ ml: 0, minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  color: theme.palette.primary.main,
                  lineHeight: 1.05,
                  whiteSpace: "nowrap",
                }}
              >
                CCS
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                  display: "block",
                  lineHeight: 1.15,
                }}
              >
                Admin Suite
              </Typography>
            </Box>
          )}
        </Box>

        {!compact && (
          <Tooltip title="Réduire le menu">
            <IconButton
              onClick={handleSidebarCompactToggle}
              aria-label="Réduire le menu"
              aria-expanded={!sidebarCompact}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.2) },
                ml: 1,
              }}
            >
              <ArrowLeftToLine />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Badge rôle */}
      {!compact && user?.role && (
        <Box sx={{ px: 2, py: 1.5, flexShrink: 0 }}>
          <Chip
            label={roleText}
            size="small"
            color={roleColor}
            variant="filled"
            sx={{ fontWeight: 700, letterSpacing: 0.2, fontSize: "0.7rem", height: 24 }}
          />
        </Box>
      )}

      {/* Zone scrollable (prend tout l’espace restant grâce à flex:1 + minHeight:0) */}
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <Scrollbar
          autoHide
          clickOnTrack={false}
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto", // fallback natif si SimpleBar indisponible
            "& .simplebar-content": {
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            },
          }}
        >
          <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 0.5, minHeight: 0 }}>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <MultiLevelMenu sidebarCompact={!!compact} navigations={navigations as any} />
            </Box>

            {!compact && (
              <>
                <Divider sx={{ my: 2, opacity: 0.3 }} />
                <Box sx={{ flexShrink: 0 }}>
                  <UserAccount />
                </Box>
              </>
            )}
          </Box>
        </Scrollbar>
      </Box>

      {/* Bouton en mode compact */}
      {compact && (
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            flexShrink: 0,
            pb: "max(8px, env(safe-area-inset-bottom))",
          }}
        >
          <Tooltip title="Agrandir le menu" placement="right">
            <IconButton
              onClick={handleSidebarCompactToggle}
              aria-label="Agrandir le menu"
              aria-expanded={sidebarCompact}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.2) },
                width: "100%",
              }}
            >
              <ArrowLeftToLine sx={{ transform: "rotate(180deg)" }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Point rouge discret si badge non lu (compact uniquement) */}
      {compact && hasUnreadNotifications && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: theme.palette.error.main,
            animation: "pulse 2s infinite",
            "@keyframes pulse": {
              "0%": { opacity: 1 },
              "50%": { opacity: 0.4 },
              "100%": { opacity: 1 },
            },
          }}
        />
      )}
    </SidebarWrapper>
  );
};

export default DashboardSidebar;

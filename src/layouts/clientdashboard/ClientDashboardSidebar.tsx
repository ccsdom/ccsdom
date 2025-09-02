import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Divider,
  Chip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import useLayout from "./context/useLayout";

import { Link } from "@/components/link";
import { Scrollbar } from "@/components/scrollbar";
import MultiLevelMenu from "./MultiLevelMenu";
import UserAccount from "../layout-parts/UserAccount";
import ArrowLeftToLine from "@/icons/duotone/ArrowLeftToLine";
import { SidebarWrapper } from "../layout-parts/styles/sidebar";

import useAuth from "@/hooks/useAuth";
import { adminNavigations } from "../layout-parts/navigation-admin";
import { clientNavigations } from "../layout-parts/navigation-client";

const TOP_HEADER_AREA = 80;
const SIDEBAR_WIDTH = 280;
const SIDEBAR_COMPACT_WIDTH = 72;

type NavItemLike = { badge?: string | number; children?: NavItemLike[]; [key: string]: any };

const hasUnread = (items: NavItemLike[]): boolean => {
  for (const item of items) {
    const val = Number(item?.badge ?? 0);
    if (Number.isFinite(val) && val > 0) return true;
    if (Array.isArray(item.children) && hasUnread(item.children)) return true;
  }
  return false;
};

const ClientDashboardSidebar: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { sidebarCompact, handleSidebarCompactToggle } = useLayout();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const navigationList: NavItemLike[] = useMemo(() => {
    const raw = user?.role === "admin" ? adminNavigations : clientNavigations;
    return Array.isArray(raw) ? (raw as NavItemLike[]) : (raw ? [raw as unknown as NavItemLike] : []);
  }, [user?.role]);

  const hasUnreadNotifications = useMemo(() => hasUnread(navigationList), [navigationList]);

  return (
    <SidebarWrapper
      role="complementary"
      aria-label="Barre latérale de navigation"
      compact={sidebarCompact ? 1 : 0}
      sx={{
        width: sidebarCompact ? SIDEBAR_COMPACT_WIDTH : SIDEBAR_WIDTH,
        transition: theme.transitions.create(["width", "transform", "opacity"], {
          duration: theme.transitions.duration.standard,
          easing: theme.transitions.easing.easeInOut,
        }),
        transform: isMounted ? "translateX(0)" : "translateX(-100%)",
        opacity: isMounted ? 1 : 0,
        background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${alpha(
          theme.palette.background.paper,
          0.96
        )} 100%)`,
        backdropFilter: "blur(10px)",
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: theme.shadows[3],
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      {/* En-tête : titre + toggle */}
      <Box
        sx={{
          p: theme.spacing(2),
          height: TOP_HEADER_AREA,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        {/* Lien : CCS (primary, MAJUSCULES) + Business Suite (noir) */}
        <Box
          component={Link}
          href="/"
          sx={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            flex: 1,
            minWidth: 0,
          }}
          aria-label="Aller à l’accueil"
        >
          {!sidebarCompact && (
            <Box sx={{ ml: 0, minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  color: theme.palette.primary.main, // PRIMARY
                  lineHeight: 1.05,
                }}
              >
                CCS
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.primary, // NOIR / texte principal
                  fontWeight: 600,
                  display: "block",
                  lineHeight: 1.15,
                }}
              >
                Business Suite
              </Typography>
            </Box>
          )}
        </Box>

        {!sidebarCompact && (
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

      {!sidebarCompact && user?.role && (
        <Box sx={{ px: 2, py: 1.5, flexShrink: 0 }}>
          <Chip
            label={user.role === "admin" ? "Administrateur" : "Client"}
            size="small"
            color={user.role === "admin" ? "primary" : "secondary"}
            variant="filled"
            sx={{ fontWeight: 700, letterSpacing: 0.2, fontSize: "0.7rem", height: 24 }}
          />
        </Box>
      )}

      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <Scrollbar
          autoHide
          clickOnTrack={false}
          sx={{
            flex: 1,
            "& .simplebar-content": {
              display: "flex",
              flexDirection: "column",
              height: "100%",
              minHeight: 0,
            },
          }}
        >
          <Box sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <MultiLevelMenu sidebarCompact={sidebarCompact} navigations={navigationList as any} />
            </Box>

            {!sidebarCompact && (
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

      {sidebarCompact && (
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

      {sidebarCompact && hasUnreadNotifications && (
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

export default ClientDashboardSidebar;

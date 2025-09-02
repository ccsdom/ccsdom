import React from "react";
import { 
  Container, 
  styled, 
  useMediaQuery, 
  Theme, 
  Box,
  alpha,
  useTheme
} from "@mui/material";
import useLayout from "../dashboard/context/useLayout";

export type LayoutBodyWrapperProps = {
  children?: React.ReactNode;
};

const drawerWidth = 260;        // largeur sidebar normale (aligné avec DeepSeek)
const drawerCompactWidth = 68;  // largeur sidebar compacte (aligné avec DeepSeek)

const RootBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "compact" && prop !== "sidebarVisible",
})<{ compact: 0 | 1; sidebarVisible: boolean }>(({ theme, compact, sidebarVisible }) => ({
  marginLeft: sidebarVisible ? (compact ? drawerCompactWidth : drawerWidth) : 0,
  transition: theme.transitions.create(['margin-left', 'padding'], {
    duration: theme.transitions.duration.standard,
    easing: theme.transitions.easing.easeInOut,
  }),
  width: sidebarVisible ? `calc(100% - ${compact ? drawerCompactWidth : drawerWidth}px)` : '100%',
  minHeight: '100vh',
  [theme.breakpoints.down('lg')]: {
    marginLeft: 0,
    width: '100%',
  },
}));

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  backdropFilter: 'blur(10px)',
  boxShadow: theme.shadows[1],
  overflow: 'hidden',
  transition: theme.transitions.create(['box-shadow', 'transform'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-1px)',
  },
}));

const GradientBorder = styled(Box)(({ theme }) => ({
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.2)}, transparent)`,
    zIndex: 1,
  },
}));

const LayoutBodyWrapper: React.FC<LayoutBodyWrapperProps> = ({ children }) => {
  const { sidebarCompact } = useLayout();
  const theme = useTheme();

  // La sidebar fixe est visible à partir de "md"
  const sidebarVisible = useMediaQuery(
    (theme: Theme) => theme.breakpoints.up("md"),
    { noSsr: true }
  );

  return (
    <RootBox 
      compact={sidebarCompact ? 1 : 0} 
      sidebarVisible={sidebarVisible}
      sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
      }}
    >
      <StyledContainer maxWidth={false} sx={{ maxWidth: '1400px!important' }}>
        <GradientBorder>
          <ContentWrapper>
            <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              {children}
            </Box>
          </ContentWrapper>
        </GradientBorder>
      </StyledContainer>
      
      {/* Effet de lumière d'accentuation */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: sidebarVisible ? (sidebarCompact ? drawerCompactWidth : drawerWidth) : 0,
          right: 0,
          height: 300,
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 100%)`,
          pointerEvents: 'none',
          zIndex: -1,
          transition: theme.transitions.create('left', {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeInOut,
          }),
          [theme.breakpoints.down('lg')]: {
            left: 0,
          },
        }}
      />
    </RootBox>
  );
};

export default LayoutBodyWrapper;
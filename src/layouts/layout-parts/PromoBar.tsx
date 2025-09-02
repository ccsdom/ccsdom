import React from "react";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useTheme } from "@mui/material/styles";

type PromoBarProps = {
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
  localStorageKey?: string;
};

const PromoBar: React.FC<PromoBarProps> = ({
  message,
  ctaLabel,
  ctaHref,
  localStorageKey = "promo-dismissed-v1",
}) => {
  const theme = useTheme();
  const [hidden, setHidden] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem(localStorageKey) === "1";
    } catch {
      return false;
    }
  });

  const handleClose = () => {
    setHidden(true);
    try {
      localStorage.setItem(localStorageKey, "1");
    } catch {}
  };

  if (hidden) return null;

  return (
    <Box
      role="region"
      aria-label="Promotion"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: (t) => t.zIndex.appBar + 1,
        bgcolor: theme.palette.mode === "light" ? "primary.main" : "primary.dark",
        color: "primary.contrastText",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* conteneur relatif pour placer le bouton fermer à droite sans casser le centrage */}
      <Box sx={{ position: "relative", px: 6, py: 1 }}>
        {/* contenu centré */}
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          justifyContent="center"
          sx={{ textAlign: "center" }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              whiteSpace: { xs: "normal", sm: "nowrap" },
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {message}
          </Typography>

          {ctaLabel && ctaHref && (
            <Button
              size="small"
              variant="contained"
              color="inherit"
              href={ctaHref}
              sx={{ fontWeight: 700 }}
            >
              {ctaLabel}
            </Button>
          )}
        </Stack>

        {/* bouton fermer à droite, centré verticalement */}
        <IconButton
          onClick={handleClose}
          size="small"
          aria-label="Fermer la promotion"
          sx={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            color: "primary.contrastText",
          }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default PromoBar;

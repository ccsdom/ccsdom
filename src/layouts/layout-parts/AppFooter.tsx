import React from "react";
import { Box, Link, Stack, Typography } from "@mui/material";

const AppFooter: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        px: 2,
        py: 3,
        borderTop: (t) => `1px solid ${t.palette.divider}`,
        bgcolor: (t) =>
          t.palette.mode === "light" ? "background.paper" : "background.default",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={1.5}
      >
        <Typography variant="body2" color="text.secondary">
          © {year} CCS-DOM. Tous droits réservés.
        </Typography>

        <Stack direction="row" spacing={2}>
          <Link href="/mentions-legales" variant="body2" underline="hover" color="text.secondary">
            Mentions légales
          </Link>
          <Link href="/cgv" variant="body2" underline="hover" color="text.secondary">
            CGV
          </Link>
          <Link href="/confidentialite" variant="body2" underline="hover" color="text.secondary">
            Confidentialité
          </Link>
        </Stack>
      </Stack>
    </Box>
  );
};

export default AppFooter;

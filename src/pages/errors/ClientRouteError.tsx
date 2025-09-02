import * as React from "react";
import {
  useRouteError,
  isRouteErrorResponse,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  alpha,
  useTheme,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const ClientRouteError: React.FC = () => {
  const theme = useTheme();
  const error = useRouteError();
  const navigate = useNavigate();
  const location = useLocation();

  let title = "Une erreur est survenue";
  let code: number | undefined;
  let details: string | undefined;

  if (isRouteErrorResponse(error)) {
    code = error.status;
    title = `${error.status} ${error.statusText}`;
    details = typeof error.data === "string" ? error.data : undefined;
  } else if (error instanceof Error) {
    details = error.message;
  }

  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 700,
          width: "100%",
          p: 4,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.background.paper,
            0.95
          )} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
          textAlign: "center",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              backgroundColor: alpha(theme.palette.error.main, 0.08),
              color: theme.palette.error.main,
            }}
          >
            <ErrorOutlineIcon fontSize="large" />
          </Box>

          <Typography variant="h4" fontWeight={800}>
            {title}
          </Typography>

          <Typography variant="body1" color="text.secondary">
            On ne s’y attendait pas… Réessaie ou retourne au tableau de bord.
          </Typography>

          {details && (
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                p: 2,
                borderRadius: 2,
                width: "100%",
                textAlign: "left",
                bgcolor: alpha(theme.palette.warning.main, 0.06),
                border: `1px dashed ${alpha(theme.palette.warning.main, 0.4)}`,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {details}
            </Typography>
          )}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => navigate(-1)}>
              Revenir en arrière
            </Button>
            <Button component={Link} to="/client/dashboard" variant="outlined" color="inherit">
              Aller au dashboard client
            </Button>
            <Button
              variant="text"
              color="inherit"
              onClick={() => navigate(location.pathname, { replace: true })}
            >
              Réessayer
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ClientRouteError;

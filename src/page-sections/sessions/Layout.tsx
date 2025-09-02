import { FC, Fragment, ReactNode } from "react";
import { Grid, Box, Divider, Typography } from "@mui/material";
import { Link } from "@/components/link";
import logoCCS from "@/components/logoccs-blanc.svg";

type Props = {
  children: ReactNode;
  login?: boolean;
  isMobile?: boolean;
  currentStep?: number;
  totalSteps?: number;
};

const Layout: FC<Props> = ({
  children,
  login,
  isMobile = false,
  currentStep = 1,
  totalSteps = 1,
}) => {
  return (
    <Grid container height="100vh" overflow="hidden" position="relative" flexDirection="column">
      <Grid container flex="1 1 auto" sx={{ overflow: "hidden" }}>
        {/* Colonne gauche : Branding (violet) masquée en mobile */}
        <Grid
          item
          xs={12}
          md={3}
          sx={{
            display: { xs: "none", md: "flex" },
            position: "relative",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 6,
            px: 4,
            textAlign: "center",
            color: "#fff",
            backgroundImage: `url('/static/background-login.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Overlay violet transparent */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(103, 58, 183, 0.75)",
              zIndex: 1,
            }}
          />
          <Box
            width="100%"
            maxWidth={320}
            mx="auto"
            position="relative"
            zIndex={2}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <Link href="/">
              <Box
                component="img"
                src={logoCCS}
                alt="Logo CCS"
                sx={{
                  width: 130,
                  height: 130,
                  cursor: "pointer",
                  mb: 4,
                  filter: "drop-shadow(0 0 8px rgba(0,0,0,0.7))",
                }}
              />
            </Link>
            {login ? (
              <>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  gutterBottom
                  sx={{
                    textShadow: "1px 1px 4px rgba(0,0,0,0.8)",
                    letterSpacing: 1,
                    mb: 0,
                    userSelect: "none",
                  }}
                >
                  Bienvenue chez
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight={700}
                  gutterBottom
                  sx={{
                    textShadow: "1px 1px 4px rgba(0,0,0,0.8)",
                    letterSpacing: 2,
                    mt: 0,
                    userSelect: "none",
                  }}
                >
                  CCS DOM
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    opacity: 0.9,
                    textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
                    mb: 4,
                    fontSize: "1.15rem",
                    lineHeight: 1.5,
                    textAlign: "center",
                    userSelect: "none",
                  }}
                >
                  Une solution fiable et sécurisée pour gérer vos courriers, contrats
                  et documents en toute simplicité.
                </Typography>
              </>
            ) : (
              <Fragment>
                <Typography
                  variant="h5"
                  fontWeight={600}
                  mb={4}
                  sx={{ textShadow: "1px 1px 3px rgba(0,0,0,0.7)", userSelect: "none" }}
                >
                  Simplifiez la gestion de votre domiciliation d’entreprise avec notre
                  solution digitale.
                </Typography>
                <Divider sx={{ borderColor: "primary.400", borderWidth: 1, my: 3 }} />
              </Fragment>
            )}
            <Box my={4}>
              <Typography
                variant="h6"
                fontSize={20}
                fontWeight={600}
                gutterBottom
                sx={{ textShadow: "1px 1px 3px rgba(0,0,0,0.7)", userSelect: "none" }}
              >
                CCS DOM vous offre un espace dédié
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  opacity: 0.85,
                  textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
                  userSelect: "none",
                }}
              >
                Pour gérer vos courriers, contrats et documents en toute simplicité,
                où que vous soyez.
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Colonne droite : contenu dynamique */}
        <Grid
          item
          xs={12}
          md={9}
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            bgcolor: "background.paper",
            py: { xs: 0, md: 6 },
            px: { xs: 2, md: 6 },
            overflow: "hidden",
            backgroundColor: { xs: "#f0f0f0", md: "background.paper" }, // gris clair mobile
          }}
        >
          {/* Header mobile */}
          {isMobile && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 1,
                bgcolor: "primary.main",  // violet MUI
                color: "white",
                position: "sticky",
                top: 0,
                zIndex: 1200,
                boxShadow: "0 2px 6px rgb(0 0 0 / 0.15)",
                flexShrink: 0,
              }}
            >
              <Box
                component="img"
                src={logoCCS}
                alt="Logo CCS"
                sx={{ height: 80 }}  // logo agrandi mobile
              />
              <Typography variant="h6" fontWeight="bold" flexGrow={1} noWrap color="inherit">
                Gestion Domiciliation
              </Typography>
              {/* Étapes retirées */}
            </Box>
          )}

          {/* Contenu scrollable */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              pt: { xs: 2, md: 0 },
              height: { xs: "calc(100vh - 72px - 72px)", md: "auto" }, // header + footer mobiles
            }}
          >
            {children}
          </Box>

          {/* Footer mobile */}
          {isMobile && (
            <Box
              component="footer"
              sx={{
                p: 1,
                bgcolor: "primary.main", // violet MUI
                color: "white",
                textAlign: "center",
                fontSize: 12,
                position: "sticky",
                bottom: 0,
                zIndex: 1200,
                boxShadow: "0 -2px 6px rgb(0 0 0 / 0.15)",
                userSelect: "none",
              }}
            >
              &copy; {new Date().getFullYear()} CCS DOM. Tous droits réservés.
            </Box>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Layout;

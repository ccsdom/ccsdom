import React, { useContext, useState } from "react";
import {
  Grid,
  Divider,
  TextField,
  Box,
  Checkbox,
  styled,
  ButtonBase,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import * as Yup from "yup";
import { useFormik } from "formik";
// FIREBASE CONTEXT FILE
import { AuthContext } from "@/contexts/firebaseContext";
// CUSTOM LAYOUT COMPONENT
import Layout from "@/page-sections/sessions/Layout";
// CUSTOM COMPONENTS
import { Link } from "@/components/link";
import { H5, H6, Paragraph } from "@/components/typography";
import { FlexBetween, FlexBox, FlexRowAlign } from "@/components/flexbox";
// CUSTOM ICON COMPONENTS
import GoogleIcon from "@/icons/GoogleIcon";

// STYLED COMPONENT
const StyledButton = styled(ButtonBase)(({ theme }) => ({
  padding: 12,
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`,
}));

const LoginView = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { signInWithEmail, signInWithGoogle, logout, isAuthenticated, user } =
    useContext(AuthContext);

  const handleGoogle = async () => {
    setErrorMessage(null);
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error) {
      setErrorMessage("Erreur lors de la connexion avec Google.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const initialValues = {
    email: "",
    password: "",
    remember: true,
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Veuillez entrer un email valide")
      .max(255)
      .required("L'email est requis"),
    password: Yup.string()
      .min(6, "Le mot de passe doit contenir au minimum 6 caractères")
      .required("Le mot de passe est requis"),
  });

  const { errors, values, touched, handleBlur, handleChange, handleSubmit } =
    useFormik({
      initialValues,
      validationSchema,
      onSubmit: async (values) => {
        setErrorMessage(null);
        try {
          setIsLoading(true);
          await signInWithEmail(values.email, values.password);
        } catch (error: any) {
          setErrorMessage(error.message || "Erreur lors de la connexion.");
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      },
    });

  if (isAuthenticated && user) {
    return (
      <Layout login>
        <Box maxWidth={550} p={4} width="100%">
          <H5 fontSize={{ sm: 30, xs: 25 }}>Bienvenue {user.name || user.email}</H5>

          <Paragraph mt={1} mb={6} color="text.secondary">
            Vous êtes connecté.
          </Paragraph>

          <LoadingButton
            fullWidth
            color="error"
            loading={isLoading}
            variant="contained"
            onClick={logout}
          >
            Se déconnecter
          </LoadingButton>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout login>
      <Box maxWidth={550} p={4}>
        <H5 fontSize={{ sm: 30, xs: 25 }}>Connexion</H5>

        <Paragraph mt={1} mb={6} color="text.secondary">
          Nouveau utilisateur ?{" "}
          <Box fontWeight={500} component={Link} href="/firebase/register">
            Créez un compte
          </Box>
        </Paragraph>

        <form onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <H6 fontSize={16} mb={1.5}>
                Connectez-vous avec votre email professionnel
              </H6>

              <TextField
                fullWidth
                placeholder="Entrez votre email"
                name="email"
                onBlur={handleBlur}
                value={values.email}
                onChange={handleChange}
                helperText={touched.email && errors.email ? errors.email : ""}
                error={Boolean(touched.email && errors.email)}
                autoComplete="email"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder="Mot de passe"
                type={showPassword ? "text" : "password"}
                name="password"
                onBlur={handleBlur}
                value={values.password}
                onChange={handleChange}
                helperText={touched.password && errors.password ? errors.password : ""}
                error={Boolean(touched.password && errors.password)}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <FlexRowAlign
                      onClick={() => setShowPassword(!showPassword)}
                      sx={{ cursor: "pointer" }}
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </FlexRowAlign>
                  ),
                }}
              />

              <FlexBetween my={1}>
                <FlexBox alignItems="center" gap={1}>
                  <Checkbox
                    sx={{ p: 0 }}
                    name="remember"
                    value={values.remember}
                    onChange={handleChange}
                    checked={values.remember}
                  />
                  <Paragraph fontWeight={500}>Se souvenir de moi</Paragraph>
                </FlexBox>

                <Box
                  component={Link}
                  href="/forget-password"
                  fontSize={13}
                  sx={{ color: "error.500", fontWeight: 500, cursor: "pointer" }}
                >
                  Mot de passe oublié ?
                </Box>
              </FlexBetween>
            </Grid>

            {errorMessage && (
              <Paragraph color="error" mt={1}>
                {errorMessage}
              </Paragraph>
            )}

            <Grid item xs={12}>
              <LoadingButton
                loading={isLoading}
                type="submit"
                variant="contained"
                fullWidth
              >
                Se connecter
              </LoadingButton>
            </Grid>
          </Grid>
        </form>

        <Divider sx={{ my: 4, borderColor: "grey.200", borderWidth: 1 }}>
          <Paragraph color="text.secondary" px={1}>
            OU
          </Paragraph>
        </Divider>

        <FlexBox justifyContent="center" flexWrap="wrap" gap={2}>
          <StyledButton onClick={handleGoogle} disabled={isLoading}>
            <GoogleIcon sx={{ fontSize: 18 }} />
          </StyledButton>
          {/* Supprimer les boutons Facebook et Twitter si inutilisés */}
        </FlexBox>
      </Box>
    </Layout>
  );
};

export default LoginView;

import { useContext, useState } from "react";
import {
  Grid,
  Divider,
  TextField,
  Box,
  Alert,
  Button,
} from "@mui/material";
import { FirebaseError } from "firebase/app";
import { LoadingButton } from "@mui/lab";
import { useFormik } from "formik";
import * as Yup from "yup";
// HOOK PERSONNALISÉ
import useNavigate from "@/hooks/useNavigate";
// COMPOSANTS PERSONNALISÉS
import { Link } from "@/components/link";
import { H5, H6, Paragraph } from "@/components/typography";
// LAYOUT PERSONNALISÉ
import Layout from "@/page-sections/sessions/Layout";
// CONTEXTE FIREBASE
import { AuthContext } from "@/contexts/firebaseContext";

const RegisterView = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { createUserWithEmail, user, isAuthenticated } = useContext(AuthContext);

  const initialValues = {
    email: "",
    password: "",
    confirmPassword: "",
    remember: true,
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Veuillez entrer un email valide")
      .max(255)
      .required("L'email est requis"),
    password: Yup.string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères")
      .required("Le mot de passe est requis"),
    confirmPassword: Yup.string()
      .required("Merci de confirmer votre mot de passe")
      .oneOf([Yup.ref("password")], "Les mots de passe ne correspondent pas"),
  });

  const { errors, values, touched, handleBlur, handleChange, handleSubmit } =
    useFormik({
      initialValues,
      validationSchema,
      onSubmit: async (values) => {
        setError(null);
        setIsLoading(true);
        try {
          await createUserWithEmail(values.email, values.password);
          // Optionnel: redirection automatique après inscription
          navigate("/dashboard");
        } catch (err: any) {
          if (err instanceof FirebaseError) {
            setError(err.message || "Erreur lors de l'inscription");
          } else {
            setError("Une erreur inconnue est survenue");
          }
        } finally {
          setIsLoading(false);
        }
      },
    });

  // Si l'utilisateur est déjà connecté, tu peux rediriger ou afficher un message
  if (isAuthenticated && user) {
    return (
      <Layout>
        <Box maxWidth={550} p={4}>
          <H5>Vous êtes déjà connecté</H5>
          <Paragraph>Connecté en tant que {user.email}</Paragraph>
          <Button variant="contained" onClick={() => navigate("/dashboard")}>
            Aller au tableau de bord
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box maxWidth={550} p={4}>
        <H5 fontSize={{ sm: 30, xs: 25 }}>Créer un compte</H5>

        <Paragraph mt={1} mb={6} color="text.secondary">
          Aucun risque, aucune obligation, aucune carte bancaire requise.
        </Paragraph>

        <form onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <H6 fontSize={16} mb={2}>
                Inscription avec un email professionnel
              </H6>

              <TextField
                fullWidth
                placeholder="Votre adresse email"
                name="email"
                type="email"
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
                type="password"
                placeholder="Mot de passe"
                name="password"
                onBlur={handleBlur}
                value={values.password}
                onChange={handleChange}
                helperText={touched.password && errors.password ? errors.password : ""}
                error={Boolean(touched.password && errors.password)}
                autoComplete="new-password"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                placeholder="Confirmer le mot de passe"
                name="confirmPassword"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.confirmPassword}
                helperText={
                  touched.confirmPassword && errors.confirmPassword
                    ? errors.confirmPassword
                    : ""
                }
                error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                autoComplete="new-password"
              />
            </Grid>

            <Grid item xs={12}>
              <LoadingButton
                loading={isLoading}
                type="submit"
                variant="contained"
                fullWidth
              >
                S'inscrire
              </LoadingButton>

              <Paragraph mt={1} color="text.secondary" fontSize={13}>
                En vous inscrivant, vous acceptez les{" "}
                <Box
                  component={Link}
                  href="#"
                  sx={{ fontWeight: 500, cursor: "pointer" }}
                >
                  conditions d'utilisation
                </Box>{" "}
                et consentez à recevoir des communications par email.
              </Paragraph>
            </Grid>
          </Grid>
        </form>

        <Divider sx={{ my: 4, borderColor: "grey.200", borderWidth: 1 }} />

        <Button
          fullWidth
          variant="text"
          onClick={() => navigate("/login")}
          sx={{ backgroundColor: "primary.50" }}
        >
          Déjà un compte ? Connectez-vous
        </Button>
      </Box>
    </Layout>
  );
};

export default RegisterView;

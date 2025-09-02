import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Divider,
  TextField,
  Box,
  Checkbox,
  styled,
  ButtonBase,
  useTheme,
  alpha,
  IconButton,
  InputAdornment,
  Alert,
  Paper,
  Typography,
} from "@mui/material";
import { 
  Visibility, 
  VisibilityOff,
  Login as LoginIcon 
} from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import * as Yup from "yup";
import { useFormik } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Layout from "../Layout";
import { Link } from "@/components/link";
import { H5, H6, Paragraph } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox";
import GoogleIcon from "@/icons/GoogleIcon";

// STYLED COMPONENTS
const StyledButton = styled(ButtonBase)(({ theme }) => ({
  padding: 12,
  borderRadius: 12,
  border: `1px solid ${theme.palette.divider}`,
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderColor: theme.palette.primary.main,
    transform: "translateY(-2px)",
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
  "&:disabled": {
    opacity: 0.5,
    cursor: "not-allowed",
  },
}));

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  background: theme.palette.background.paper,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
  backdropFilter: "blur(10px)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  maxWidth: 450,
  margin: "0 auto",
  width: "100%",
}));

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const LoginPageView = () => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signInWithEmail, signInWithGoogle, user, authError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [signInWithGoogle]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      remember: true,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Veuillez entrer un email valide")
        .max(255)
        .required("L'email est requis"),
      password: Yup.string()
        .min(6, "Le mot de passe doit contenir au minimum 6 caractères")
        .required("Le mot de passe est requis"),
    }),
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        await signInWithEmail(values.email, values.password);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <Layout login>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <FormContainer elevation={0}>
          <motion.div variants={itemVariants}>
            <H5 fontSize={{ sm: 30, xs: 25 }} textAlign="center" color="primary.main">
              Connexion
            </H5>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Paragraph mt={2} mb={4} textAlign="center" color="text.secondary">
              Nouvel utilisateur ?{" "}
              <Box
                component={Link}
                href="/register"
                sx={{
                  color: "primary.main",
                  fontWeight: 600,
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Créez un compte
              </Box>
            </Paragraph>
          </motion.div>

          <form onSubmit={formik.handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <motion.div variants={itemVariants}>
                  <H6 fontSize={16} mb={2} color="text.primary">
                    Connectez-vous avec votre adresse email
                  </H6>

                  <TextField
                    fullWidth
                    placeholder="ex: nom@entreprise.com"
                    name="email"
                    type="email"
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    helperText={formik.touched.email && formik.errors.email}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    autoComplete="email"
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                      },
                    }}
                  />
                </motion.div>
              </Grid>

              <Grid item xs={12}>
                <motion.div variants={itemVariants}>
                  <TextField
                    fullWidth
                    placeholder="Votre mot de passe"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    helperText={formik.touched.password && formik.errors.password}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    autoComplete="current-password"
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={togglePasswordVisibility}
                            edge="end"
                            sx={{ color: "text.secondary" }}
                            aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <FlexBetween mt={2}>
                    <FlexBox alignItems="center" gap={1}>
                      <Checkbox
                        size="small"
                        name="remember"
                        checked={formik.values.remember}
                        onChange={formik.handleChange}
                        sx={{ p: 0.5 }}
                        inputProps={{ "aria-label": "Se souvenir de moi" }}
                      />
                      <Paragraph fontSize={14} fontWeight={500}>
                        Se souvenir de moi
                      </Paragraph>
                    </FlexBox>

                    <Box
                      component={Link}
                      href="/forget-password"
                      sx={{
                        color: "primary.main",
                        fontWeight: 500,
                        textDecoration: "none",
                        fontSize: 14,
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Mot de passe oublié ?
                    </Box>
                  </FlexBetween>
                </motion.div>
              </Grid>

              <AnimatePresence>
                {authError && (
                  <Grid item xs={12}>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert severity="error" sx={{ borderRadius: 2 }}>
                        {authError}
                      </Alert>
                    </motion.div>
                  </Grid>
                )}
              </AnimatePresence>

              <Grid item xs={12}>
                <motion.div variants={itemVariants}>
                  <LoadingButton
                    loading={isLoading}
                    type="submit"
                    variant="contained"
                    fullWidth
                    startIcon={<LoginIcon />}
                    sx={{
                      borderRadius: 3,
                      height: 48,
                      fontWeight: 600,
                      fontSize: "1rem",
                    }}
                  >
                    Se connecter
                  </LoadingButton>
                </motion.div>
              </Grid>
            </Grid>
          </form>

          <motion.div variants={itemVariants}>
            <Divider sx={{ my: 4 }}>
              <Typography color="text.secondary" px={2} fontSize={14}>
                OU
              </Typography>
            </Divider>
          </motion.div>

          <motion.div variants={itemVariants}>
            <FlexBox justifyContent="center" gap={2}>
              <StyledButton 
                onClick={handleGoogle} 
                disabled={isLoading}
                aria-label="Se connecter avec Google"
              >
                <GoogleIcon sx={{ fontSize: 20, color: "#DB4437" }} />
                <Paragraph ml={1} fontWeight={600} fontSize={14}>
                  Connexion avec Google
                </Paragraph>
              </StyledButton>
            </FlexBox>
          </motion.div>
        </FormContainer>
      </motion.div>
    </Layout>
  );
};

export default React.memo(LoginPageView);
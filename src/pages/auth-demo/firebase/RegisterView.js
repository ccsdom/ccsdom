import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useState } from "react";
import { Grid, Divider, TextField, Box, Alert, Button, } from "@mui/material";
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
    const [error, setError] = useState(null);
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
    const { errors, values, touched, handleBlur, handleChange, handleSubmit } = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values) => {
            setError(null);
            setIsLoading(true);
            try {
                await createUserWithEmail(values.email, values.password);
                // Optionnel: redirection automatique après inscription
                navigate("/dashboard");
            }
            catch (err) {
                if (err instanceof FirebaseError) {
                    setError(err.message || "Erreur lors de l'inscription");
                }
                else {
                    setError("Une erreur inconnue est survenue");
                }
            }
            finally {
                setIsLoading(false);
            }
        },
    });
    // Si l'utilisateur est déjà connecté, tu peux rediriger ou afficher un message
    if (isAuthenticated && user) {
        return (_jsx(Layout, { children: _jsxs(Box, { maxWidth: 550, p: 4, children: [_jsx(H5, { children: "Vous \u00EAtes d\u00E9j\u00E0 connect\u00E9" }), _jsxs(Paragraph, { children: ["Connect\u00E9 en tant que ", user.email] }), _jsx(Button, { variant: "contained", onClick: () => navigate("/dashboard"), children: "Aller au tableau de bord" })] }) }));
    }
    return (_jsx(Layout, { children: _jsxs(Box, { maxWidth: 550, p: 4, children: [_jsx(H5, { fontSize: { sm: 30, xs: 25 }, children: "Cr\u00E9er un compte" }), _jsx(Paragraph, { mt: 1, mb: 6, color: "text.secondary", children: "Aucun risque, aucune obligation, aucune carte bancaire requise." }), _jsx("form", { onSubmit: handleSubmit, noValidate: true, children: _jsxs(Grid, { container: true, spacing: 3, children: [error && (_jsx(Grid, { item: true, xs: 12, children: _jsx(Alert, { severity: "error", children: error }) })), _jsxs(Grid, { item: true, xs: 12, children: [_jsx(H6, { fontSize: 16, mb: 2, children: "Inscription avec un email professionnel" }), _jsx(TextField, { fullWidth: true, placeholder: "Votre adresse email", name: "email", type: "email", onBlur: handleBlur, value: values.email, onChange: handleChange, helperText: touched.email && errors.email ? errors.email : "", error: Boolean(touched.email && errors.email), autoComplete: "email" })] }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, type: "password", placeholder: "Mot de passe", name: "password", onBlur: handleBlur, value: values.password, onChange: handleChange, helperText: touched.password && errors.password ? errors.password : "", error: Boolean(touched.password && errors.password), autoComplete: "new-password" }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, type: "password", placeholder: "Confirmer le mot de passe", name: "confirmPassword", onBlur: handleBlur, onChange: handleChange, value: values.confirmPassword, helperText: touched.confirmPassword && errors.confirmPassword
                                        ? errors.confirmPassword
                                        : "", error: Boolean(touched.confirmPassword && errors.confirmPassword), autoComplete: "new-password" }) }), _jsxs(Grid, { item: true, xs: 12, children: [_jsx(LoadingButton, { loading: isLoading, type: "submit", variant: "contained", fullWidth: true, children: "S'inscrire" }), _jsxs(Paragraph, { mt: 1, color: "text.secondary", fontSize: 13, children: ["En vous inscrivant, vous acceptez les", " ", _jsx(Box, { component: Link, href: "#", sx: { fontWeight: 500, cursor: "pointer" }, children: "conditions d'utilisation" }), " ", "et consentez \u00E0 recevoir des communications par email."] })] })] }) }), _jsx(Divider, { sx: { my: 4, borderColor: "grey.200", borderWidth: 1 } }), _jsx(Button, { fullWidth: true, variant: "text", onClick: () => navigate("/login"), sx: { backgroundColor: "primary.50" }, children: "D\u00E9j\u00E0 un compte ? Connectez-vous" })] }) }));
};
export default RegisterView;

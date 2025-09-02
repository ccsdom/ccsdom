import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Button, Stack, TextField } from "@mui/material";
import NavigateBefore from "@mui/icons-material/NavigateBefore";
// HOOK PERSONNALISÉ
import useNavigate from "@/hooks/useNavigate";
// COMPOSANTS PERSONNALISÉS
import { H5, Paragraph } from "@/components/typography";
import FlexRowAlign from "@/components/flexbox/FlexRowAlign";
const ForgetPasswordPageView = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const validateEmail = (value) => {
        // Simple regex email validation
        return /\S+@\S+\.\S+/.test(value);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        if (!email) {
            setError("L'adresse email est requise.");
            return;
        }
        if (!validateEmail(email)) {
            setError("Veuillez saisir une adresse email valide.");
            return;
        }
        // Simuler l'envoi du lien
        alert(`Un lien de réinitialisation a été envoyé à ${email}.`);
        // Ici, intégrer l'appel à ton API / Firebase pour envoyer le mail
        setEmail("");
    };
    return (_jsx(FlexRowAlign, { height: "100%", bgcolor: "background.paper", children: _jsxs(Box, { textAlign: "center", maxWidth: 550, width: "100%", padding: 4, children: [_jsx("img", { src: "/static/forget-password.svg", alt: "Illustration mot de passe oubli\u00E9", width: 250, style: { margin: "0 auto", display: "block" } }), _jsx(H5, { mt: 2, children: "Mot de passe oubli\u00E9 ?" }), _jsx(Paragraph, { color: "text.secondary", mt: 1, px: 4, children: "Veuillez saisir l\u2019adresse email associ\u00E9e \u00E0 votre compte. Nous vous enverrons un lien pour r\u00E9initialiser votre mot de passe." }), _jsx("form", { onSubmit: handleSubmit, children: _jsxs(Stack, { gap: 3, mt: 5, children: [_jsx(TextField, { fullWidth: true, label: "Email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), error: !!error, helperText: error, autoComplete: "email", autoFocus: true }), _jsx(Button, { fullWidth: true, type: "submit", disabled: !email || !validateEmail(email), variant: "contained", children: "Envoyer le lien" }), _jsxs(Button, { disableRipple: true, variant: "text", color: "secondary", onClick: () => navigate("/login"), children: [_jsx(NavigateBefore, { fontSize: "small" }), " Retour \u00E0 la connexion"] })] }) })] }) }));
};
export default ForgetPasswordPageView;

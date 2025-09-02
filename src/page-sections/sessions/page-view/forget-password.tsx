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

  const validateEmail = (value: string) => {
    // Simple regex email validation
    return /\S+@\S+\.\S+/.test(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
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

  return (
    <FlexRowAlign height="100%" bgcolor="background.paper">
      <Box textAlign="center" maxWidth={550} width="100%" padding={4}>
        <img
          src="/static/forget-password.svg"
          alt="Illustration mot de passe oublié"
          width={250}
          style={{ margin: "0 auto", display: "block" }}
        />

        <H5 mt={2}>Mot de passe oublié ?</H5>

        <Paragraph color="text.secondary" mt={1} px={4}>
          Veuillez saisir l’adresse email associée à votre compte. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </Paragraph>

        <form onSubmit={handleSubmit}>
          <Stack gap={3} mt={5}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!error}
              helperText={error}
              autoComplete="email"
              autoFocus
            />

            <Button
              fullWidth
              type="submit"
              disabled={!email || !validateEmail(email)}
              variant="contained"
            >
              Envoyer le lien
            </Button>

            <Button
              disableRipple
              variant="text"
              color="secondary"
              onClick={() => navigate("/login")}
            >
              <NavigateBefore fontSize="small" /> Retour à la connexion
            </Button>
          </Stack>
        </form>
      </Box>
    </FlexRowAlign>
  );
};

export default ForgetPasswordPageView;

// src/page-sections/error/ErrorPageView.tsx
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { H1, Paragraph } from "@/components/typography";
import useNavigate from "@/hooks/useNavigate";

const ErrorPageView = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Box textAlign="center" py={6}>
        <H1 fontSize={{ sm: 52, xs: 42 }}>Page non trouvée !</H1>
        <Paragraph mt={1} fontSize={18} color="text.secondary">
          Oups ! Il semblerait que cette page ait été débranchée par erreur. 🔌🙈
          <br />
          <br /> <strong>#404NonTrouvée</strong>
        </Paragraph>

        <Box py={10} maxWidth={600} mx="auto">
          <img src="/static/pages/error.svg" alt="Erreur 404" width="100%" />
        </Box>

        <Button size="large" onClick={() => navigate("/")}>
          Retour à l'accueil
        </Button>
      </Box>
    </Container>
  );
};

export default ErrorPageView;

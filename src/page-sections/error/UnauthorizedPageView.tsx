// src/page-sections/error/UnauthorizedPageView.tsx
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { H1, Paragraph } from "@/components/typography";
import useNavigate from "@/hooks/useNavigate";

const UnauthorizedPageView = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Box textAlign="center" py={6}>
        <H1 fontSize={{ sm: 52, xs: 42 }}>Accès refusé</H1>
        <Paragraph mt={1} fontSize={18} color="text.secondary">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          <br />
          <br /> <strong>#403NonAutorisé</strong>
        </Paragraph>

        <Box py={10} maxWidth={600} mx="auto">
          <img src="/static/pages/unauthorized.svg" alt="Accès refusé" width="100%" />
        </Box>

        <Button size="large" onClick={() => navigate("/")}>
          Retour à l'accueil
        </Button>
      </Box>
    </Container>
  );
};

export default UnauthorizedPageView;

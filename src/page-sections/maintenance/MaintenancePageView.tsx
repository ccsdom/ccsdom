import { Box, Button, Container } from "@mui/material";
// CUSTOM COMPONENTS
import { H1, Paragraph } from "@/components/typography";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";

const MaintenancePageView = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Box textAlign="center" py={6}>
        <H1 fontSize={{ sm: 52, xs: 42 }}>Maintenance underway</H1>
        <Paragraph mt={0.5} fontSize={18} color="text.secondary">
          Essence is Undergoing maintenance for future growth.
        </Paragraph>

        <Box py={8} maxWidth={600} margin="auto">
          <img
            src="/static/pages/maintenance.svg"
            alt="maintenance"
            width="100%"
          />
        </Box>

        <Button onClick={() => navigate("/")}>Go Home</Button>
      </Box>
    </Container>
  );
};

export default MaintenancePageView;

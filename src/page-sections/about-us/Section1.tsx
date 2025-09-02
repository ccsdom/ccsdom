import { Box, Container, Grid } from "@mui/material";
// CUSTOM COMPONENTS
import { H1, Paragraph, Span } from "@/components/typography";

const Section1 = () => {
  return (
    <Box mt={{ sm: 10, xs: 8 }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item lg={6} md={7} xs={12}>
            <H1 fontSize={{ sm: 48, xs: 42 }} fontWeight={900} lineHeight={1.2}>
              We build bridges between{" "}
              <Span fontWeight={700} fontStyle="italic">
                Companies and Customers
              </Span>
            </H1>
          </Grid>

          <Grid item lg={6} md={5} xs={12}>
            <Paragraph
              height="100%"
              display="flex"
              alignItems="end"
              color="text.secondary"
              fontSize={{ sm: 18, xs: 16 }}
            >
              To build software that gives customer-facing teams at small-and
              medium-sized businesses the ability to create fruitful and
              enduring relationships with customer
            </Paragraph>
          </Grid>
        </Grid>
      </Container>

      <Box
        component="img"
        src="/static/cover/about-hero.png"
        sx={{ mt: 7, width: "100%" }}
      />
    </Box>
  );
};

export default Section1;

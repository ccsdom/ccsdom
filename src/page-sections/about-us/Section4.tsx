import { Box, Container, Theme, useMediaQuery } from "@mui/material";
// CUSTOM COMPONENTS
import { Carousel } from "@/components/carousel";
import { H1, Paragraph } from "@/components/typography";

const Section4 = () => {
  const isSmallDevice = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm"),
  );

  return (
    <Box bgcolor="grey.50" py={10}>
      <Container maxWidth="lg">
        <H1 textAlign="center" fontSize={{ sm: 52, xs: 42 }} mb={6}>
          What Our Customer Says
        </H1>

        <Carousel
          grabCursor
          navigation={isSmallDevice ? false : true}
          slidesPerView={1}
        >
          {[1, 2, 3, 4, 5].map((item) => (
            <Box
              p={2}
              textAlign="center"
              maxWidth={800}
              margin="auto"
              key={item}
            >
              <img src="/static/quotation.svg" alt="Quotation" />

              <Paragraph
                mt={2}
                mb={6}
                fontWeight={500}
                fontSize={{ sm: 24, xs: 18 }}
              >
                Essence Admin Template is a user-friendly website template with a
                modern design and responsive layout. It offers pre-built
                customizable components and modules to create a unique admin
                interface for your web applications.
              </Paragraph>

              <Box
                margin="auto"
                boxShadow={2}
                mb={4}
                width={100}
                height={100}
                borderRadius="50%"
              >
                <img
                  src="/static/user/user-24.png"
                  alt="Quotation"
                  width="100%"
                />
              </Box>

              <Paragraph fontWeight={600} fontSize={18}>
                Lucian Obrien
              </Paragraph>

              <Paragraph color="text.secondary">UX Designer</Paragraph>
            </Box>
          ))}
        </Carousel>
      </Container>
    </Box>
  );
};

export default Section4;

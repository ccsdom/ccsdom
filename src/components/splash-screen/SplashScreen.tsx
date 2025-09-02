import { Box, styled, keyframes, Card } from "@mui/material";

// KEYFRAME CSS ANIMATION
const animated = keyframes`
0% {
	background-position: 0 0;
}
50% {
  background-position: 400% 0%;
}
100% {
	background-position: 0 0;
}
`;

// STYLED COMPONENT
const GradientBox = styled("div")(({ theme }) => {
  const color = `${theme.palette.primary[600]}, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.error.main}, ${theme.palette.primary[400]}`;

  const COMMON_STYLE = {
    top: -2,
    left: -2,
    content: "''",
    borderRadius: "50%",
    background: `linear-gradient(45deg, ${color})`,
    position: "absolute",
    backgroundSize: "300%",
    width: "calc(100% + 4px)",
    height: "calc(100% + 4px)",
    animation: `${animated} 20s linear infinite`,
  };

  return {
    position: "relative",
    ":before": { ...COMMON_STYLE },
    ":after": { ...COMMON_STYLE, filter: "blur(30px)", opacity: 0.65 },
  };
});

const RootStyle = styled("div")(({ theme }) => ({
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  display: "grid",
  position: "fixed",
  placeItems: "center",
  backgroundColor: theme.palette.background.default,
}));

const SplashScreen = () => (
  <RootStyle>
    <GradientBox>
      <Box
        p={4}
        zIndex={1}
        width={100}
        height={100}
        component={Card}
        borderRadius="50%"
        position="relative"
        boxSizing="border-box"
      >
        <Box
          component="img"
          src="/static/logo/logo-svg.svg"
          alt="essence"
          width="100%"
        />
      </Box>
    </GradientBox>
  </RootStyle>
);

export default SplashScreen;

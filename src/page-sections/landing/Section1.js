import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, Card, Container, Stack, keyframes, styled, } from "@mui/material";
// CUSTOM COMPONENT
import { H1, Paragraph } from "@/components/typography";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
const shine = keyframes `
0% {
  background-position: 0% 50%;
}
100% {
  background-position: 100% 50%;
}
`;
const animated = keyframes `
0% {
	background-position: 120% 0;
}
50% {
  background-position: 220% 0%;
}
100% {
	background-position: 0 0;
}
`;
// STYLED COMPONENTS
const MainTitle = styled(H1)(() => ({
    background: `linear-gradient(300deg, #6950E8 0%,#FB6186 25%, #6950E8 50%, #FB6186 75%,#6950E8 100%)`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textFillColor: "transparent",
    backgroundSize: "150% auto",
    animation: `${shine} 6s ease-in-out infinite alternate`,
}));
const ImageBox = styled("div")(({ theme }) => {
    const color = `${theme.palette.primary[600]}, ${theme.palette.primary.main}, ${theme.palette.error.main}, ${theme.palette.info.main}, ${theme.palette.primary.main}, ${theme.palette.primary[400]}`;
    const COMMON_STYLE = {
        top: -3,
        left: -3,
        content: "''",
        borderRadius: 16,
        background: `linear-gradient(45deg, ${color})`,
        position: "absolute",
        backgroundSize: "600%",
        width: "calc(100% + 6px)",
        height: "calc(100% + 6px)",
        animation: `${animated} 10s linear infinite`,
    };
    return {
        position: "relative",
        ":before": { ...COMMON_STYLE },
        ":after": { ...COMMON_STYLE, filter: "blur(8px)", opacity: 0.65 },
    };
});
const ShadowBox = styled(Box, {
    shouldForwardProp: (prop) => prop !== "value",
})(({ value }) => ({
    background: `rgba(255,255,255, ${value || 0.012})`,
    borderRadius: 24,
    padding: 32,
}));
const Section1 = () => {
    const navigate = useNavigate();
    return (_jsx(Box, { bgcolor: "#1C113D", py: 4, children: _jsxs(Container, { maxWidth: "md", children: [_jsxs(Box, { textAlign: "center", mb: 5, children: [_jsxs(Paragraph, { color: "white", fontSize: 42, fontWeight: 600, children: ["Power up ", _jsx("br", {}), " Productivity with"] }), _jsx(MainTitle, { fontSize: 92, fontWeight: 800, children: "Essence" }), _jsxs(Paragraph, { color: "white", fontSize: 18, mt: 1, children: ["Choose from React CRA/Vite/Next.js versions, ", _jsx("br", {}), " with both RTL support and Dark/Light themes included."] }), _jsxs(Stack, { mt: 6, direction: "row", gap: 2, alignItems: "center", justifyContent: "center", children: [_jsx(Button, { onClick: () => navigate("/components"), sx: { paddingInline: 3, paddingBlock: 1 }, children: "Browse Components" }), _jsx(Button, { variant: "outlined", onClick: () => navigate("/dashboard/ecommerce"), sx: { paddingInline: 3, paddingBlock: 1 }, children: "View Demo" })] })] }), _jsx(ShadowBox, { value: 0.012, children: _jsx(ShadowBox, { value: 0.02, children: _jsx(ShadowBox, { value: 0.025, textAlign: "center", children: _jsx(ImageBox, { children: _jsx(Card, { alt: "demo", component: "img", loading: "eager", src: "/static/landing/dashboard.jpg", sx: {
                                        zIndex: 1,
                                        width: "100%",
                                        display: "block",
                                        position: "relative",
                                        minHeight: { lg: 374, xs: 200 },
                                    } }) }) }) }) })] }) }));
};
export default Section1;

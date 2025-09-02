import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment } from "react";
import { Grid, Box, Divider, Typography } from "@mui/material";
import { Link } from "@/components/link";
import logoCCS from "@/components/logoccs-blanc.svg";
const Layout = ({ children, login, isMobile = false, currentStep = 1, totalSteps = 1, }) => {
    return (_jsx(Grid, { container: true, height: "100vh", overflow: "hidden", position: "relative", flexDirection: "column", children: _jsxs(Grid, { container: true, flex: "1 1 auto", sx: { overflow: "hidden" }, children: [_jsxs(Grid, { item: true, xs: 12, md: 3, sx: {
                        display: { xs: "none", md: "flex" },
                        position: "relative",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        py: 6,
                        px: 4,
                        textAlign: "center",
                        color: "#fff",
                        backgroundImage: `url('/static/background-login.jpg')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }, children: [_jsx(Box, { sx: {
                                position: "absolute",
                                inset: 0,
                                bgcolor: "rgba(103, 58, 183, 0.75)",
                                zIndex: 1,
                            } }), _jsxs(Box, { width: "100%", maxWidth: 320, mx: "auto", position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", children: [_jsx(Link, { href: "/", children: _jsx(Box, { component: "img", src: logoCCS, alt: "Logo CCS", sx: {
                                            width: 130,
                                            height: 130,
                                            cursor: "pointer",
                                            mb: 4,
                                            filter: "drop-shadow(0 0 8px rgba(0,0,0,0.7))",
                                        } }) }), login ? (_jsxs(_Fragment, { children: [_jsx(Typography, { variant: "h4", fontWeight: 700, gutterBottom: true, sx: {
                                                textShadow: "1px 1px 4px rgba(0,0,0,0.8)",
                                                letterSpacing: 1,
                                                mb: 0,
                                                userSelect: "none",
                                            }, children: "Bienvenue chez" }), _jsx(Typography, { variant: "h3", fontWeight: 700, gutterBottom: true, sx: {
                                                textShadow: "1px 1px 4px rgba(0,0,0,0.8)",
                                                letterSpacing: 2,
                                                mt: 0,
                                                userSelect: "none",
                                            }, children: "CCS DOM" }), _jsx(Typography, { variant: "subtitle1", sx: {
                                                opacity: 0.9,
                                                textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
                                                mb: 4,
                                                fontSize: "1.15rem",
                                                lineHeight: 1.5,
                                                textAlign: "center",
                                                userSelect: "none",
                                            }, children: "Une solution fiable et s\u00E9curis\u00E9e pour g\u00E9rer vos courriers, contrats et documents en toute simplicit\u00E9." })] })) : (_jsxs(Fragment, { children: [_jsx(Typography, { variant: "h5", fontWeight: 600, mb: 4, sx: { textShadow: "1px 1px 3px rgba(0,0,0,0.7)", userSelect: "none" }, children: "Simplifiez la gestion de votre domiciliation d\u2019entreprise avec notre solution digitale." }), _jsx(Divider, { sx: { borderColor: "primary.400", borderWidth: 1, my: 3 } })] })), _jsxs(Box, { my: 4, children: [_jsx(Typography, { variant: "h6", fontSize: 20, fontWeight: 600, gutterBottom: true, sx: { textShadow: "1px 1px 3px rgba(0,0,0,0.7)", userSelect: "none" }, children: "CCS DOM vous offre un espace d\u00E9di\u00E9" }), _jsx(Typography, { variant: "body1", sx: {
                                                opacity: 0.85,
                                                textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
                                                userSelect: "none",
                                            }, children: "Pour g\u00E9rer vos courriers, contrats et documents en toute simplicit\u00E9, o\u00F9 que vous soyez." })] })] })] }), _jsxs(Grid, { item: true, xs: 12, md: 9, sx: {
                        display: "flex",
                        flexDirection: "column",
                        height: "100vh",
                        bgcolor: "background.paper",
                        py: { xs: 0, md: 6 },
                        px: { xs: 2, md: 6 },
                        overflow: "hidden",
                        backgroundColor: { xs: "#f0f0f0", md: "background.paper" }, // gris clair mobile
                    }, children: [isMobile && (_jsxs(Box, { sx: {
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                p: 1,
                                bgcolor: "primary.main", // violet MUI
                                color: "white",
                                position: "sticky",
                                top: 0,
                                zIndex: 1200,
                                boxShadow: "0 2px 6px rgb(0 0 0 / 0.15)",
                                flexShrink: 0,
                            }, children: [_jsx(Box, { component: "img", src: logoCCS, alt: "Logo CCS", sx: { height: 80 } }), _jsx(Typography, { variant: "h6", fontWeight: "bold", flexGrow: 1, noWrap: true, color: "inherit", children: "Gestion Domiciliation" })] })), _jsx(Box, { sx: {
                                flexGrow: 1,
                                overflowY: "auto",
                                pt: { xs: 2, md: 0 },
                                height: { xs: "calc(100vh - 72px - 72px)", md: "auto" }, // header + footer mobiles
                            }, children: children }), isMobile && (_jsxs(Box, { component: "footer", sx: {
                                p: 1,
                                bgcolor: "primary.main", // violet MUI
                                color: "white",
                                textAlign: "center",
                                fontSize: 12,
                                position: "sticky",
                                bottom: 0,
                                zIndex: 1200,
                                boxShadow: "0 -2px 6px rgb(0 0 0 / 0.15)",
                                userSelect: "none",
                            }, children: ["\u00A9 ", new Date().getFullYear(), " CCS DOM. Tous droits r\u00E9serv\u00E9s."] }))] })] }) }));
};
export default Layout;

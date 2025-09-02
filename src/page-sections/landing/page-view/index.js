import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
// CUSTOM PAGE SECTIONS COMPONENTS
import Footer from "../Footer";
import Section1 from "../Section1";
import Section2 from "../Section2";
import Section3 from "../Section3";
import Section4 from "../Section4";
import HeaderDark from "../HeaderDark";
const LandingPageView = () => {
    return (_jsxs(Box, { height: "100%", sx: { overflowX: "hidden", backgroundColor: "background.default" }, children: [_jsx(Box, { bgcolor: "#1C113D", children: _jsx(Container, { maxWidth: "lg", children: _jsx(HeaderDark, {}) }) }), _jsx(Section1, {}), _jsx(Section2, {}), _jsx(Section3, {}), _jsx(Section4, {}), _jsx(Footer, {})] }));
};
export default LandingPageView;

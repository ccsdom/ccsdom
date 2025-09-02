import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Container, useTheme } from "@mui/material";
// CUSTOM COMPONENTS
import Footer from "./Footer";
import Header from "./Header";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
const MainLayout = ({ children }) => {
    return (_jsxs(Box, { bgcolor: isDark(useTheme()) ? "background.default" : "white", children: [_jsx(Container, { maxWidth: "lg", children: _jsx(Header, {}) }), children, _jsx(Footer, {})] }));
};
export default MainLayout;

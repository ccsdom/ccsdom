import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, SvgIcon, Typography, useTheme } from "@mui/material";
const SimpleDomCourrierIcon = (props) => {
    const theme = useTheme();
    const color = theme.palette.primary.main;
    return (_jsxs(SvgIcon, { ...props, viewBox: "0 0 64 64", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("rect", { x: "10", y: "22", width: "44", height: "26", rx: "3", ry: "3" }), _jsx("polyline", { points: "10,22 32,39 54,22" }), _jsx("polyline", { points: "20,22 32,10 44,22" }), _jsx("rect", { x: "28", y: "28", width: "8", height: "14", rx: "1", ry: "1", fill: color })] }));
};
const LogoCCSDomiciliationSimple = () => {
    const theme = useTheme();
    return (_jsxs(Box, { display: "flex", alignItems: "center", gap: 1.5, sx: { userSelect: "none", cursor: "pointer" }, children: [_jsx(SimpleDomCourrierIcon, { sx: { fontSize: 36 }, "aria-label": "Logo CCS domiciliation" }), _jsx(Typography, { variant: "h4", sx: {
                    fontWeight: "bold",
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    color: theme.palette.primary.main,
                    letterSpacing: 5,
                    userSelect: "none",
                }, children: "CCS" })] }));
};
export default LogoCCSDomiciliationSimple;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment } from "react";
import { Box, Stack, Divider, Container, useTheme, Button, } from "@mui/material";
import { InsertDriveFileOutlined, KeyboardBackspace, } from "@mui/icons-material";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
// CUSTOM COMPONENT
import { H6 } from "@/components/typography";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
// ==============================================================
const ComponentPageLayout = ({ title, children, fullLink, }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const url = fullLink ?? `https://mui.com/material-ui/react-${title.toLowerCase()}`;
    return (_jsxs(Fragment, { children: [_jsx(Box, { bgcolor: isDark(theme) ? "grey.800" : "grey.100", py: { sm: 10, xs: 5 }, children: _jsxs(Container, { children: [_jsx(H6, { fontSize: 24, mb: 2, children: title }), _jsx(Button, { onClick: () => navigate("/components"), startIcon: _jsx(KeyboardBackspace, { fontSize: "small" }), sx: { mr: 2 }, children: "Go Back" }), _jsxs(Button, { href: url, target: "_blank", color: "secondary", variant: "outlined", startIcon: _jsx(InsertDriveFileOutlined, {}), children: ["Browse ", title, " Doc"] })] }) }), _jsx(Divider, {}), _jsx(Container, { component: Stack, spacing: 6, sx: { py: { sm: 10, xs: 5 } }, children: children }), _jsx(Divider, {})] }));
};
export default ComponentPageLayout;

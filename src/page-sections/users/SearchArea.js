import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, IconButton, TextField } from "@mui/material";
import Search from "@mui/icons-material/Search";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
import useLocation from "@/hooks/useLocation";
// CUSTOM COMPONENTS
import { FlexBetween } from "@/components/flexbox";
// CUSTOM ICON COMPONENTS
import Apps from "@/icons/Apps";
import FormatBullets from "@/icons/FormatBullets";
// ==========================================================================================
const SearchArea = (props) => {
    const { value = "", onChange, gridRoute, listRoute } = props;
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const activeColor = (path) => pathname === path ? "primary.main" : "grey.400";
    return (_jsxs(FlexBetween, { gap: 1, my: 3, children: [_jsx(TextField, { value: value, onChange: onChange, placeholder: "Search...", InputProps: { startAdornment: _jsx(Search, {}) }, sx: { maxWidth: 400, width: "100%" } }), _jsxs(Box, { flexShrink: 0, className: "actions", children: [_jsx(IconButton, { onClick: () => navigate(listRoute), children: _jsx(FormatBullets, { sx: { color: activeColor(listRoute) } }) }), _jsx(IconButton, { onClick: () => navigate(gridRoute), children: _jsx(Apps, { sx: { color: activeColor(gridRoute) } }) })] })] }));
};
export default SearchArea;

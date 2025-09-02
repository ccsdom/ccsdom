import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { styled, TextField, MenuItem, IconButton } from "@mui/material";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
// CUSTOM COMPONENTS
import { FlexBox } from "@/components/flexbox";
// CUSTOM ICON COMPONENTS
import FormatBullets from "@/icons/FormatBullets";
import Apps from "@/icons/Apps";
//  STYLED COMPONENTS
const Wrapper = styled(FlexBox)(({ theme }) => ({
    alignItems: "center",
    ".select": { flex: "1 1 200px" },
    [theme.breakpoints.down(440)]: {
        ".navigation": { display: "none" },
    },
}));
// ==============================================================
const ProductTableActions = ({ handleChangeFilter, filter, }) => {
    const navigate = useNavigate();
    const PUBLISH_PRODUCTS = [
        { id: 1, name: "All", value: "" },
        { id: 2, name: "Published", value: "published" },
        { id: 3, name: "Draft", value: "draft" },
    ];
    return (_jsxs(Wrapper, { gap: 2, px: 2, py: 4, children: [_jsx(TextField, { select: true, fullWidth: true, label: "Publish", className: "select", value: filter.publish, onChange: (e) => handleChangeFilter("publish", e.target.value), children: PUBLISH_PRODUCTS.map(({ id, name, value }) => (_jsx(MenuItem, { value: value, children: name }, id))) }), _jsx(TextField, { fullWidth: true, label: "Search by product name...", value: filter.search, onChange: (e) => handleChangeFilter("search", e.target.value) }), _jsxs(FlexBox, { alignItems: "center", className: "navigation", children: [_jsx(IconButton, { children: _jsx(FormatBullets, { color: "primary" }) }), _jsx(IconButton, { onClick: () => navigate("/dashboard/product-grid"), children: _jsx(Apps, {}) })] })] }));
};
export default ProductTableActions;

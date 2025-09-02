import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Avatar, Checkbox, Chip, TableCell, TableRow } from "@mui/material";
import { DeleteOutline, Edit, RemoveRedEye } from "@mui/icons-material";
import { format } from "date-fns";
// CUSTOM COMPONENTS
import { FlexBox } from "@/components/flexbox";
import { Paragraph } from "@/components/typography";
import { TableMoreMenuItem, TableMoreMenu } from "@/components/table";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
// ==============================================================
const ProductTableRow = ({ product, isSelected, handleSelectRow, handleDeleteProduct, }) => {
    const navigate = useNavigate();
    const [openMenuEl, setOpenMenuEl] = useState(null);
    const handleOpenMenu = (event) => {
        setOpenMenuEl(event.currentTarget);
    };
    const handleCloseOpenMenu = () => setOpenMenuEl(null);
    return (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { padding: "checkbox", children: _jsx(Checkbox, { size: "small", color: "primary", checked: isSelected, onClick: (event) => handleSelectRow(event, product.id) }) }), _jsx(TableCell, { padding: "normal", children: _jsxs(FlexBox, { alignItems: "center", gap: 2, children: [_jsx(Avatar, { variant: "rounded", alt: product.name, src: product.image, sx: { width: 50, height: 50 } }), _jsxs("div", { children: [_jsx(Paragraph, { fontWeight: 500, color: "text.primary", sx: {
                                        ":hover": { textDecoration: "underline", cursor: "pointer" },
                                    }, children: product.name }), _jsx(Paragraph, { fontSize: 13, children: product.category })] })] }) }), _jsx(TableCell, { padding: "normal", children: format(new Date(product.createdAt), "dd MMM yyyy") }), _jsx(TableCell, { padding: "normal", sx: { ...(product.stock === 0 && { color: "error.main" }) }, children: product.stock }), _jsxs(TableCell, { padding: "normal", children: ["$", product.price] }), _jsx(TableCell, { padding: "normal", children: product.published ? (_jsx(Chip, { label: "Published" })) : (_jsx(Chip, { label: "Draft", color: "secondary" })) }), _jsx(TableCell, { padding: "normal", align: "right", children: _jsxs(TableMoreMenu, { open: openMenuEl, handleOpen: handleOpenMenu, handleClose: handleCloseOpenMenu, children: [_jsx(TableMoreMenuItem, { Icon: RemoveRedEye, title: "View", handleClick: () => {
                                handleCloseOpenMenu();
                                navigate("/dashboard/product-details");
                            } }), _jsx(TableMoreMenuItem, { Icon: Edit, title: "Edit", handleClick: () => {
                                handleCloseOpenMenu();
                                navigate("/dashboard/create-product");
                            } }), _jsx(TableMoreMenuItem, { Icon: DeleteOutline, title: "Delete", handleClick: () => {
                                handleCloseOpenMenu();
                                handleDeleteProduct(product.id);
                            } })] }) })] }));
};
export default ProductTableRow;

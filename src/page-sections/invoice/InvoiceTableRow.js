import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Avatar, Checkbox, Chip, TableCell, TableRow, } from "@mui/material";
import { DeleteOutline, Edit } from "@mui/icons-material";
import { format } from "date-fns";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
// CUSTOM COMPONENTS
import { FlexBox } from "@/components/flexbox";
import { Paragraph } from "@/components/typography";
import { TableMoreMenuItem, TableMoreMenu } from "@/components/table";
// ==============================================================
const InvoiceTableRow = (props) => {
    const { invoice, handleDeleteInvoice, isSelected, handleSelectRow } = props;
    const navigate = useNavigate();
    const [openMenuEl, setOpenMenuEl] = useState(null);
    const handleOpenMenu = (event) => {
        setOpenMenuEl(event.currentTarget);
    };
    const handleCloseOpenMenu = () => setOpenMenuEl(null);
    return (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { padding: "checkbox", children: _jsx(Checkbox, { size: "small", color: "primary", checked: isSelected, onClick: (event) => handleSelectRow(event, invoice.id) }) }), _jsx(TableCell, { padding: "normal", children: _jsxs(FlexBox, { alignItems: "center", gap: 2, children: [_jsx(Avatar, { src: invoice.avatar, alt: invoice.name, variant: "rounded" }), _jsxs("div", { children: [_jsx(Paragraph, { fontWeight: 500, color: "text.primary", sx: {
                                        ":hover": { textDecoration: "underline", cursor: "pointer" },
                                    }, children: invoice.name }), _jsx(Paragraph, { fontSize: 13, children: invoice.id.substring(0, 15) })] })] }) }), _jsx(TableCell, { padding: "normal", children: invoice.email }), _jsx(TableCell, { padding: "normal", children: _jsx(Paragraph, { color: "text.secondary", children: format(invoice.date, "MMM dd, yyyy") }) }), _jsx(TableCell, { padding: "normal", children: _jsx(Chip, { size: "small", label: invoice.status, color: invoice.status === "Complete" ? "success" : "error" }) }), _jsx(TableCell, { padding: "normal", children: _jsxs(TableMoreMenu, { open: openMenuEl, handleOpen: handleOpenMenu, handleClose: handleCloseOpenMenu, children: [_jsx(TableMoreMenuItem, { Icon: Edit, title: "Edit", handleClick: () => {
                                handleCloseOpenMenu();
                                navigate("/dashboard/invoice-details");
                            } }), _jsx(TableMoreMenuItem, { Icon: DeleteOutline, title: "Delete", handleClick: () => {
                                handleCloseOpenMenu();
                                handleDeleteInvoice(invoice.id);
                            } })] }) })] }));
};
export default InvoiceTableRow;

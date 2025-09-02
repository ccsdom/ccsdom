import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Avatar, Checkbox, TableCell, TableRow } from "@mui/material";
import { DeleteOutline, Edit } from "@mui/icons-material";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
// CUSTOM COMPONENTS
import { FlexBox } from "@/components/flexbox";
import { Paragraph } from "@/components/typography";
import { TableMoreMenuItem, TableMoreMenu } from "@/components/table";
// ==============================================================
const UserTableRow = (props) => {
    const { user, isSelected, handleSelectRow, handleDeleteUser } = props;
    const navigate = useNavigate();
    const [openMenuEl, setOpenMenuEl] = useState(null);
    const handleOpenMenu = (event) => {
        setOpenMenuEl(event.currentTarget);
    };
    const handleCloseOpenMenu = () => setOpenMenuEl(null);
    return (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { padding: "checkbox", children: _jsx(Checkbox, { size: "small", color: "primary", checked: isSelected, onClick: (event) => handleSelectRow(event, user.id) }) }), _jsx(TableCell, { padding: "normal", children: _jsxs(FlexBox, { alignItems: "center", gap: 2, children: [_jsx(Avatar, { src: user.avatar, alt: user.name, variant: "rounded" }), _jsxs("div", { children: [_jsx(Paragraph, { fontWeight: 500, color: "text.primary", sx: {
                                        ":hover": { textDecoration: "underline", cursor: "pointer" },
                                    }, children: user.name }), _jsxs(Paragraph, { fontSize: 13, children: ["#", user.id.substring(0, 11)] })] })] }) }), _jsx(TableCell, { padding: "normal", children: user.email }), _jsx(TableCell, { padding: "normal", children: user.company }), _jsx(TableCell, { padding: "normal", children: user.role }), _jsx(TableCell, { padding: "normal", children: _jsxs(TableMoreMenu, { open: openMenuEl, handleOpen: handleOpenMenu, handleClose: handleCloseOpenMenu, children: [_jsx(TableMoreMenuItem, { Icon: Edit, title: "Edit", handleClick: () => {
                                handleCloseOpenMenu();
                                navigate("/dashboard/add-user");
                            } }), _jsx(TableMoreMenuItem, { Icon: DeleteOutline, title: "Delete", handleClick: () => {
                                handleCloseOpenMenu();
                                handleDeleteUser(user.id);
                            } })] }) })] }));
};
export default UserTableRow;

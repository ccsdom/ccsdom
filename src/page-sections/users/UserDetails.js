import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Menu, Stack, Button, Avatar, useTheme, IconButton, } from "@mui/material";
import { DeleteOutline } from "@mui/icons-material";
// CUSTOM COMPONENTS
import { Modal } from "@/components/modal";
import AddContactForm from "./AddContactForm";
import { TableMoreMenuItem } from "@/components/table";
import { H6, Paragraph } from "@/components/typography";
import FlexBetween from "@/components/flexbox/FlexBetween";
// CUSTOM ICON COMPONENTS
import Add from "@/icons/Add";
import Call from "@/icons/Call";
import City from "@/icons/City";
import Edit from "@/icons/Edit";
import Flag from "@/icons/Flag";
import User from "@/icons/User";
import Email from "@/icons/Email";
import Skype from "@/icons/Skype";
import ShareVs from "@/icons/ShareVs";
import Birthday from "@/icons/Birthday";
import Facebook from "@/icons/Facebook";
import Whatsapp from "@/icons/Whatsapp";
import Messenger from "@/icons/Messenger";
import MoreHorizontal from "@/icons/MoreHorizontal";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
// ==============================================================
const UserDetails = ({ data }) => {
    const theme = useTheme();
    const [isEdit, setIsEdit] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const handleCloseModal = () => setOpenModal(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const handleCloseMenu = () => setAnchorEl(null);
    return (_jsxs(Box, { sx: {
            padding: 3,
            height: "100%",
            borderTopRightRadius: "1rem",
            borderBottomRightRadius: "1rem",
            backgroundColor: isDark(theme) ? "grey.800" : "grey.100",
        }, children: [_jsx(Button, { fullWidth: true, variant: "contained", startIcon: _jsx(Add, {}), onClick: () => setOpenModal(true), children: "Add Contact" }), _jsx(Modal, { open: openModal, handleClose: handleCloseModal, children: _jsx(AddContactForm, { handleCancel: handleCloseModal, data: isEdit ? data : null }) }), data ? (_jsxs(_Fragment, { children: [_jsxs(FlexBetween, { mt: 4, children: [_jsx(IconButton, { onClick: () => {
                                    setIsEdit(true);
                                    setOpenModal(true);
                                }, children: _jsx(Edit, { fontSize: "small", sx: { color: "text.secondary" } }) }), _jsx(IconButton, { sx: { backgroundColor: isDark(theme) ? "grey.700" : "white" }, onClick: (e) => setAnchorEl(e.currentTarget), children: _jsx(MoreHorizontal, { fontSize: "small", sx: { color: "text.secondary" } }) }), _jsx(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: handleCloseMenu, transformOrigin: { vertical: "center", horizontal: "right" }, children: _jsx(TableMoreMenuItem, { Icon: DeleteOutline, title: "Delete", handleClick: () => {
                                        handleCloseMenu();
                                    } }) })] }), _jsxs(Stack, { alignItems: "center", children: [_jsx(Avatar, { src: data.avatar, sx: { width: 120, height: 120, backgroundColor: "white" } }), _jsx(H6, { fontSize: 16, mt: 2, children: data.name }), _jsx(Paragraph, { color: "text.secondary", mt: 0.5, children: data.position })] }), _jsxs(Box, { mt: 4, children: [_jsx(ListItem, { Icon: Birthday, title: "June 3, 1996" }), _jsx(ListItem, { Icon: User, title: "Female" }), _jsx(ListItem, { Icon: City, title: data.company }), _jsx(ListItem, { Icon: Email, title: data.email }), _jsx(ListItem, { Icon: Call, title: data.phone }), _jsx(ListItem, { Icon: ShareVs, title: "http://carriepage.com" }), _jsx(ListItem, { Icon: Flag, title: "6956 Henderson Park" })] }), _jsxs(Box, { mt: 2, children: [_jsx(ListItem, { Icon: Messenger, title: data.phone }), _jsx(ListItem, { Icon: Facebook, title: "facebook-carrie-page" }), _jsx(ListItem, { Icon: Skype, title: "carrie-page" }), _jsx(ListItem, { Icon: Whatsapp, title: "+1 (345) 556-2248" })] })] })) : (_jsx(Box, { height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "text.secondary", children: "No Data" }))] }));
};
export default UserDetails;
// ===================================================================
function ListItem({ Icon, title }) {
    return (_jsxs(Stack, { direction: "row", spacing: 1.5, pb: 2, alignItems: "center", children: [_jsx(Icon, { sx: { color: "text.secondary", fontSize: 20 } }), _jsx(Paragraph, { color: "grey.500", children: title })] }));
}

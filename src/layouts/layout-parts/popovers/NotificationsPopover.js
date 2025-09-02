import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment, useRef, useState } from "react";
import { Badge, Box, IconButton } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import PopoverLayout from "./PopoverLayout";
import { Paragraph, Small } from "@/components/typography";
import NotificationsIcon from "@/icons/NotificationsIcon";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
const NOTIFICATIONS = [
    {
        id: "n1",
        createdAt: Date.now() - 5 * 60 * 1000,
        title: "Nouveau courrier à consulter",
        message: "Vous avez reçu un courrier important de la mairie.",
        status: "info",
        link: "/client/courriers",
    },
    {
        id: "n2",
        createdAt: Date.now() - 60 * 60 * 1000,
        title: "Facture impayée",
        message: "Votre facture de juillet n’a pas encore été réglée.",
        status: "urgent",
        link: "/client/factures",
    },
    {
        id: "n3",
        createdAt: Date.now() - 24 * 60 * 60 * 1000,
        title: "Dossier incomplet",
        message: "Merci de compléter les documents manquants sur votre dossier.",
        status: "warning",
        link: "/client/documents",
    },
];
const NotificationsPopover = () => {
    const anchorRef = useRef(null);
    const [open, setOpen] = useState(false);
    const unreadCount = NOTIFICATIONS.length;
    return (_jsxs(Fragment, { children: [_jsx(IconButton, { ref: anchorRef, onClick: () => setOpen((prev) => !prev), "aria-label": "Afficher les notifications", "aria-haspopup": "true", "aria-expanded": open ? "true" : "false", children: _jsx(Badge, { color: "error", badgeContent: unreadCount, max: 99, children: _jsx(NotificationsIcon, { sx: { color: "grey.400" } }) }) }), _jsx(PopoverLayout, { title: "Notifications", popoverOpen: open, anchorRef: anchorRef, popoverClose: () => setOpen(false), children: NOTIFICATIONS.length === 0 ? (_jsx(Paragraph, { fontWeight: 500, textAlign: "center", p: 2, children: "Aucune notification" })) : (NOTIFICATIONS.map((notif) => _jsx(NotificationItem, { notif: notif }, notif.id))) })] }));
};
function getRelativeTime(timestamp) {
    const diffSeconds = (Date.now() - timestamp) / 1000;
    if (diffSeconds < 60)
        return `il y a ${Math.floor(diffSeconds)} seconde${Math.floor(diffSeconds) > 1 ? "s" : ""}`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60)
        return `il y a ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24)
        return `il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`;
    const diffDays = Math.floor(diffHours / 24);
    return `il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
}
function NotificationItem({ notif }) {
    const renderIcon = () => {
        switch (notif.status) {
            case "urgent":
                return _jsx(WarningAmberIcon, { fontSize: "small", color: "primary" });
            case "warning":
                return _jsx(DescriptionIcon, { fontSize: "small", color: "primary" });
            default:
                return _jsx(MailOutlineIcon, { fontSize: "small", color: "primary" });
        }
    };
    return (_jsxs(RouterLink, { to: notif.link, style: {
            display: "flex",
            alignItems: "center",
            padding: 16,
            gap: 16,
            borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
            cursor: "pointer",
            color: "inherit",
            textDecoration: "none",
        }, "aria-label": notif.title, tabIndex: 0, children: [_jsx(Box, { sx: {
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }, children: renderIcon() }), _jsxs(Box, { sx: { flex: 1, minWidth: 0 }, children: [_jsx(Paragraph, { fontWeight: 600, sx: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: notif.title }), _jsx(Small, { ellipsis: true, color: "text.secondary", title: notif.message, children: notif.message })] }), _jsx(Small, { color: "text.secondary", sx: { whiteSpace: "nowrap", ml: "auto" }, children: getRelativeTime(notif.createdAt) })] }));
}
export default NotificationsPopover;

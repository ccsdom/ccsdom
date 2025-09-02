import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Typography, Paper } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
const iconMap = {
    document: { icon: _jsx(WarningAmberIcon, { color: "warning" }), label: "Attention" },
    facture: { icon: _jsx(ErrorOutlineIcon, { color: "error" }), label: "Facture en retard" },
    general: { icon: _jsx(WarningAmberIcon, { color: "info" }), label: "Info" },
};
const Notifications = ({ notifications }) => {
    if (!notifications.length)
        return null;
    return (_jsx(Box, { display: "flex", flexDirection: "column", gap: 2, children: notifications.map((notif) => {
            const { icon, label } = iconMap[notif.type] || iconMap.general;
            return (_jsxs(Paper, { elevation: 1, sx: {
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                }, children: [_jsx(Box, { mr: 2, children: icon }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", fontWeight: 600, color: "text.primary", children: label }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: notif.message })] })] }, notif.id));
        }) }));
};
export default Notifications;

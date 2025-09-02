import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface Notification {
  id: string;
  type: "document" | "facture" | "general";
  message: string;
}

interface Props {
  notifications: Notification[];
}

const iconMap = {
  document: { icon: <WarningAmberIcon color="warning" />, label: "Attention" },
  facture: { icon: <ErrorOutlineIcon color="error" />, label: "Facture en retard" },
  general: { icon: <WarningAmberIcon color="info" />, label: "Info" },
};

const Notifications: React.FC<Props> = ({ notifications }) => {
  if (!notifications.length) return null;

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {notifications.map((notif) => {
        const { icon, label } = iconMap[notif.type] || iconMap.general;

        return (
          <Paper
            key={notif.id}
            elevation={1}
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              borderRadius: 2,
              bgcolor: "background.paper",
            }}
          >
            <Box mr={2}>{icon}</Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                {label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {notif.message}
              </Typography>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
};

export default Notifications;

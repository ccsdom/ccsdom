import { Fragment, useRef, useState } from "react";
import { Badge, Box, IconButton } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import PopoverLayout from "./PopoverLayout";
import { Paragraph, Small } from "@/components/typography";
import NotificationsIcon from "@/icons/NotificationsIcon";
import { useTranslation } from "react-i18next";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

type NotificationType = {
  id: string;
  createdAt: number;
  title: string;
  message: string;
  status: "info" | "warning" | "urgent";
  link: string;
};

const NOTIFICATIONS: NotificationType[] = [
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
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  const unreadCount = NOTIFICATIONS.length;

  return (
    <Fragment>
      <IconButton
        ref={anchorRef}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Afficher les notifications"
        aria-haspopup="true"
        aria-expanded={open ? "true" : "false"}
      >
        <Badge color="error" badgeContent={unreadCount} max={99}>
          <NotificationsIcon sx={{ color: "grey.400" }} />
        </Badge>
      </IconButton>

      <PopoverLayout
        title="Notifications"
        popoverOpen={open}
        anchorRef={anchorRef}
        popoverClose={() => setOpen(false)}
      >
        {NOTIFICATIONS.length === 0 ? (
          <Paragraph fontWeight={500} textAlign="center" p={2}>
            Aucune notification
          </Paragraph>
        ) : (
          NOTIFICATIONS.map((notif) => <NotificationItem key={notif.id} notif={notif} />)
        )}
      </PopoverLayout>
    </Fragment>
  );
};

function getRelativeTime(timestamp: number) {
  const diffSeconds = (Date.now() - timestamp) / 1000;
  if (diffSeconds < 60) return `il y a ${Math.floor(diffSeconds)} seconde${Math.floor(diffSeconds) > 1 ? "s" : ""}`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `il y a ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`;
  const diffDays = Math.floor(diffHours / 24);
  return `il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
}

type NotificationItemProps = {
  notif: NotificationType;
};

function NotificationItem({ notif }: NotificationItemProps) {
  const renderIcon = () => {
    switch (notif.status) {
      case "urgent":
        return <WarningAmberIcon fontSize="small" color="primary" />;
      case "warning":
        return <DescriptionIcon fontSize="small" color="primary" />;
      default:
        return <MailOutlineIcon fontSize="small" color="primary" />;
    }
  };

  return (
    <RouterLink
      to={notif.link}
      style={{
        display: "flex",
        alignItems: "center",
        padding: 16,
        gap: 16,
        borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
        cursor: "pointer",
        color: "inherit",
        textDecoration: "none",
      }}
      aria-label={notif.title}
      tabIndex={0}
    >
      <Box
        sx={{
          width: 24,
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {renderIcon()}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Paragraph fontWeight={600} sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {notif.title}
        </Paragraph>
        <Small ellipsis color="text.secondary" title={notif.message}>
          {notif.message}
        </Small>
      </Box>

      <Small color="text.secondary" sx={{ whiteSpace: "nowrap", ml: "auto" }}>
        {getRelativeTime(notif.createdAt)}
      </Small>
    </RouterLink>
  );
}

export default NotificationsPopover;

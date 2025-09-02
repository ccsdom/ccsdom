import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Avatar,
  LinearProgress,
} from "@mui/material";
import { useTheme, alpha, styled } from "@mui/material/styles";
import {
  TrendingUp,
  Description,
  Notifications as NotificationsIcon,
  Refresh,
  Visibility,
} from "@mui/icons-material";
import { motion } from "framer-motion";

// Components
import Notifications from "./Notifications";
import RecentCourriersTable from "./RecentCourriersTable";
import LastInvoiceSummary from "./LastInvoiceSummary";
import DocumentsAccessControl from "./DocumentsAccessControl";

// Types
interface AppNotification {
  id: string;
  type: "document" | "facture" | "alerte" | "info";
  message: string;
  date: string;
  read: boolean;
}

interface Courrier {
  id: string;
  dateReception: string;
  expediteur: string;
  nomDocument: string;
  urlDocument: string;
  type: "facture" | "contrat" | "relevé" | "autre";
  important: boolean;
}

interface Facture {
  id: string;
  datePaiement: string;
  montant: number;
  numero: string;
  statut: "payée" | "en_retard" | "en_attente";
}

// Styled Components
const DashboardCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  background: theme.palette.background.paper,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: `0 12px 48px ${alpha(theme.palette.common.black, 0.12)}`,
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 12,
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.primary.main,
    0.1
  )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const ClientDashboardView: React.FC = () => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: "1",
      type: "document",
      message: "Votre document d'identité expire dans 15 jours",
      date: "2025-07-10",
      read: false,
    },
    {
      id: "2",
      type: "facture",
      message: "Facture #FAC-12345 impayée depuis 5 jours",
      date: "2025-07-09",
      read: false,
    },
    {
      id: "3",
      type: "alerte",
      message: "Nouveau courrier important reçu",
      date: "2025-07-08",
      read: true,
    },
  ]);

  const testCourriers: Courrier[] = [
    {
      id: "1",
      dateReception: "2025-07-10",
      expediteur: "Banque XYZ",
      nomDocument: "Relevé bancaire.pdf",
      urlDocument: "/documents/releve_bancaire.pdf",
      type: "relevé",
      important: true,
    },
    {
      id: "2",
      dateReception: "2025-07-09",
      expediteur: "Assurance ABC",
      nomDocument: "Contrat assurance.pdf",
      urlDocument: "/documents/contrat_assurance.pdf",
      type: "contrat",
      important: false,
    },
    {
      id: "3",
      dateReception: "2025-07-08",
      expediteur: "Société DEF",
      nomDocument: "Facture juillet.pdf",
      urlDocument: "/documents/facture_juillet.pdf",
      type: "facture",
      important: true,
    },
    {
      id: "4",
      dateReception: "2025-07-07",
      expediteur: "Banque XYZ",
      nomDocument: "Relevé bancaire juin.pdf",
      urlDocument: "/documents/releve_juin.pdf",
      type: "relevé",
      important: false,
    },
  ];

  const documentsAccessibles = true;

  const lastFacture: Facture = {
    id: "f1",
    datePaiement: "2025-07-01",
    montant: 120.0,
    numero: "FAC-12345",
    statut: "en_retard",
  };

  const stats = {
    totalDocuments: 47,
    documentsThisMonth: 8,
    pendingActions: 3,
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <Box pt={2} pb={4}>
      {/* Header avec titre et actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              letterSpacing: 0.5,
              color: "text.primary",
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: "text",
              textFillColor: "transparent",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Tableau de bord
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Bon retour, Martin. Voici l'état de vos documents.
          </Typography>
        </motion.div>

        <IconButton
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
            },
          }}
        >
          <Refresh />
        </IconButton>
      </Box>

      {/* Cartes de statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <motion.div variants={itemVariants}>
            <StatCard>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" fontWeight={700} color="primary.main">
                    {stats.totalDocuments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Documents totaux
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                  <Description color="primary" />
                </Avatar>
              </Box>
              <LinearProgress
                variant="determinate"
                value={75}
                sx={{ mt: 2, borderRadius: 2, height: 6 }}
                color="primary"
              />
            </StatCard>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div variants={itemVariants}>
            <StatCard>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" fontWeight={700} color="secondary.main">
                    {stats.documentsThisMonth}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ce mois-ci
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                  <TrendingUp color="secondary" />
                </Avatar>
              </Box>
              <LinearProgress
                variant="determinate"
                value={60}
                sx={{ mt: 2, borderRadius: 2, height: 6 }}
                color="secondary"
              />
            </StatCard>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div variants={itemVariants}>
            <StatCard>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" fontWeight={700} color="warning.main">
                    {stats.pendingActions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Actions en attente
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                  <NotificationsIcon color="warning" />
                </Avatar>
              </Box>
              <LinearProgress
                variant="determinate"
                value={40}
                sx={{ mt: 2, borderRadius: 2, height: 6 }}
                color="warning"
              />
            </StatCard>
          </motion.div>
        </Grid>
      </Grid>

      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <motion.div variants={itemVariants}>
              <DashboardCard>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight={600}>
                      Courriers récents
                    </Typography>
                    <Chip
                      icon={<Visibility />}
                      label="Voir tout"
                      variant="outlined"
                      size="small"
                      clickable
                    />
                  </Box>
                  <RecentCourriersTable
                    courriers={testCourriers}
                    documentsAccessibles={documentsAccessibles}
                  />
                </CardContent>
              </DashboardCard>
            </motion.div>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Box display="flex" flexDirection="column" gap={3}>
              <motion.div variants={itemVariants}>
                <LastInvoiceSummary facture={lastFacture} />
              </motion.div>

              <motion.div variants={itemVariants}>
                <DocumentsAccessControl accessible={documentsAccessibles} />
              </motion.div>

              <motion.div variants={itemVariants}>
                <DashboardCard>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" fontWeight={600}>
                        Notifications
                      </Typography>
                      <Chip
                        label={notifications.filter((n) => !n.read).length.toString()}
                        color="primary"
                        size="small"
                      />
                    </Box>

                    {/* IMPORTANT : on passe la LISTE complète au composant Notifications */}
                    <Notifications
                      notifications={notifications}
                      onMarkAsRead={markNotificationAsRead}
                    />
                  </CardContent>
                </DashboardCard>
              </motion.div>
            </Box>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};

export default ClientDashboardView;

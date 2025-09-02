import React, { useRef, useState, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  Stack,
  Paper,
  useTheme,
  alpha,
  CircularProgress,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Fade,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Security as SecurityIcon,
  CreditCard as CreditCardIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  Info as InfoIcon,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import { getAuth, signInAnonymously } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { PaymentData, CardInfo } from "./types/form";
import useAuth from "@/hooks/useAuth";
import { createStripeCheckoutSession } from "@/services/stripe";

type StepPaymentInfoProps = {
  data: PaymentData;
  onBack: () => void;
  onSubmit: (cardInfo: CardInfo) => void;
  codePostal?: string;
  formula?: string;
};

const StepPaymentInfo: React.FC<StepPaymentInfoProps> = ({
  data,
  onBack,
  onSubmit: _onSubmit,
  codePostal,
  formula = "standard",
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [anonSigning, setAnonSigning] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const clickGuard = useRef(false);

  const VPK = import.meta.env.VITE_STRIPE_PUBLIC_KEY as string | undefined;
  const FBASE = import.meta.env.VITE_FUNCTIONS_BASE_URL as string | undefined;

  // data.amount en EUROS -> conversion en centimes pour Stripe
  const amountEuros = typeof data.amount === "number" ? data.amount : undefined;
  const amountCents = typeof amountEuros === "number" ? Math.round(amountEuros * 100) : undefined;
  const currency = data.currency ?? "EUR";

  const prereqs = useMemo(
    () => ({
      loggedIn: !!user,
      hasStripePk: !!VPK,
      amountOk: Number.isInteger(amountCents) && (amountCents ?? 0) > 0,
      allOk: !!user && !!VPK && Number.isInteger(amountCents) && (amountCents ?? 0) > 0,
    }),
    [user, VPK, amountCents]
  );

  const startCheckout = async (uid: string, emailForReceipt: string) => {
    if (!amountCents) throw new Error("Montant invalide.");
    const ret = await createStripeCheckoutSession({
      userId: uid,
      email: emailForReceipt,
      formula,
      amount: amountCents,
    });

    if (typeof ret === "string" && ret.startsWith("http")) {
      window.location.assign(ret);
      return;
    }

    if (!VPK) throw new Error("Clé publique Stripe manquante.");
    const stripe = await loadStripe(VPK);
    if (!stripe) throw new Error("Impossible de charger Stripe.");
    const { error } = await stripe.redirectToCheckout({ sessionId: ret });
    if (error) throw new Error(error.message);
  };

  const handlePayment = async () => {
    if (clickGuard.current) return;
    clickGuard.current = true;
    setLoading(true);
    try {
      if (!VPK) throw new Error("Configuration de paiement incomplète.");
      if (!prereqs.amountOk) throw new Error("Montant invalide.");
      if (!user) throw new Error("Utilisateur non connecté.");

      const email = user.email ?? "test@example.com";
      await startCheckout(user.uid, email);
    } catch (e: any) {
      toast.error(e?.message ?? "Échec de la redirection vers le paiement.");
    } finally {
      setLoading(false);
      clickGuard.current = false;
    }
  };

  const handleAnonAndPay = async () => {
    try {
      if (!VPK) throw new Error("Configuration de paiement incomplète.");
      if (!prereqs.amountOk) throw new Error("Montant invalide.");
      setAnonSigning(true);
      const auth = getAuth();
      const cred = await signInAnonymously(auth);
      const uid = cred.user.uid;
      await startCheckout(uid, "test@example.com");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Impossible de lancer le paiement en mode test.");
      setAnonSigning(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{ px: { xs: 1, sm: 2 }, py: 2 }}
    >
      {/* En-tête */}
      <Box textAlign="center" mb={4}>
        <motion.div variants={itemVariants}>
          <Typography
            variant="h3"
            fontWeight="bold"
            gutterBottom
            color="primary.main"
          >
            Paiement sécurisé
          </Typography>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Typography variant="subtitle1" color="text.secondary">
            Finalisez votre abonnement avec notre système de paiement sécurisé
          </Typography>
        </motion.div>
      </Box>

      <Stack spacing={4}>
        {/* Résumé de la commande */}
        <motion.div variants={itemVariants}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(10px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <CreditCardIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Résumé de la commande
              </Typography>
            </Box>

            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Formule:</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {formula}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Montant:</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {amountEuros !== undefined ? amountEuros.toFixed(2) : "—"} {currency}
                </Typography>
              </Box>
              
              {codePostal && (
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Code postal:</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {codePostal}
                  </Typography>
                </Box>
              )}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Box display="flex" justifyContent="space-between">
              <Typography variant="body1" fontWeight="bold">
                Total TTC:
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                {amountEuros !== undefined ? amountEuros.toFixed(2) : "—"} {currency}
              </Typography>
            </Box>
          </Paper>
        </motion.div>

        {/* Informations de sécurité */}
        <motion.div variants={itemVariants}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(10px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <SecurityIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Paiement sécurisé
              </Typography>
            </Box>

            <Stack spacing={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <LockIcon color="success" fontSize="small" />
                <Typography variant="body2">
                  Transactions cryptées et sécurisées
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" gap={1}>
                <CreditCardIcon color="success" fontSize="small" />
                <Typography variant="body2">
                  Supporte toutes les cartes bancaires
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" gap={1}>
                <VisibilityIcon color="success" fontSize="small" />
                <Typography variant="body2">
                  Aucune information bancaire stockée sur nos serveurs
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </motion.div>

        {/* Statut de connexion */}
        <motion.div variants={itemVariants}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(10px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <AccountCircleIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Statut de connexion
              </Typography>
            </Box>

            <Stack spacing={2}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2">Utilisateur:</Typography>
                <Chip
                  label={user ? "Connecté" : "Non connecté"}
                  color={user ? "success" : "warning"}
                  size="small"
                />
              </Box>
              
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2">Email:</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {user?.email ?? "Non renseigné"}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2">ID:</Typography>
                <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 120 }}>
                  {user?.uid ? `${user.uid.slice(0, 8)}...` : "—"}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </motion.div>

        {/* Messages d'alerte */}
        <AnimatePresence>
          {!prereqs.loggedIn && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert
                severity="warning"
                icon={<InfoIcon />}
                sx={{ borderRadius: 2 }}
                action={
                  <Tooltip title="Le mode test permet de tester le processus de paiement sans créer de compte">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }
              >
                Utilisateur non connecté. Connectez-vous ou utilisez le mode test.
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!prereqs.hasStripePk && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                Configuration de paiement incomplète. Veuillez contacter le support.
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!prereqs.amountOk && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                Montant invalide. Veuillez vérifier votre commande.
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <motion.div variants={itemVariants}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexDirection={{ xs: "column-reverse", sm: "row" }}
            gap={2}
          >
            <Button
              variant="outlined"
              onClick={onBack}
              startIcon={<ArrowBackIcon />}
              disabled={loading || anonSigning}
              sx={{ borderRadius: 2, minWidth: 140 }}
            >
              Précédent
            </Button>

            <Box display="flex" gap={2} flexDirection={{ xs: "column", sm: "row" }} width={{ xs: "100%", sm: "auto" }}>
              {!prereqs.loggedIn && (
                <Button
                  color="secondary"
                  variant="outlined"
                  onClick={handleAnonAndPay}
                  disabled={anonSigning || !prereqs.hasStripePk || !prereqs.amountOk}
                  startIcon={anonSigning ? <CircularProgress size={16} /> : <SecurityIcon />}
                  sx={{ borderRadius: 2, minWidth: 140 }}
                >
                  {anonSigning ? "Connexion..." : "Payer en mode test"}
                </Button>
              )}

              <Button
                variant="contained"
                onClick={handlePayment}
                disabled={loading || !prereqs.hasStripePk || !prereqs.amountOk || !prereqs.loggedIn}
                startIcon={loading ? <CircularProgress size={16} /> : <LockIcon />}
                sx={{ borderRadius: 2, minWidth: 160 }}
              >
                {loading ? "Redirection..." : `Payer ${amountEuros !== undefined ? amountEuros.toFixed(2) : "—"} ${currency}`}
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Stack>
    </Box>
  );
};

export default StepPaymentInfo;
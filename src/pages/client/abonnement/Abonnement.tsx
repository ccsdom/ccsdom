// src/pages/client/abonnement/Abonnement.tsx
import React, { useState, useMemo, useEffect } from "react";
import {
  Box, Card, Grid, Stack, Table, Alert, Button, Avatar, Divider,
  TableRow, TableBody, TableHead, TableCell, IconButton, AlertTitle, Chip,
  Typography, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Paper, Tabs, Tab, useTheme, alpha,
  Tooltip, Accordion, AccordionSummary, AccordionDetails, CardContent,
  LinearProgress, Fade, Skeleton, useMediaQuery
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import {
  Info as InfoIcon, Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon,
  CreditCard as CreditCardIcon, Receipt as ReceiptIcon, Payment as PaymentIcon,
  ExpandMore as ExpandMoreIcon, CheckCircle as CheckCircleIcon,
  Download as DownloadIcon, Visibility as VisibilityIcon,
  ArrowForward as ArrowForwardIcon, Savings as SavingsIcon,
  Business as BusinessIcon, LocationOn as LocationIcon,
  CalendarMonth as CalendarIcon, ArrowRightAlt as ArrowRightIcon
} from "@mui/icons-material";

import useAuth from "@/hooks/useAuth";
import { beginCheckoutRedirect, openCustomerPortal } from "@/lib/payments";

// Plans / prix
import {
  PLAN_META,
  priceIdFor,
  type BillingInterval,
  type PlanKey,
} from "@/config/pricing";

// Firestore (listeners)
import { listenUserPayments, listenUserInvoices } from "@/services/billing";
import type { PaymentDoc, InvoiceDoc } from "@/types/billing";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  className?: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`abonnement-tabpanel-${index}`}
      aria-labelledby={`abonnement-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

/** Cartes d'offres (dérivées de la source unique PLAN_META) */
const FORMULES: Array<{
  id: PlanKey;
  label: string;
  mensuel: number;
  annuel: number;
  features: string[];
  popular?: boolean;
}> = (Object.entries(PLAN_META) as Array<[PlanKey, (typeof PLAN_META)[PlanKey]]>).map(
  ([id, meta]) => ({
    id,
    label: meta.label,
    mensuel: meta.monthlyHT,
    annuel: meta.yearlyHT,
    features: meta.features,
    popular: meta.popular,
  })
);

const centsToEuro = (c: number | null | undefined) =>
  typeof c === "number" ? `${(c / 100).toFixed(2)} €` : "—";

// Composant Skeleton pour le chargement
const BillingSkeleton = () => (
  <>
    {[1, 2, 3].map((item) => (
      <TableRow key={item}>
        <TableCell><Skeleton variant="text" width={100} /></TableCell>
        <TableCell><Skeleton variant="text" width={120} /></TableCell>
        <TableCell><Skeleton variant="text" width={80} /></TableCell>
        <TableCell><Skeleton variant="text" width={80} /></TableCell>
        <TableCell><Skeleton variant="text" width={80} /></TableCell>
        <TableCell><Skeleton variant="rectangular" width={80} height={24} /></TableCell>
        <TableCell><Skeleton variant="circular" width={32} height={32} /></TableCell>
      </TableRow>
    ))}
  </>
);

const Abonnement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();

  const [formuleChoisie, setFormuleChoisie] = useState<PlanKey>("starter");
  const [modePaiement, setModePaiement] = useState<BillingInterval>("monthly");
  const [changerAbonnementOpen, setChangerAbonnementOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [editAdresseOpen, setEditAdresseOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [expandedFormule, setExpandedFormule] = useState<string | false>(false);

  // Données Firestore
  const [payments, setPayments] = useState<PaymentDoc[]>([]);
  const [invoices, setInvoices] = useState<InvoiceDoc[]>([]);
  const [loadingBilling, setLoadingBilling] = useState(true);

  // Adresse de facturation
  const [adresseFacturation, setAdresseFacturation] = useState({
    entreprise: "Ma Société SARL",
    adresse: "10 rue Exemple",
    ville: "75000 Paris",
    pays: "France",
    codePostal: "75000",
  });

  // Moyens de paiement
  const [moyensPaiement] = useState([
    { id: 1, type: "Visa", nom: "Jean Dupont", expiry: "09/24", last4: "1234", primary: true },
    { id: 2, type: "Mastercard", nom: "Jean Dupont", expiry: "11/25", last4: "5678", primary: false },
  ]);

  // Écoute Firestore
  useEffect(() => {
    if (!user?.uid) {
      setPayments([]);
      setInvoices([]);
      setLoadingBilling(false);
      return;
    }
    setLoadingBilling(true);
    const unsubs: Array<() => void> = [];
    unsubs.push(
      listenUserPayments(user.uid, (docs) => {
        setPayments(docs);
        setLoadingBilling(false);
      })
    );
    unsubs.push(
      listenUserInvoices(user.uid, (docs) => {
        setInvoices(docs);
        setLoadingBilling(false);
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [user?.uid]);

  // Calculs des prix
  const currentFormule = useMemo(
    () => FORMULES.find((f) => f.id === formuleChoisie)!,
    [formuleChoisie]
  );
  const prix = useMemo(
    () => (modePaiement === "monthly" ? currentFormule.mensuel : currentFormule.annuel),
    [currentFormule, modePaiement]
  );
  const economie = useMemo(
    () => (modePaiement === "yearly" ? currentFormule.mensuel * 12 - currentFormule.annuel : 0),
    [currentFormule, modePaiement]
  );

  // Checkout Stripe
  const handleCheckout = async () => {
    if (!user?.uid || !user?.email) {
      alert("Vous devez être connecté.");
      return;
    }
    setPaying(true);
    try {
      const priceId = priceIdFor(formuleChoisie, modePaiement);
      await beginCheckoutRedirect(
        {
          userId: user.uid,
          email: user.email,
          priceId,
          metadata: { plan: formuleChoisie, interval: modePaiement },
        },
        { newTab: true }
      );
    } catch (e: any) {
      alert(e?.message || "Paiement indisponible");
    } finally {
      setPaying(false);
    }
  };

  // Handlers UI
  const handleFormuleChange = (e: SelectChangeEvent<string>) =>
    setFormuleChoisie(e.target.value as PlanKey);
  const handleModeChange = (e: SelectChangeEvent<string>) =>
    setModePaiement(e.target.value as BillingInterval);
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) =>
    setTabValue(newValue);
  const handleFormuleExpand = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFormule(isExpanded ? panel : false);
  };
  const saveNewAbonnement = () => setChangerAbonnementOpen(false);
  const handleAdresseChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setAdresseFacturation((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const saveAdresseFacturation = () => setEditAdresseOpen(false);

  const getPaymentStatusChip = (status?: string | null) => {
    const s = (status || "").toLowerCase();
    const paid = s === "paid" || s === "succeeded";
    return (
      <Chip
        icon={<CheckCircleIcon />}
        label={paid ? "Payé" : (status ?? "—")}
        color={paid ? "success" : "default"}
        size="small"
        variant="outlined"
      />
    );
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <Avatar sx={{ 
          bgcolor: 'primary.main', 
          mr: 2, 
          width: 48, 
          height: 48,
          boxShadow: theme.shadows[2]
        }}>
          <CreditCardIcon />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Mon abonnement
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez votre formule, vos paiements et vos factures
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3,
            boxShadow: theme.shadows[2],
            background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${theme.palette.background.paper} 100%)`
          }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="onglets abonnement"
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons="auto"
                sx={{
                  minHeight: 60,
                  '& .MuiTab-root': {
                    padding: { xs: '12px 16px', md: '16px 24px' },
                    margin: { xs: '0 4px', md: '0 8px' },
                    minHeight: 60,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    minWidth: 'auto',
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    }
                  },
                }}
              >
                <Tab icon={<CreditCardIcon />} label="Mon abonnement" />
                <Tab icon={<ReceiptIcon />} label="Facturation" />
                <Tab icon={<PaymentIcon />} label="Paiements" />
              </Tabs>
            </Box>

            {/* Mon abonnement */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CreditCardIcon color="primary" /> Formule actuelle
                </Typography>

                <Card
                  sx={{
                    p: 3,
                    border: `2px solid ${theme.palette.primary.main}`,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'visible',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: -2,
                      left: -2,
                      right: -2,
                      bottom: -2,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 50%)`,
                      borderRadius: 3,
                      zIndex: -1,
                    }
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      {currentFormule.popular && (
                        <Chip 
                          label="Recommandé" 
                          color="primary" 
                          size="small" 
                          sx={{ mb: 1, fontWeight: 600 }} 
                        />
                      )}
                      <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {currentFormule.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarIcon fontSize="small" />
                        Prochain renouvellement: {modePaiement === "monthly" ? "01/08/2025" : "01/07/2026"}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {(prix || 0).toFixed(2)} € HT
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {modePaiement === "monthly" ? "par mois" : "par an"}
                      </Typography>
                      {economie > 0 && (
                        <Chip 
                          icon={<SavingsIcon />} 
                          label={`Économisez ${economie.toFixed(2)} €`} 
                          color="success" 
                          size="small" 
                          sx={{ mt: 1 }} 
                        />
                      )}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Fonctionnalités incluses :
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 3 }}>
                    {currentFormule.features.map((feature, i) => (
                      <Box key={i} sx={{ display: "flex", alignItems: "center" }}>
                        <CheckCircleIcon color="success" sx={{ fontSize: 18, mr: 1, flexShrink: 0 }} />
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <Button 
                      variant="outlined" 
                      onClick={() => setChangerAbonnementOpen(true)} 
                      startIcon={<EditIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      Changer de formule
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<ArrowForwardIcon />}
                      onClick={handleCheckout}
                      disabled={paying}
                      sx={{ borderRadius: 2 }}
                    >
                      {paying ? "Redirection…" : "Procéder au paiement"}
                    </Button>
                  </Stack>
                </Card>
              </Box>

              {/* Moyens de paiement */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PaymentIcon color="primary" /> Moyens de paiement
                </Typography>
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Moyen de paiement</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Titulaire</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Expiration</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {moyensPaiement.map((mp) => (
                        <TableRow key={mp.id} hover>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Avatar sx={{ 
                                borderRadius: "6px", 
                                height: 30, 
                                width: 46, 
                                bgcolor: theme.palette.grey[100],
                                color: theme.palette.text.primary,
                                fontWeight: 'bold',
                                border: `1px solid ${theme.palette.grey[300]}`
                              }}>
                                {mp.type[0]}
                              </Avatar>
                              <Box>
                                <Typography fontWeight={500}>{mp.type} **** {mp.last4}</Typography>
                                {mp.primary && (
                                  <Chip 
                                    label="Par défaut" 
                                    size="small" 
                                    color="primary" 
                                    variant="filled"
                                    sx={{ height: 20, fontSize: '0.7rem', mt: 0.5 }} 
                                  />
                                )}
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>{mp.nom}</TableCell>
                          <TableCell>{mp.expiry}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Modifier">
                              <IconButton 
                                aria-label="éditer moyen de paiement" 
                                size="small"
                                sx={{ 
                                  color: 'primary.main',
                                  '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton 
                                aria-label="supprimer moyen de paiement" 
                                size="small" 
                                sx={{ 
                                  color: 'error.main',
                                  '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.1) }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>

                <Button
                  variant="text"
                  startIcon={<AddIcon />}
                  sx={{ mt: 2, borderRadius: 2 }}
                  onClick={async () => {
                    if (!user?.uid || !user?.email) return alert("Vous devez être connecté.");
                    try {
                      await openCustomerPortal({
                        userId: user.uid,
                        email: user.email,
                        returnPath: "/client/abonnement",
                        newTab: true,
                      });
                    } catch (e: any) {
                      alert(e?.message || "Portail indisponible");
                    }
                  }}
                >
                  Gérer mes moyens de paiement
                </Button>
              </Box>
            </TabPanel>

            {/* Facturation */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon color="primary" /> Adresse de facturation
                </Typography>
                <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon color="action" fontSize="small" />
                        <Typography variant="body1" fontWeight="medium">{adresseFacturation.entreprise}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon color="action" fontSize="small" />
                        <Typography variant="body2" color="text.secondary">{adresseFacturation.adresse}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                        {adresseFacturation.codePostal} {adresseFacturation.ville}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                        {adresseFacturation.pays}
                      </Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => setEditAdresseOpen(true)} 
                      startIcon={<EditIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      Modifier
                    </Button>
                  </Box>
                </Card>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>Préférences de facturation</Typography>
                <Card variant="outlined" sx={{ p: 3, mb: 2, borderRadius: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <InfoIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Une copie de chaque facture sera envoyée à votre adresse email.
                    </Typography>
                  </Stack>
                </Card>
              </Box>

              {/* Historique des factures */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReceiptIcon color="primary" /> Mes factures
                </Typography>

<Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
  <Table>
    <TableHead>
      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
        <TableCell sx={{ fontWeight: 600 }}>N°</TableCell>
        <TableCell sx={{ fontWeight: 600 }}>Période</TableCell>
        <TableCell align="right" sx={{ fontWeight: 600 }}>Sous-total (HT)</TableCell>
        <TableCell align="right" sx={{ fontWeight: 600 }}>TVA</TableCell>
        <TableCell align="right" sx={{ fontWeight: 600 }}>Total (TTC)</TableCell>
        <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
        <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
      </TableRow>
    </TableHead>
    {/* CORRECTION : Ajout de la balise TableBody manquante */}
    <TableBody>
      {loadingBilling && <BillingSkeleton />}
      {!loadingBilling && invoices.length === 0 && (
        <TableRow>
          <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <ReceiptIcon color="disabled" sx={{ fontSize: 48 }} />
              <Typography variant="body2" color="text.secondary">
                Aucune facture pour le moment.
              </Typography>
            </Box>
          </TableCell>
        </TableRow>
      )}
      {invoices.map((inv) => (
        <TableRow key={inv.id} hover>
          <TableCell sx={{ fontWeight: 500 }}>{inv.number || inv.id}</TableCell>
          <TableCell>
            {inv.period_start && inv.period_end
              ? `${inv.period_start.toLocaleDateString()} → ${inv.period_end.toLocaleDateString()}`
              : "—"}
          </TableCell>
          <TableCell align="right">{centsToEuro((inv as any).subtotal)}</TableCell>
          <TableCell align="right">{centsToEuro(inv.tax)}</TableCell>
          <TableCell align="right" sx={{ fontWeight: 500 }}>
            {centsToEuro(inv.total)}
          </TableCell>
          <TableCell>
            <Chip
              label={inv.status ?? "—"}
              size="small"
              color={inv.status === "paid" ? "success" : "default"}
              variant="filled"
              sx={{ minWidth: 80 }}
            />
          </TableCell>
          <TableCell align="right">
            <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
              {inv.invoice_pdf && (
                <Tooltip title="Télécharger PDF">
                  <IconButton 
                    size="small" 
                    onClick={() => window.open(inv.invoice_pdf!, "_blank")}
                    sx={{ 
                      color: 'primary.main',
                      '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) }
                    }}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {inv.hosted_invoice_url && (
                <Tooltip title="Voir en ligne">
                  <IconButton 
                    size="small" 
                    onClick={() => window.open(inv.hosted_invoice_url!, "_blank")}
                    sx={{ 
                      color: 'primary.main',
                      '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) }
                    }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</Paper>

              </Box>
            </TabPanel>

            {/* Paiements */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentIcon color="primary" /> Historique des paiements
              </Typography>
              <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Montant (TTC)</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingBilling && <BillingSkeleton />}
                    {!loadingBilling && payments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <PaymentIcon color="disabled" sx={{ fontSize: 48 }} />
                            <Typography variant="body2" color="text.secondary">
                              Aucun paiement pour le moment.
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                    {payments.map((p) => {
                      const invoice = p.invoiceId ? invoices.find((i) => i.id === p.invoiceId) : undefined;
                      const desc = p.formula || "Paiement";
                      const date = p.createdAt || p.updatedAt || null;
                      return (
                        <TableRow key={p.id} hover>
                          <TableCell>{desc}</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {centsToEuro(invoice?.total ?? p.amount_total)}
                          </TableCell>
                          <TableCell>{date ? new Date(date as any).toLocaleDateString() : "—"}</TableCell>
                          <TableCell>{getPaymentStatusChip(p.status)}</TableCell>
                          <TableCell align="right">
                            {invoice?.invoice_pdf || invoice?.hosted_invoice_url ? (
                              <Tooltip title="Voir la facture">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    window.open(
                                      invoice?.invoice_pdf || (invoice?.hosted_invoice_url as string),
                                      "_blank"
                                    )
                                  }
                                  sx={{ 
                                    color: 'primary.main',
                                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) }
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Paper>
            </TabPanel>
          </Paper>
        </Grid>

        {/* Colonne droite */}
        <Grid item xs={12} md={4}>
          <Box sx={{ position: "sticky", top: 24 }}>
            <Card sx={{ 
              mb: 3, 
              borderRadius: 3,
              boxShadow: theme.shadows[3],
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReceiptIcon color="primary" /> Résumé de facturation
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Abonnement :</Typography>
                    <Typography variant="body2" fontWeight="medium">{currentFormule.label}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Période :</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {modePaiement === "monthly" ? "Mensuelle" : "Annuelle"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Montant :</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {(prix || 0).toFixed(2)} € HT
                    </Typography>
                  </Box>
                  {economie > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2">Économie :</Typography>
                      <Typography variant="body2" color="success.main" fontWeight="medium">
                        -{economie.toFixed(2)} €
                      </Typography>
                    </Box>
                  )}
                  <Divider />
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<ArrowForwardIcon />}
                    onClick={handleCheckout}
                    disabled={paying}
                    sx={{ borderRadius: 2, py: 1.5 }}
                  >
                    {paying ? "Redirection…" : "Procéder au paiement"}
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
                    Vous serez redirigé vers Stripe (nouvel onglet) pour finaliser le paiement.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ 
              borderRadius: 3,
              boxShadow: theme.shadows[2]
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CreditCardIcon color="primary" /> Formules disponibles
                </Typography>
                <Stack spacing={2}>
                  {FORMULES.map((formule) => (
                    <Accordion 
                      key={formule.id} 
                      elevation={0} 
                      expanded={expandedFormule === formule.id}
                      onChange={handleFormuleExpand(formule.id)}
                      sx={{ 
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '12px !important',
                        overflow: 'hidden',
                        '&:before': { display: 'none' }
                      }}
                    >
                      <AccordionSummary 
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          backgroundColor: formule.popular ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                          borderLeft: formule.popular ? `4px solid ${theme.palette.primary.main}` : 'none',
                          '& .MuiAccordionSummary-content': {
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 1
                          }
                        }}
                      >
                        <Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                            <Typography fontWeight="medium">{formule.label}</Typography>
                            {formule.popular && (
                              <Chip 
                                label="Recommandé" 
                                color="primary" 
                                size="small" 
                                sx={{ height: 20, fontSize: '0.7rem' }} 
                              />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {modePaiement === "monthly"
                              ? `${formule.mensuel.toFixed(2)} € HT/mois`
                              : `${formule.annuel.toFixed(2)} € HT/an`}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1}>
                          {formule.features.map((feature, i) => (
                            <Box key={i} sx={{ display: "flex", alignItems: "center" }}>
                              <CheckCircleIcon color="success" sx={{ fontSize: 16, mr: 1, flexShrink: 0 }} />
                              <Typography variant="body2">{feature}</Typography>
                            </Box>
                          ))}
                        </Stack>
                        <Button
                          variant={formule.id === formuleChoisie ? "outlined" : "contained"}
                          fullWidth
                          sx={{ mt: 2, borderRadius: 2 }}
                          onClick={() => {
                            setFormuleChoisie(formule.id);
                            setChangerAbonnementOpen(true);
                          }}
                          endIcon={formule.id !== formuleChoisie && <ArrowRightIcon />}
                        >
                          {formule.id === formuleChoisie ? "Formule actuelle" : "Choisir cette formule"}
                        </Button>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Dialog changement abonnement */}
      <Dialog 
        open={changerAbonnementOpen} 
        onClose={() => setChangerAbonnementOpen(false)} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ 
          backgroundColor: theme.palette.primary.main, 
          color: 'white',
          fontWeight: 'bold'
        }}>
          Changer d'abonnement
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Formule</InputLabel>
            <Select 
              value={formuleChoisie} 
              label="Formule" 
              onChange={handleFormuleChange}
              sx={{ borderRadius: 2 }}
            >
              {FORMULES.map((f) => (
                <MenuItem key={f.id} value={f.id}>{f.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Mode de facturation</InputLabel>
            <Select 
              value={modePaiement} 
              label="Mode de facturation" 
              onChange={handleModeChange}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="monthly">Mensuel</MenuItem>
              <MenuItem value="yearly">Annuel</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Récapitulatif :
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2">Nouvelle formule :</Typography>
              <Typography variant="body2" fontWeight="medium">{currentFormule.label}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2">Périodicité :</Typography>
              <Typography variant="body2" fontWeight="medium">
                {modePaiement === "monthly" ? "Mensuelle" : "Annuelle"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2">Prix HT :</Typography>
              <Typography variant="body2" fontWeight="medium">
                {(prix || 0).toFixed(2)} €
              </Typography>
            </Box>
            {economie > 0 && (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Économie :</Typography>
                <Typography variant="body2" color="success.main" fontWeight="medium">
                  -{economie.toFixed(2)} €
                </Typography>
              </Box>
            )}
          </Box>

          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            <AlertTitle>Changement d'abonnement</AlertTitle>
            Votre abonnement sera modifié immédiatement. Un ajustement de facturation sera appliqué pour refléter ce changement.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setChangerAbonnementOpen(false)} 
            sx={{ borderRadius: 2 }}
          >
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={saveNewAbonnement} 
            autoFocus
            sx={{ borderRadius: 2 }}
          >
            Confirmer le changement
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog modification adresse */}
      <Dialog 
        open={editAdresseOpen} 
        onClose={() => setEditAdresseOpen(false)} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ 
          backgroundColor: theme.palette.primary.main, 
          color: 'white',
          fontWeight: 'bold'
        }}>
          Modifier l'adresse de facturation
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Stack spacing={2}>
            <TextField
              name="entreprise"
              label="Entreprise"
              value={adresseFacturation.entreprise}
              onChange={handleAdresseChange}
              fullWidth
              sx={{ borderRadius: 2 }}
            />
            <TextField
              name="adresse"
              label="Adresse"
              value={adresseFacturation.adresse}
              onChange={handleAdresseChange}
              fullWidth
              sx={{ borderRadius: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  name="codePostal"
                  label="Code postal"
                  value={adresseFacturation.codePostal}
                  onChange={handleAdresseChange}
                  fullWidth
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="ville"
                  label="Ville"
                  value={adresseFacturation.ville}
                  onChange={handleAdresseChange}
                  fullWidth
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
            </Grid>
            <TextField
              name="pays"
              label="Pays"
              value={adresseFacturation.pays}
              onChange={handleAdresseChange}
              fullWidth
              sx={{ borderRadius: 2 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setEditAdresseOpen(false)} 
            sx={{ borderRadius: 2 }}
          >
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={saveAdresseFacturation} 
            autoFocus
            sx={{ borderRadius: 2 }}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Abonnement;
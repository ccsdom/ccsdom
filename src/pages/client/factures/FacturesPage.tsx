import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  Divider,
  Button,
  Stack,
  IconButton,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Tooltip,
  Paper,
  Grid,
  InputAdornment,
  TextField,
  Avatar,
  Badge,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  CalendarMonth as CalendarMonthIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

interface Facture {
  id: string;
  date: string;
  montant: number;
  statut: "payée" | "en retard" | "en attente";
  url: string;
  mois: string;
  annee: string;
  categorie?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`factures-tabpanel-${index}`}
      aria-labelledby={`factures-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const moisOptions = [
  { value: "all", label: "Tous les mois" },
  { value: "01", label: "Janvier" },
  { value: "02", label: "Février" },
  { value: "03", label: "Mars" },
  { value: "04", label: "Avril" },
  { value: "05", label: "Mai" },
  { value: "06", label: "Juin" },
  { value: "07", label: "Juillet" },
  { value: "08", label: "Août" },
  { value: "09", label: "Septembre" },
  { value: "10", label: "Octobre" },
  { value: "11", label: "Novembre" },
  { value: "12", label: "Décembre" },
];

const anneeOptions = [
  { value: "all", label: "Toutes les années" },
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
  { value: "2023", label: "2023" },
];

const statutOptions = [
  { value: "all", label: "Tous les statuts" },
  { value: "payée", label: "Payées" },
  { value: "en retard", label: "En retard" },
  { value: "en attente", label: "En attente" },
];

const mockFactures: Facture[] = [
  {
    id: "001244",
    date: "2025-06-01",
    montant: 264,
    statut: "en retard",
    url: "/mock/facture_001244.pdf",
    mois: "06",
    annee: "2025",
    categorie: "Abonnement",
  },
  {
    id: "001245",
    date: "2025-07-01",
    montant: 264,
    statut: "payée",
    url: "/mock/facture_001245.pdf",
    mois: "07",
    annee: "2025",
    categorie: "Abonnement",
  },
  {
    id: "001243",
    date: "2025-05-01",
    montant: 200,
    statut: "payée",
    url: "/mock/facture_001243.pdf",
    mois: "05",
    annee: "2025",
    categorie: "Abonnement",
  },
  {
    id: "001242",
    date: "2025-04-01",
    montant: 180,
    statut: "en attente",
    url: "/mock/facture_001242.pdf",
    mois: "04",
    annee: "2025",
    categorie: "Service additionnel",
  },
];

type Order = "asc" | "desc";

const FacturesPage = () => {
  const [mois, setMois] = useState("all");
  const [annee, setAnnee] = useState("all");
  const [statut, setStatut] = useState("all");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<keyof Facture>("date");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const theme = useTheme();

  const lignesParPage = 5;

  const handleRequestSort = (property: keyof Facture) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const filteredFactures = useMemo(() => {
    let result = mockFactures.filter((f) => {
      const matchesMois = mois === "all" || f.mois === mois;
      const matchesAnnee = annee === "all" || f.annee === annee;
      const matchesStatut = statut === "all" || f.statut === statut;
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        q === "" ||
        f.id.toLowerCase().includes(q) ||
        (f.categorie ?? "").toLowerCase().includes(q);

      return matchesMois && matchesAnnee && matchesStatut && matchesSearch;
    });

    // Tri robuste (gère string | number | undefined)
    const cmp = (aVal: unknown, bVal: unknown) => {
      const A = aVal ?? "";
      const B = bVal ?? "";
      if (typeof A === "number" && typeof B === "number") return A - B;
      return String(A).localeCompare(String(B));
    };

    result.sort((a, b) => {
      const dir = order === "asc" ? 1 : -1;
      return dir * cmp(a[orderBy], b[orderBy]);
    });

    return result;
  }, [mois, annee, statut, searchTerm, order, orderBy]);

  const pagedFactures = filteredFactures.slice(
    (page - 1) * lignesParPage,
    page * lignesParPage
  );

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(1);
  };

  const handlePreviewOpen = (url: string) => {
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
    setPreviewUrl("");
  };

  const getStatusChip = (s: Facture["statut"]) => {
    const statusConfig = {
      payée: { color: "success", label: "Payée", icon: <PaymentIcon /> },
      "en retard": { color: "error", label: "En retard", icon: <CalendarMonthIcon /> },
      "en attente": { color: "warning", label: "En attente", icon: <RefreshIcon /> },
    } as const;

    const config = statusConfig[s];
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color as any}
        size="small"
        variant="outlined"
        sx={{ fontWeight: "bold" }}
      />
    );
  };

  const getTotalMontant = () =>
    filteredFactures.reduce((total, facture) => total + facture.montant, 0);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2, width: 48, height: 48 }}>
          <ReceiptIcon />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Mes factures
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Consultez et gérez toutes vos factures
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              p: 2,
              height: "100%",
            }}
          >
            <Typography color="textSecondary" gutterBottom variant="body2">
              TOTAL FACTURES
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {filteredFactures.length}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: alpha(theme.palette.success.main, 0.05),
              borderLeft: `4px solid ${theme.palette.success.main}`,
              p: 2,
              height: "100%",
            }}
          >
            <Typography color="textSecondary" gutterBottom variant="body2">
              MONTANT TOTAL
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {getTotalMontant().toFixed(2)} €
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: alpha(theme.palette.error.main, 0.05),
              borderLeft: `4px solid ${theme.palette.error.main}`,
              p: 2,
              height: "100%",
            }}
          >
            <Typography color="textSecondary" gutterBottom variant="body2">
              EN RETARD
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {filteredFactures.filter((f) => f.statut === "en retard").length}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: alpha(theme.palette.warning.main, 0.05),
              borderLeft: `4px solid ${theme.palette.warning.main}`,
              p: 2,
              height: "100%",
            }}
          >
            <Typography color="textSecondary" gutterBottom variant="body2">
              EN ATTENTE
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {filteredFactures.filter((f) => f.statut === "en attente").length}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: "100%", mb: 3, borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: theme.palette.grey[50] }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="onglets factures"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 60,
              "& .MuiTab-root": {
                padding: { xs: "12px 16px", md: "16px 24px" },
                margin: { xs: "0 4px", md: "0 8px" },
                minHeight: 60,
                fontSize: { xs: "0.9rem", md: "1rem" },
                minWidth: "auto",
              },
            }}
          >
            <Tab label="Toutes les factures" />
            <Tab
              label={
                <Badge
                  badgeContent={mockFactures.filter((f) => f.statut === "en retard").length}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      right: -5,
                      top: 5,
                    },
                  }}
                >
                  En retard
                </Badge>
              }
            />
            <Tab label="Payées" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
                mb: 3,
                alignItems: { md: "center" },
              }}
            >
              <TextField
                placeholder="Rechercher une facture..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ minWidth: 280, flex: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <FormControl sx={{ minWidth: 120 }} size="small">
                  <InputLabel>Mois</InputLabel>
                  <Select
                    value={mois}
                    label="Mois"
                    onChange={(e) => {
                      setMois(e.target.value as string);
                      setPage(1);
                    }}
                  >
                    {moisOptions.map(({ value, label }) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 120 }} size="small">
                  <InputLabel>Année</InputLabel>
                  <Select
                    value={annee}
                    label="Année"
                    onChange={(e) => {
                      setAnnee(e.target.value as string);
                      setPage(1);
                    }}
                  >
                    {anneeOptions.map(({ value, label }) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 140 }} size="small">
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={statut}
                    label="Statut"
                    onChange={(e) => {
                      setStatut(e.target.value as string);
                      setPage(1);
                    }}
                  >
                    {statutOptions.map(({ value, label }) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Stack spacing={2}>
              {pagedFactures.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <ReceiptIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                  <Typography variant="body1" color="textSecondary" gutterBottom>
                    Aucune facture trouvée
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Essayez de modifier vos filtres ou termes de recherche
                  </Typography>
                </Box>
              ) : (
                pagedFactures.map(({ id, date, montant, statut, url, categorie }) => (
                  <Card
                    key={id}
                    variant="outlined"
                    sx={{
                      p: 3,
                      position: "relative",
                      boxShadow: 1,
                      borderLeft: `4px solid ${
                        statut === "payée"
                          ? theme.palette.success.main
                          : statut === "en retard"
                          ? theme.palette.error.main
                          : theme.palette.warning.main
                      }`,
                      "&:hover": {
                        boxShadow: 3,
                        transform: "translateY(-2px)",
                        transition: "all 0.2s ease-in-out",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography fontWeight="bold" variant="h6" mb={0.5}>
                          Facture #{id}
                        </Typography>
                        {categorie && (
                          <Chip label={categorie} size="small" variant="outlined" sx={{ mb: 1 }} />
                        )}
                        <Typography fontSize="0.9rem" color="text.secondary" mb={1}>
                          Émise le {new Date(date).toLocaleDateString("fr-FR")}
                        </Typography>
                        <Typography fontWeight="bold" fontSize="1.1rem">
                          {montant.toFixed(2)} € TTC
                        </Typography>
                      </Box>
                      <Box>{getStatusChip(statut)}</Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Visualiser la facture">
                        <Button
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handlePreviewOpen(url)}
                          size="small"
                        >
                          Visualiser
                        </Button>
                      </Tooltip>

                      <Tooltip title="Télécharger la facture">
                        <Button
                          variant="contained"
                          startIcon={<DownloadIcon />}
                          component="a"
                          href={url}
                          download
                          size="small"
                        >
                          Télécharger
                        </Button>
                      </Tooltip>
                    </Stack>
                  </Card>
                ))
              )}
            </Stack>

            {filteredFactures.length > lignesParPage && (
              <Box mt={4} display="flex" justifyContent="center">
                <Pagination
                  count={Math.ceil(filteredFactures.length / lignesParPage)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Alert severity="error" icon={<CalendarMonthIcon />} sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                Vous avez {mockFactures.filter((f) => f.statut === "en retard").length} facture(s) en retard
              </Typography>
              <Typography variant="body2">
                Veuillez régulariser votre situation au plus vite pour éviter toute interruption de service.
              </Typography>
            </Alert>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Alert severity="success" icon={<PaymentIcon />} sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                Vous avez {mockFactures.filter((f) => f.statut === "payée").length} facture(s) payée(s)
              </Typography>
              <Typography variant="body2">
                Merci pour votre régularité. Conservez vos factures pour votre comptabilité.
              </Typography>
            </Alert>
          </Box>
        </TabPanel>
      </Paper>

      <Dialog
        open={previewOpen}
        onClose={handlePreviewClose}
        maxWidth="lg"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            height: "80vh",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 2,
          }}
        >
          <Typography variant="h6">Prévisualisation de la facture</Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {previewUrl ? (
            <iframe
              src={previewUrl}
              title="Prévisualisation facture"
              width="100%"
              height="100%"
              style={{ border: "none", minHeight: "500px" }}
            />
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
              <Typography>Aucune facture sélectionnée</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handlePreviewClose}>Fermer</Button>
          <Button
            component="a"
            href={previewUrl || undefined}
            download
            target="_blank"
            variant="contained"
            startIcon={<DownloadIcon />}
            disabled={!previewUrl}
          >
            Télécharger
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacturesPage;

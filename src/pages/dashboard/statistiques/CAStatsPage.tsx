import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useMediaQuery,
  alpha,
  IconButton,
  Chip,
  Avatar,
  Paper,
  Divider,
  Fade,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  TrendingUp as TrendingUpIcon,
  Euro as EuroIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  PieChart as PieChartIcon,
  DonutLarge as DonutChartIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// -----------------------------------------------------------
// 1. Styled Components
// -----------------------------------------------------------

const Shell = styled(Box)(({ theme }) => ({
  maxWidth: 1440,
  marginInline: "auto",
  padding: theme.spacing(3),
  [theme.breakpoints.up("md")]: { padding: theme.spacing(4) },
  minHeight: "100vh",
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
}));

const ModernCard = styled(Paper)(({ theme }) => ({
  borderRadius: 24,
  boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.08)}`,
  overflow: "hidden",
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 25px 80px ${alpha(theme.palette.common.black, 0.12)}`,
  },
}));

const Header = styled(Box)(({ theme }) => ({
  position: "relative",
  padding: theme.spacing(5, 4, 6),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(
    theme.palette.secondary.main || theme.palette.primary.light,
    0.16
  )} 100%)`,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 20,
  textAlign: 'center',
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 15px 40px ${alpha(theme.palette.common.black, 0.1)}`,
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

// -----------------------------------------------------------
// 2. Données et constantes
// -----------------------------------------------------------

const caData = {
  monthly: [
    { month: "Jan", ca: 120, objectif: 100, prevision: 110 },
    { month: "Fév", ca: 140, objectif: 120, prevision: 130 },
    { month: "Mar", ca: 135, objectif: 130, prevision: 140 },
    { month: "Avr", ca: 160, objectif: 140, prevision: 150 },
    { month: "Mai", ca: 180, objectif: 160, prevision: 170 },
    { month: "Juin", ca: 190, objectif: 170, prevision: 180 },
    { month: "Juil", ca: 210, objectif: 180, prevision: 190 },
    { month: "Août", ca: 195, objectif: 190, prevision: 200 },
    { month: "Sep", ca: 220, objectif: 200, prevision: 210 },
    { month: "Oct", ca: 230, objectif: 210, prevision: 220 },
    { month: "Nov", ca: 250, objectif: 220, prevision: 230 },
    { month: "Déc", ca: 270, objectif: 240, prevision: 250 },
  ],
  yearly: [
    { year: "2021", ca: 1500, objectif: 1400, prevision: 1450 },
    { year: "2022", ca: 1700, objectif: 1600, prevision: 1650 },
    { year: "2023", ca: 1800, objectif: 1750, prevision: 1780 },
  ],
};

const invoicesDetails = [
  { id: 1, client: "Société Alpha", date: "2025-06-10", montant: 1200, statut: "payé", logo: "https://i.pravatar.cc/40?img=1" },
  { id: 2, client: "Entreprise Beta", date: "2025-06-12", montant: 800, statut: "en attente", logo: "https://i.pravatar.cc/40?img=2" },
  { id: 3, client: "Client Gamma", date: "2025-06-15", montant: 1500, statut: "payé", logo: "https://i.pravatar.cc/40?img=3" },
  { id: 4, client: "Client Delta", date: "2025-06-18", montant: 600, statut: "impayé", logo: "https://i.pravatar.cc/40?img=4" },
  { id: 5, client: "Entreprise Epsilon", date: "2025-06-20", montant: 900, statut: "payé", logo: "https://i.pravatar.cc/40?img=5" },
  { id: 6, client: "Société Zeta", date: "2025-06-21", montant: 700, statut: "payé", logo: "https://i.pravatar.cc/40?img=6" },
  { id: 7, client: "Entreprise Eta", date: "2025-06-22", montant: 850, statut: "en attente", logo: "https://i.pravatar.cc/40?img=7" },
  { id: 8, client: "Client Theta", date: "2025-06-23", montant: 400, statut: "impayé", logo: "https://i.pravatar.cc/40?img=8" },
  { id: 9, client: "Client Iota", date: "2025-06-24", montant: 950, statut: "payé", logo: "https://i.pravatar.cc/40?img=9" },
  { id: 10, client: "Entreprise Kappa", date: "2025-06-25", montant: 1100, statut: "en attente", logo: "https://i.pravatar.cc/40?img=10" },
  { id: 11, client: "Société Lambda", date: "2025-06-26", montant: 1000, statut: "payé", logo: "https://i.pravatar.cc/40?img=11" },
];

const statusColors = {
  "payé": "#4caf50",
  "en attente": "#ff9800",
  "impayé": "#f44336",
};

const statusIcons = {
  "payé": <CheckCircleIcon fontSize="small" />,
  "en attente": <ScheduleIcon fontSize="small" />,
  "impayé": <CancelIcon fontSize="small" />,
};

const graphTypes = [
  { value: "line", label: "Courbes", icon: <LineChartIcon /> },
  { value: "bar", label: "Barres", icon: <BarChartIcon /> },
  { value: "area", label: "Aires", icon: <TrendingUpIcon /> },
  { value: "pie", label: "Circulaire", icon: <PieChartIcon /> },
];

// Composant Tooltip personnalisé pour recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  const theme = useTheme();
  
  if (active && payload && payload.length) {
    return (
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          borderRadius: 3,
        }}
      >
        <Typography variant="body2" fontWeight={600} color="text.primary" gutterBottom>
          {label}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Typography 
            key={index} 
            variant="body2" 
            sx={{ color: entry.color }}
          >
            {entry.name}: {entry.value} k€
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

// -----------------------------------------------------------
// 3. Composant principal ChiffreAffairesStatsPage
// -----------------------------------------------------------

export default function ChiffreAffairesStatsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [filterStatut, setFilterStatut] = useState("Tous");
  const [graphType, setGraphType] = useState("line");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredInvoices = useMemo(() => {
    if (filterStatut === "Tous") return invoicesDetails;
    return invoicesDetails.filter((inv) => inv.statut === filterStatut);
  }, [filterStatut]);

  const paginatedInvoices = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredInvoices.slice(start, start + rowsPerPage);
  }, [filteredInvoices, page, rowsPerPage]);

  const totalCA = useMemo(() => {
    return caData[period].reduce((acc, val) => acc + val.ca, 0);
  }, [period]);

  const stats = useMemo(() => ({
    payeCount: invoicesDetails.filter((inv) => inv.statut === "payé").length,
    attenteCount: invoicesDetails.filter((inv) => inv.statut === "en attente").length,
    impayeCount: invoicesDetails.filter((inv) => inv.statut === "impayé").length,
    totalInvoices: invoicesDetails.length,
    caMoyen: totalCA / invoicesDetails.length,
  }), [totalCA]);

  const exportCSV = () => {
    setLoading(true);
    setTimeout(() => {
      const headers = ["Client", "Date", "Montant (€)", "Statut"];
      const rows = filteredInvoices.map(inv => [
        inv.client,
        inv.date,
        inv.montant.toString(),
        inv.statut,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers, ...rows].map(e => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "factures.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setLoading(false);
    }, 1000);
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderChart = () => {
    const data = caData[period];
    const xKey = period === "monthly" ? "month" : "year";

    switch (graphType) {
      case "line":
        return (
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
            <XAxis dataKey={xKey} stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <CustomTooltip />
            <Line
              type="monotone"
              dataKey="ca"
              stroke={theme.palette.primary.main}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="CA Réel"
            />
            <Line
              type="monotone"
              dataKey="objectif"
              stroke={theme.palette.secondary.main}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3 }}
              name="Objectif"
            />
          </LineChart>
        );

      case "bar":
        return (
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
            <XAxis dataKey={xKey} stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <CustomTooltip />
            <Bar dataKey="ca" fill={theme.palette.primary.main} name="CA Réel" radius={[4, 4, 0, 0]} />
            <Bar dataKey="objectif" fill={theme.palette.secondary.main} name="Objectif" radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case "area":
        return (
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
            <XAxis dataKey={xKey} stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <CustomTooltip />
            <Area
              type="monotone"
              dataKey="ca"
              stroke={theme.palette.primary.main}
              fill={alpha(theme.palette.primary.main, 0.3)}
              name="CA Réel"
            />
          </AreaChart>
        );

      case "pie":
        const pieData = [
          { name: "Payé", value: stats.payeCount, color: statusColors["payé"] },
          { name: "En attente", value: stats.attenteCount, color: statusColors["en attente"] },
          { name: "Impayé", value: stats.impayeCount, color: statusColors["impayé"] },
        ];
        
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <CustomTooltip />
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <Shell>
      <Fade in timeout={800}>
        <Box>
          {/* Header */}
          <ModernCard sx={{ mb: 4 }}>
            <Header>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography 
                    variant="h3" 
                    fontWeight={800}
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      backgroundClip: 'text',
                      textFillColor: 'transparent',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1
                    }}
                  >
                    💰 Chiffre d'Affaires
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    Analyse détaillée de votre performance financière
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate("/dashboard/statistiques")}
                  sx={{ borderRadius: 3 }}
                >
                  Retour au tableau
                </Button>
              </Box>
            </Header>

            <Box sx={{ p: 4 }}>
              {/* Contrôles */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>
                      Période
                    </Typography>
                    <Select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value as "monthly" | "yearly")}
                      sx={{ borderRadius: 3 }}
                    >
                      <MenuItem value="monthly">📅 Mensuelle</MenuItem>
                      <MenuItem value="yearly">📆 Annuelle</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>
                      Statut factures
                    </Typography>
                    <Select
                      value={filterStatut}
                      onChange={(e) => setFilterStatut(e.target.value)}
                      sx={{ borderRadius: 3 }}
                    >
                      <MenuItem value="Tous">📋 Tous les statuts</MenuItem>
                      <MenuItem value="payé">✅ Payé</MenuItem>
                      <MenuItem value="en attente">⏳ En attente</MenuItem>
                      <MenuItem value="impayé">❌ Impayé</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>
                      Type de graphique
                    </Typography>
                    <Select
                      value={graphType}
                      onChange={(e) => setGraphType(e.target.value)}
                      sx={{ borderRadius: 3 }}
                    >
                      {graphTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Statistiques */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard>
                    <EuroIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight={800} color="primary.main">
                      {totalCA.toLocaleString()} k€
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Chiffre d'affaires total
                    </Typography>
                  </StatCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatCard>
                    <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight={800} color="success.main">
                      {stats.payeCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Factures payées
                    </Typography>
                  </StatCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatCard>
                    <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight={800} color="warning.main">
                      {stats.attenteCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      En attente
                    </Typography>
                  </StatCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatCard>
                    <CancelIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight={800} color="error.main">
                      {stats.impayeCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Factures impayées
                    </Typography>
                  </StatCard>
                </Grid>
              </Grid>

              {/* Graphique */}
              <ModernCard sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  📈 Évolution du chiffre d'affaires (k€)
                </Typography>
                <Box sx={{ height: 300, width: "100%", mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                  </ResponsiveContainer>
                </Box>
              </ModernCard>

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
                  onClick={exportCSV}
                  disabled={loading}
                  sx={{ borderRadius: 3 }}
                >
                  Exporter les données
                </Button>
              </Box>

              {/* Tableau des factures */}
              <ModernCard>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    🧾 Dernières factures émises
                  </Typography>
                  
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Client</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Montant</TableCell>
                        <TableCell>Statut</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedInvoices.map((inv) => (
                        <TableRow key={inv.id} hover>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Avatar src={inv.logo} sx={{ width: 32, height: 32 }} />
                              <Typography variant="body2" fontWeight={500}>
                                {inv.client}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(inv.date).toLocaleDateString('fr-FR')}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600}>
                              {inv.montant.toLocaleString()} €
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={statusIcons[inv.statut]}
                              label={inv.statut}
                              size="small"
                              sx={{
                                backgroundColor: alpha(statusColors[inv.statut], 0.1),
                                color: statusColors[inv.statut],
                                fontWeight: "600",
                                border: `1px solid ${alpha(statusColors[inv.statut], 0.2)}`,
                                textTransform: "capitalize",
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredInvoices.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Factures par page"
                    sx={{ mt: 2 }}
                  />
                </Box>
              </ModernCard>
            </Box>
          </ModernCard>
        </Box>
      </Fade>
    </Shell>
  );
}
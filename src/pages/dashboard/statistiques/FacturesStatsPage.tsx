import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Grid,
  useTheme,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  useMediaQuery,
  alpha,
  IconButton,
  Chip,
  Paper,
  Fade,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  Tooltip,
} from "recharts";
import {
  TrendingUp as TrendingUpIcon,
  Paid as PaidIcon,
  MoneyOff as MoneyOffIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  PieChart as PieChartIcon,
  Analytics as AnalyticsIcon,
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

// Données exemples pour évolution mensuelle
const monthlyData = [
  { month: "Jan", total: 120, payees: 100, impayees: 20 },
  { month: "Fév", total: 130, payees: 110, impayees: 20 },
  { month: "Mar", total: 125, payees: 115, impayees: 10 },
  { month: "Avr", total: 140, payees: 130, impayees: 10 },
  { month: "Mai", total: 150, payees: 140, impayees: 10 },
  { month: "Juin", total: 160, payees: 150, impayees: 10 },
  { month: "Juil", total: 170, payees: 160, impayees: 10 },
  { month: "Août", total: 180, payees: 170, impayees: 10 },
  { month: "Sep", total: 190, payees: 180, impayees: 10 },
  { month: "Oct", total: 200, payees: 190, impayees: 10 },
  { month: "Nov", total: 210, payees: 200, impayees: 10 },
  { month: "Déc", total: 220, payees: 210, impayees: 10 },
];

// Données exemples pour évolution annuelle
const yearlyData = [
  { year: "2019", total: 1400, payees: 1300, impayees: 100 },
  { year: "2020", total: 1500, payees: 1400, impayees: 100 },
  { year: "2021", total: 1600, payees: 1500, impayees: 100 },
  { year: "2022", total: 1700, payees: 1600, impayees: 100 },
  { year: "2023", total: 1800, payees: 1700, impayees: 100 },
];

// Répartition des factures
const statusDistribution = [
  { name: "Factures payées", value: 7400, color: "#11b886" },
  { name: "Factures impayées", value: 500, color: "#EF4770" },
];

const typeDistribution = [
  { name: "Factures clients", value: 5200, color: "#6950E8" },
  { name: "Factures fournisseurs", value: 2400, color: "#4ECDC4" },
  { name: "Factures récurrentes", value: 300, color: "#FF6B6B" },
];

const graphTypes = [
  { value: "bar", label: "Barres", icon: <BarChartIcon /> },
  { value: "line", label: "Courbes", icon: <LineChartIcon /> },
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
            {entry.name}: {entry.value} factures
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

// -----------------------------------------------------------
// 3. Composant principal FacturesStatsPage
// -----------------------------------------------------------

export default function FacturesStatsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [viewMode, setViewMode] = useState<"month" | "year">("month");
  const [graphType, setGraphType] = useState("bar");
  const [dataType, setDataType] = useState("status");
  const [loading, setLoading] = useState(false);

  const data = viewMode === "month" ? monthlyData : yearlyData;
  const xKey = viewMode === "month" ? "month" : "year";
  const distributionData = dataType === "status" ? statusDistribution : typeDistribution;

  const totalFactures = distributionData.reduce((sum, item) => sum + item.value, 0);
  const facturesPayees = statusDistribution.find((s) => s.name === "Factures payées")?.value || 0;
  const facturesImpayees = statusDistribution.find((s) => s.name === "Factures impayées")?.value || 0;

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const exportData = () => {
    setLoading(true);
    setTimeout(() => {
      const headers = ["Période", "Total", "Payées", "Impayées"];
      const rows = data.map(item => [
        item[xKey],
        item.total,
        item.payees,
        item.impayees,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers, ...rows].map(e => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `statistiques-factures-${viewMode}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setLoading(false);
    }, 1000);
  };

  const renderChart = () => {
    switch (graphType) {
      case "bar":
        return (
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
            <XAxis dataKey={xKey} stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="total" fill={theme.palette.primary.main} name="Total factures" radius={[4, 4, 0, 0]} />
            <Bar dataKey="payees" fill="#11b886" name="Factures payées" radius={[4, 4, 0, 0]} />
            <Bar dataKey="impayees" fill="#EF4770" name="Factures impayées" radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case "line":
        return (
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
            <XAxis dataKey={xKey} stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="total" stroke={theme.palette.primary.main} strokeWidth={3} name="Total factures" />
            <Line type="monotone" dataKey="payees" stroke="#11b886" strokeWidth={2} name="Factures payées" />
            <Line type="monotone" dataKey="impayees" stroke="#EF4770" strokeWidth={2} name="Factures impayées" />
          </LineChart>
        );

      case "area":
        return (
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
            <XAxis dataKey={xKey} stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="total" stroke={theme.palette.primary.main} fill={alpha(theme.palette.primary.main, 0.3)} name="Total factures" />
            <Area type="monotone" dataKey="payees" stroke="#11b886" fill={alpha("#11b886", 0.3)} name="Factures payées" />
          </AreaChart>
        );

      case "pie":
        return (
          <PieChart>
            <Pie
              data={distributionData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {distributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
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
          <ModernCard>
            <Header>
              <Typography 
                variant="h3" 
                fontWeight={800}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main || theme.palette.primary.light} 100%)`,
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                  textAlign: 'center'
                }}
              >
                📊 Tableau de Bord des Factures
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center' }}>
                Analyse et suivi de votre activité financière
              </Typography>
            </Header>

            <Box sx={{ p: 4 }}>
              {/* Contrôles */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>
                      Période
                    </Typography>
                    <ToggleButtonGroup
                      value={viewMode}
                      exclusive
                      onChange={(_, value) => value && setViewMode(value)}
                      sx={{
                        '& .MuiToggleButton-root': {
                          borderRadius: 3,
                          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                          '&.Mui-selected': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            borderColor: theme.palette.primary.main,
                          }
                        }
                      }}
                    >
                      <ToggleButton value="month">
                        📅 Mensuel
                      </ToggleButton>
                      <ToggleButton value="year">
                        📆 Annuel
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>
                      Type de graphique
                    </Typography>
                    <ToggleButtonGroup
                      value={graphType}
                      exclusive
                      onChange={(_, value) => value && setGraphType(value)}
                      sx={{
                        '& .MuiToggleButton-root': {
                          borderRadius: 3,
                          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                          '&.Mui-selected': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            borderColor: theme.palette.primary.main,
                          }
                        }
                      }}
                    >
                      {graphTypes.map((type) => (
                        <ToggleButton key={type.value} value={type.value}>
                          {type.icon}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>
                      Type de données
                    </Typography>
                    <Select
                      value={dataType}
                      onChange={(e) => setDataType(e.target.value)}
                      sx={{ borderRadius: 3 }}
                    >
                      <MenuItem value="status">📊 Par statut</MenuItem>
                      <MenuItem value="type">📁 Par type</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Statistiques */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard>
                    <PaidIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight={800} color="primary.main">
                      {totalFactures}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total factures
                    </Typography>
                  </StatCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatCard>
                    <PaidIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight={800} color="success.main">
                      {facturesPayees}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Factures payées
                    </Typography>
                  </StatCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatCard>
                    <MoneyOffIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight={800} color="error.main">
                      {facturesImpayees}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Factures impayées
                    </Typography>
                  </StatCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatCard>
                    <AnalyticsIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight={800} color="warning.main">
                      {((facturesPayees / totalFactures) * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Taux de paiement
                    </Typography>
                  </StatCard>
                </Grid>
              </Grid>

              {/* Actions */}
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
                <Chip
                  icon={<RefreshIcon />}
                  label="Actualiser"
                  onClick={refreshData}
                  variant="outlined"
                  clickable
                  disabled={loading}
                  sx={{ borderRadius: 3 }}
                />
                <Chip
                  icon={<DownloadIcon />}
                  label="Exporter"
                  onClick={exportData}
                  variant="outlined"
                  clickable
                  disabled={loading}
                  sx={{ borderRadius: 3 }}
                />
                <Chip
                  icon={<FilterListIcon />}
                  label="Filtres"
                  variant="outlined"
                  clickable
                  sx={{ borderRadius: 3 }}
                />
              </Stack>

              {/* Graphiques */}
              <Grid container spacing={4}>
                {/* Graphique principal */}
                <Grid item xs={12} lg={8}>
                  <ModernCard sx={{ p: 3, height: 400 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      📈 Évolution {viewMode === "month" ? "mensuelle" : "annuelle"} des factures
                    </Typography>
                    <ResponsiveContainer width="100%" height="90%">
                      {renderChart()}
                    </ResponsiveContainer>
                  </ModernCard>
                </Grid>

                {/* Répartition */}
                <Grid item xs={12} lg={4}>
                  <ModernCard sx={{ p: 3, height: 400 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      🎯 Répartition {dataType === "status" ? "par statut" : "par type"}
                    </Typography>
                    <ResponsiveContainer width="100%" height="90%">
                      <PieChart>
                        <Pie
                          data={distributionData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={40}
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ModernCard>
                </Grid>
              </Grid>

              {/* Légende des couleurs */}
              <Grid container spacing={2} sx={{ mt: 4 }}>
                <Grid item xs={12}>
                  <Typography variant="body2" fontWeight={600} color="text.secondary" gutterBottom>
                    Légende des couleurs:
                  </Typography>
                </Grid>
                {[
                  { color: theme.palette.primary.main, label: "Total factures" },
                  { color: "#11b886", label: "Factures payées" },
                  { color: "#EF4770", label: "Factures impayées" },
                  { color: "#6950E8", label: "Factures clients" },
                  { color: "#4ECDC4", label: "Factures fournisseurs" },
                  { color: "#FF6B6B", label: "Factures récurrentes" },
                ].map((item, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: 2,
                          backgroundColor: item.color,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {item.label}
                      </Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </ModernCard>
        </Box>
      </Fade>
    </Shell>
  );
}
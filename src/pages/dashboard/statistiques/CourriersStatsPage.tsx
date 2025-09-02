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
} from "recharts";
import {
  TrendingUp as TrendingUpIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  PieChart as PieChartIcon,
  DonutLarge as DonutChartIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
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

const monthlyData = [
  { month: "Jan", total: 80, traites: 70, attente: 10, urgents: 5 },
  { month: "Fév", total: 90, traites: 75, attente: 15, urgents: 8 },
  { month: "Mar", total: 85, traites: 80, attente: 5, urgents: 3 },
  { month: "Avr", total: 100, traites: 90, attente: 10, urgents: 6 },
  { month: "Mai", total: 110, traites: 100, attente: 10, urgents: 7 },
  { month: "Juin", total: 115, traites: 105, attente: 10, urgents: 8 },
  { month: "Juil", total: 120, traites: 110, attente: 10, urgents: 9 },
  { month: "Août", total: 125, traites: 115, attente: 10, urgents: 10 },
  { month: "Sep", total: 130, traites: 120, attente: 10, urgents: 11 },
  { month: "Oct", total: 135, traites: 125, attente: 10, urgents: 12 },
  { month: "Nov", total: 140, traites: 130, attente: 10, urgents: 13 },
  { month: "Déc", total: 145, traites: 135, attente: 10, urgents: 14 },
];

const yearlyData = [
  { year: "2019", total: 950, traites: 900, attente: 50, urgents: 30 },
  { year: "2020", total: 1000, traites: 950, attente: 50, urgents: 35 },
  { year: "2021", total: 1100, traites: 1050, attente: 50, urgents: 40 },
  { year: "2022", total: 1200, traites: 1150, attente: 50, urgents: 45 },
  { year: "2023", total: 1300, traites: 1250, attente: 50, urgents: 50 },
];

const statusDistribution = [
  { name: "Traités", value: 5250, color: "#11b886" },
  { name: "En attente", value: 1350, color: "#ff9800" },
  { name: "Urgents", value: 350, color: "#f44336" },
];

const typeDistribution = [
  { name: "Courriers entrants", value: 3200, color: "#6950E8" },
  { name: "Courriers sortants", value: 2400, color: "#4ECDC4" },
  { name: "Documents internes", value: 1000, color: "#FF6B6B" },
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
            {entry.name}: {entry.value} courriers
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

// -----------------------------------------------------------
// 3. Composant principal CourriersStatsPage
// -----------------------------------------------------------

export default function CourriersStatsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [viewMode, setViewMode] = useState<"month" | "year">("month");
  const [graphType, setGraphType] = useState("bar");
  const [dataType, setDataType] = useState("status");
  const [loading, setLoading] = useState(false);

  const data = viewMode === "month" ? monthlyData : yearlyData;
  const xKey = viewMode === "month" ? "month" : "year";
  const distributionData = dataType === "status" ? statusDistribution : typeDistribution;

  const totalCourriers = distributionData.reduce((sum, item) => sum + item.value, 0);
  const courriersTraites = statusDistribution.find((s) => s.name === "Traités")?.value || 0;
  const courriersEnAttente = statusDistribution.find((s) => s.name === "En attente")?.value || 0;
  const courriersUrgents = statusDistribution.find((s) => s.name === "Urgents")?.value || 0;

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const exportData = () => {
    setLoading(true);
    setTimeout(() => {
      const headers = ["Période", "Total", "Traités", "En attente", "Urgents"];
      const rows = data.map(item => [
        item[xKey],
        item.total,
        item.traites,
        item.attente,
        item.urgents || 0,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers, ...rows].map(e => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `statistiques-courriers-${viewMode}.csv`);
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
            <CustomTooltip />
            <Legend />
            <Bar dataKey="total" fill={theme.palette.primary.main} name="Total courriers" radius={[4, 4, 0, 0]} />
            <Bar dataKey="traites" fill="#11b886" name="Traités" radius={[4, 4, 0, 0]} />
            <Bar dataKey="attente" fill="#ff9800" name="En attente" radius={[4, 4, 0, 0]} />
            <Bar dataKey="urgents" fill="#f44336" name="Urgents" radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case "line":
        return (
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
            <XAxis dataKey={xKey} stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <CustomTooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke={theme.palette.primary.main} strokeWidth={3} name="Total courriers" />
            <Line type="monotone" dataKey="traites" stroke="#11b886" strokeWidth={2} name="Traités" />
            <Line type="monotone" dataKey="attente" stroke="#ff9800" strokeWidth={2} name="En attente" />
          </LineChart>
        );

      case "area":
        return (
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
            <XAxis dataKey={xKey} stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <CustomTooltip />
            <Legend />
            <Area type="monotone" dataKey="total" stroke={theme.palette.primary.main} fill={alpha(theme.palette.primary.main, 0.3)} name="Total courriers" />
            <Area type="monotone" dataKey="traites" stroke="#11b886" fill={alpha("#11b886", 0.3)} name="Traités" />
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
            <CustomTooltip />
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
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                  textAlign: 'center'
                }}
              >
                📨 Statistiques des Courriers
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center' }}>
                Analyse et suivi de votre flux de courriers
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
                    <EmailIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight={800} color="primary.main">
                      {totalCourriers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total courriers
                    </Typography>
                  </StatCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatCard>
                    <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight={800} color="success.main">
                      {courriersTraites}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Traités
                    </Typography>
                  </StatCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatCard>
                    <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight={800} color="warning.main">
                      {courriersEnAttente}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      En attente
                    </Typography>
                  </StatCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatCard>
                    <EmailIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight={800} color="error.main">
                      {courriersUrgents}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Courriers urgents
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
                      📈 Évolution {viewMode === "month" ? "mensuelle" : "annuelle"} des courriers
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
                        <CustomTooltip />
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
                  { color: theme.palette.primary.main, label: "Total courriers" },
                  { color: "#11b886", label: "Traités" },
                  { color: "#ff9800", label: "En attente" },
                  { color: "#f44336", label: "Urgents" },
                  { color: "#6950E8", label: "Courriers entrants" },
                  { color: "#4ECDC4", label: "Courriers sortants" },
                  { color: "#FF6B6B", label: "Documents internes" },
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
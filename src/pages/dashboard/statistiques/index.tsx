import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Grid,
  useTheme,
  Stack,
  FormControl,
  Select,
  MenuItem,
  useMediaQuery,
  alpha,
  Paper,
  IconButton,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  PieChart as PieChartIcon,
  DonutLarge as DonutChartIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
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
  textAlign: 'center',
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  borderRadius: 12,
  padding: theme.spacing(1),
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    transform: 'translateY(-1px)',
  },
}));

// -----------------------------------------------------------
// 2. Données et constantes
// -----------------------------------------------------------

const COULEURS = {
  clients: ["#6950E8", "#11b886", "#FEBF06", "#FF6B6B", "#4ECDC4", "#45B7D1"],
  factures: ["#11b886", "#EF4770", "#6950E8", "#FFA726", "#26C6DA", "#AB47BC"],
};

const statsData = {
  clients: {
    monthly: [
      { mois: "Jan", total: 100, actifs: 80, attente: 20, nouveaux: 15, inactifs: 5 },
      { mois: "Fév", total: 120, actifs: 100, attente: 20, nouveaux: 18, inactifs: 8 },
      { mois: "Mar", total: 150, actifs: 130, attente: 20, nouveaux: 22, inactifs: 10 },
      { mois: "Avr", total: 130, actifs: 110, attente: 20, nouveaux: 20, inactifs: 12 },
      { mois: "Mai", total: 170, actifs: 150, attente: 20, nouveaux: 25, inactifs: 15 },
      { mois: "Juin", total: 160, actifs: 140, attente: 20, nouveaux: 23, inactifs: 18 },
      { mois: "Juil", total: 180, actifs: 160, attente: 20, nouveaux: 28, inactifs: 20 },
      { mois: "Août", total: 190, actifs: 170, attente: 20, nouveaux: 30, inactifs: 22 },
      { mois: "Sep", total: 210, actifs: 190, attente: 20, nouveaux: 32, inactifs: 25 },
      { mois: "Oct", total: 220, actifs: 200, attente: 20, nouveaux: 35, inactifs: 28 },
      { mois: "Nov", total: 230, actifs: 210, attente: 20, nouveaux: 38, inactifs: 30 },
      { mois: "Déc", total: 250, actifs: 230, attente: 20, nouveaux: 40, inactifs: 32 },
    ],
    yearly: [
      { annee: "2021", total: 1200, actifs: 1000, attente: 200, nouveaux: 180, inactifs: 150 },
      { annee: "2022", total: 1400, actifs: 1200, attente: 200, nouveaux: 220, inactifs: 180 },
      { annee: "2023", total: 1600, actifs: 1400, attente: 200, nouveaux: 250, inactifs: 200 },
    ],
  },
  factures: {
    monthly: [
      { mois: "Jan", payees: 90, impayees: 10, total: 100, encours: 15, annulees: 5 },
      { mois: "Fév", payees: 110, impayees: 10, total: 120, encours: 18, annulees: 8 },
      { mois: "Mar", payees: 140, impayees: 10, total: 150, encours: 22, annulees: 10 },
      { mois: "Avr", payees: 120, impayees: 10, total: 130, encours: 20, annulees: 12 },
      { mois: "Mai", payees: 160, impayees: 10, total: 170, encours: 25, annulees: 15 },
      { mois: "Juin", payees: 150, impayees: 10, total: 160, encours: 23, annulees: 18 },
      { mois: "Juil", payees: 170, impayees: 10, total: 180, encours: 28, annulees: 20 },
      { mois: "Août", payees: 180, impayees: 10, total: 190, encours: 30, annulees: 22 },
      { mois: "Sep", payees: 200, impayees: 10, total: 210, encours: 32, annulees: 25 },
      { mois: "Oct", payees: 210, impayees: 10, total: 220, encours: 35, annulees: 28 },
      { mois: "Nov", payees: 220, impayees: 10, total: 230, encours: 38, annulees: 30 },
      { mois: "Déc", payees: 240, impayees: 10, total: 250, encours: 40, annulees: 32 },
    ],
    yearly: [
      { annee: "2021", payees: 1200, impayees: 100, total: 1300, encours: 180, annulees: 150 },
      { annee: "2022", payees: 1400, impayees: 120, total: 1520, encours: 220, annulees: 180 },
      { annee: "2023", payees: 1600, impayees: 140, total: 1740, encours: 250, annulees: 200 },
    ],
  },
};

const nomsBarresFR = {
  total: "Total",
  actifs: "Actifs",
  attente: "En attente",
  payees: "Payées",
  impayees: "Impayées",
  nouveaux: "Nouveaux",
  inactifs: "Inactifs",
  encours: "En cours",
  annulees: "Annulées",
};

const barresKeys = {
  clients: ["actifs", "attente", "nouveaux", "inactifs"],
  factures: ["payees", "impayees", "encours", "annulees"],
};

const graphTypes = [
  { value: "bar", label: "Barres", icon: <BarChartIcon /> },
  { value: "line", label: "Courbes", icon: <LineChartIcon /> },
  { value: "area", label: "Aires", icon: <TrendingUpIcon /> },
  { value: "pie", label: "Circulaire", icon: <PieChartIcon /> },
];

// -----------------------------------------------------------
// 3. Composant principal StatisticsPage
// -----------------------------------------------------------

const StatisticsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [categorie, setCategorie] = useState("clients");
  const [vue, setVue] = useState("monthly");
  const [graphType, setGraphType] = useState("bar");

  const donnees = statsData[categorie][vue];
  const cleX = vue === "monthly" ? "mois" : "annee";

  const numberFormat = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const renderChart = () => {
    switch (graphType) {
      case "bar":
        return (
          <BarChart data={donnees}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
            <XAxis
              dataKey={cleX}
              stroke={theme.palette.text.secondary}
              tick={{ fontSize: 12, fontWeight: 600 }}
            />
            <YAxis
              stroke={theme.palette.text.secondary}
              tick={{ fontSize: 12, fontWeight: 600 }}
            />
            <Tooltip
              cursor={{ fill: alpha(theme.palette.primary.main, 0.1) }}
              formatter={(val) => numberFormat(Number(val))}
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: 12,
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                boxShadow: theme.shadows[3],
                color: theme.palette.text.primary,
                fontSize: '14px',
              }}
            />
            <Legend
              verticalAlign="top"
              wrapperStyle={{ 
                color: theme.palette.text.secondary, 
                fontWeight: 500,
                fontSize: '14px',
                paddingBottom: '20px'
              }}
            />
            {barresKeys[categorie].map((key, idx) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={COULEURS[categorie][idx]}
                name={nomsBarresFR[key]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );
      
      case "line":
        return (
          <LineChart data={donnees}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
            <XAxis
              dataKey={cleX}
              stroke={theme.palette.text.secondary}
              tick={{ fontSize: 12, fontWeight: 600 }}
            />
            <YAxis
              stroke={theme.palette.text.secondary}
              tick={{ fontSize: 12, fontWeight: 600 }}
            />
            <Tooltip
              cursor={{ stroke: theme.palette.divider, strokeWidth: 1 }}
              formatter={(val) => numberFormat(Number(val))}
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: 12,
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                boxShadow: theme.shadows[3],
                color: theme.palette.text.primary,
                fontSize: '14px',
              }}
            />
            <Legend
              verticalAlign="top"
              wrapperStyle={{ 
                color: theme.palette.text.secondary, 
                fontWeight: 500,
                fontSize: '14px',
                paddingBottom: '20px'
              }}
            />
            {barresKeys[categorie].map((key, idx) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COULEURS[categorie][idx]}
                strokeWidth={3}
                dot={{ r: 4, fill: COULEURS[categorie][idx] }}
                activeDot={{ r: 6, fill: COULEURS[categorie][idx] }}
                name={nomsBarresFR[key]}
              />
            ))}
          </LineChart>
        );
      
      case "area":
        return (
          <AreaChart data={donnees}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
            <XAxis
              dataKey={cleX}
              stroke={theme.palette.text.secondary}
              tick={{ fontSize: 12, fontWeight: 600 }}
            />
            <YAxis
              stroke={theme.palette.text.secondary}
              tick={{ fontSize: 12, fontWeight: 600 }}
            />
            <Tooltip
              formatter={(val) => numberFormat(Number(val))}
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: 12,
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                boxShadow: theme.shadows[3],
                color: theme.palette.text.primary,
                fontSize: '14px',
              }}
            />
            <Legend
              verticalAlign="top"
              wrapperStyle={{ 
                color: theme.palette.text.secondary, 
                fontWeight: 500,
                fontSize: '14px',
                paddingBottom: '20px'
              }}
            />
            {barresKeys[categorie].map((key, idx) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={COULEURS[categorie][idx]}
                fill={alpha(COULEURS[categorie][idx], 0.3)}
                name={nomsBarresFR[key]}
              />
            ))}
          </AreaChart>
        );
      
      case "pie":
        const pieData = barresKeys[categorie].map((key, idx) => ({
          name: nomsBarresFR[key],
          value: donnees.reduce((sum, item) => sum + (item[key] || 0), 0),
          color: COULEURS[categorie][idx]
        }));
        
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={60}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val) => numberFormat(Number(val))}
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: 12,
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                boxShadow: theme.shadows[3],
                color: theme.palette.text.primary,
                fontSize: '14px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ 
                color: theme.palette.text.secondary, 
                fontWeight: 500,
                fontSize: '14px',
                paddingTop: '20px'
              }}
            />
          </PieChart>
        );
      
      default:
        return null;
    }
  };

  return (
    <Shell>
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
              mb: 1
            }}
          >
            📊 Tableau de Bord Analytics
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Analysez les performances et tendances de votre activité en temps réel
          </Typography>
        </Header>

        <Box sx={{ p: 4 }}>
          {/* Contrôles */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>
                  Catégorie
                </Typography>
                <Select
                  value={categorie}
                  onChange={(e) => {
                    setCategorie(e.target.value);
                    setVue("monthly");
                  }}
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="clients">👥 Clients</MenuItem>
                  <MenuItem value="factures">🧾 Factures</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>
                  Période
                </Typography>
                <Select
                  value={vue}
                  onChange={(e) => setVue(e.target.value)}
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="monthly">📅 Mensuel</MenuItem>
                  <MenuItem value="yearly">📆 Annuel</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                  Type de graphique
                </Typography>
                <ToggleButtonGroup
                  value={graphType}
                  exclusive
                  onChange={(e, newType) => newType && setGraphType(newType)}
                  aria-label="type de graphique"
                  sx={{
                    '& .MuiToggleButton-root': {
                      borderRadius: 2,
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
                    <ToggleButton key={type.value} value={type.value} aria-label={type.label}>
                      {type.icon}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>
            </Grid>
          </Grid>

          {/* Actions */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Chip
              icon={<FilterListIcon />}
              label="Filtres avancés"
              variant="outlined"
              clickable
              sx={{ borderRadius: 2 }}
            />
            <ActionButton title="Actualiser les données">
              <RefreshIcon />
            </ActionButton>
            <ActionButton title="Exporter le rapport">
              <DownloadIcon />
            </ActionButton>
          </Stack>

          {/* Graphique */}
          <Box sx={{ height: 500, width: "100%", mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </Box>

          {/* Légende des couleurs */}
          <Grid container spacing={2} sx={{ mt: 3 }}>
            {barresKeys[categorie].map((key, idx) => (
              <Grid item xs={6} sm={3} key={key}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: 2,
                      backgroundColor: COULEURS[categorie][idx],
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {nomsBarresFR[key]}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>
      </ModernCard>
    </Shell>
  );
};

export default StatisticsPage;
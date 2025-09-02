import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Tooltip,
  IconButton,
  Button,
  TextField,
  Alert,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  alpha,
  InputAdornment,
  Menu,
  MenuItem,
  CircularProgress,
  useTheme,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Badge,
  Avatar,
  AvatarGroup,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Divider,
  styled
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Archive as ArchiveIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Refresh as RefreshIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Print as PrintIcon,
  Email as EmailIcon,
} from "@mui/icons-material";

// ===================== Styled Components =====================
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  height: 68, // Augmentation de la hauteur des lignes
  '&:nth-of-type(odd)': {
    backgroundColor: alpha(theme.palette.primary.main, 0.02), // Ligne impaire avec fond très léger
  },
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.common.white, // Ligne paire sans fond
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04), // Effet au survol
  },
}));

// Style pour les cellules du tableau
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(2), // Plus d'espace dans les cellules
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`, // Ligne de séparation plus subtile
}));

// Style pour l'en-tête du tableau
const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(2),
  fontWeight: "bold",
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  fontSize: '0.875rem',
  color: theme.palette.primary.main,
}));

interface Courrier {
  id: string;
  dateReception: string;
  expediteur: string;
  nomDocument: string;
  urlDocument: string;
  statut: "non-lu" | "lu" | "archivé";
  priorite: "normal" | "élevée" | "urgent";
  taille: string;
  categorie: string;
  logo?: string;
}

type Order = "asc" | "desc";

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
      id={`courriers-tabpanel-${index}`}
      aria-labelledby={`courriers-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const exampleCourriers: Courrier[] = [
  { 
    id: "1", 
    dateReception: "2025-07-10", 
    expediteur: "Banque Nationale", 
    nomDocument: "Relevé bancaire - Juin 2025", 
    urlDocument: "/docs/releve.pdf",
    statut: "non-lu",
    priorite: "normal",
    taille: "2.4 MB",
    categorie: "Banque",
    logo: "/logos/bank.png"
  },
  { 
    id: "2", 
    dateReception: "2025-07-09", 
    expediteur: "Assurance Santé Plus", 
    nomDocument: "Contrat assurance maladie", 
    urlDocument: "/docs/assurance.pdf",
    statut: "lu",
    priorite: "élevée",
    taille: "5.1 MB",
    categorie: "Assurance",
    logo: "/logos/insurance.png"
  },
  { 
    id: "3", 
    dateReception: "2025-07-08", 
    expediteur: "Service des Impôts", 
    nomDocument: "Avis d'imposition 2025", 
    urlDocument: "/docs/impots.pdf",
    statut: "non-lu",
    priorite: "urgent",
    taille: "3.7 MB",
    categorie: "Administration"
  },
  { 
    id: "4", 
    dateReception: "2025-07-05", 
    expediteur: "Fournisseur Énergie", 
    nomDocument: "Facture juillet 2025", 
    urlDocument: "/docs/facture.pdf",
    statut: "archivé",
    priorite: "normal",
    taille: "1.2 MB",
    categorie: "Services"
  },
  { 
    id: "5", 
    dateReception: "2025-07-04", 
    expediteur: "Opérateur Télécom", 
    nomDocument: "Facture téléphonique", 
    urlDocument: "/docs/telecom.pdf",
    statut: "lu",
    priorite: "normal",
    taille: "0.9 MB",
    categorie: "Services"
  },
  { 
    id: "6", 
    dateReception: "2025-07-03", 
    expediteur: "Mutuelle Santé", 
    nomDocument: "Remboursement juin 2025", 
    urlDocument: "/docs/mutuelle.pdf",
    statut: "non-lu",
    priorite: "élevée",
    taille: "1.5 MB",
    categorie: "Assurance"
  },
];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator<Key extends keyof any>(order: Order, orderBy: Key) {
  return order === "desc"
    ? (a: { [key in Key]: any }, b: { [key in Key]: any }) => descendingComparator(a, b, orderBy)
    : (a: { [key in Key]: any }, b: { [key in Key]: any }) => -descendingComparator(a, b, orderBy);
}

const ClientCourriers = () => {
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<keyof Courrier>("dateReception");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const theme = useTheme();

  const filteredCourriers = useMemo(() => {
    let result = exampleCourriers.filter(
      (c) =>
        c.nomDocument.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.expediteur.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.categorie.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter !== "all") {
      result = result.filter(c => c.statut === statusFilter);
    }

    if (categoryFilter !== "all") {
      result = result.filter(c => c.categorie === categoryFilter);
    }

    if (tabValue === 1) {
      result = result.filter(c => c.statut === "non-lu");
    } else if (tabValue === 2) {
      result = result.filter(c => c.statut === "archivé");
    }

    return result;
  }, [searchTerm, statusFilter, categoryFilter, tabValue]);

  const sortedCourriers = useMemo(() => {
    return filteredCourriers.slice().sort(getComparator(order, orderBy));
  }, [filteredCourriers, order, orderBy]);

  const visibleCourriers = useMemo(() => {
    return sortedCourriers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedCourriers, page, rowsPerPage]);

  const isSelected = (id: string) => selected.indexOf(id) !== -1;
  
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = visibleCourriers.map((c) => c.id);
      setSelected(newSelecteds);
    } else {
      setSelected([]);
    }
  };
  
  const handleClick = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) newSelected = newSelected.concat(selected, id);
    else if (selectedIndex === 0) newSelected = newSelected.concat(selected.slice(1));
    else if (selectedIndex === selected.length - 1) newSelected = newSelected.concat(selected.slice(0, -1));
    else if (selectedIndex > 0) newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));

    setSelected(newSelected);
  };

  const handleRequestSort = (_event: React.MouseEvent<unknown>, property: keyof Courrier) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDownloadSelected = () => {
    selected.forEach((id) => {
      const courrier = exampleCourriers.find((c) => c.id === id);
      if (courrier) window.open(courrier.urlDocument, "_blank");
    });
  };
  
  const handlePreviewOpen = (url: string) => {
    setPreviewUrl(url);
    setPreviewOpen(true);
  };
  
  const handlePreviewClose = () => {
    setPreviewOpen(false);
    setPreviewUrl(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    handleFilterMenuClose();
    setPage(0);
  };

  const handleCategoryFilterChange = (category: string) => {
    setCategoryFilter(category);
    setPage(0);
  };

  const refreshData = () => {
    setLoading(true);
    // Simuler un chargement
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const getStatusChip = (statut: Courrier["statut"]) => {
    const statusConfig = {
      "non-lu": { color: "error", label: "Non lu", icon: <MarkEmailReadIcon /> },
      "lu": { color: "success", label: "Lu", icon: <VisibilityIcon /> },
      "archivé": { color: "default", label: "Archivé", icon: <ArchiveIcon /> },
    };
    
    const config = statusConfig[statut];
    return (
      <Chip 
        icon={config.icon} 
        label={config.label} 
        color={config.color as any} 
        size="small" 
        variant="outlined"
      />
    );
  };

  const getPriorityIcon = (priorite: Courrier["priorite"]) => {
    const priorityConfig = {
      "normal": { color: theme.palette.success.main, label: "Normal" },
      "élevée": { color: theme.palette.warning.main, label: "Élevée" },
      "urgent": { color: theme.palette.error.main, label: "Urgent" },
    };
    
    const config = priorityConfig[priorite];
    return (
      <Tooltip title={config.label}>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: config.color,
            display: 'inline-block',
            ml: 1
          }}
        />
      </Tooltip>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Banque': theme.palette.info.main,
      'Assurance': theme.palette.success.main,
      'Administration': theme.palette.warning.main,
      'Services': theme.palette.primary.main,
    };
    return colors[category as keyof typeof colors] || theme.palette.grey[500];
  };

  const categories = Array.from(new Set(exampleCourriers.map(c => c.categorie)));

  const speedDialActions = [
    { icon: <CloudUploadIcon />, name: 'Importer', onClick: () => console.log('Importer') },
    { icon: <PrintIcon />, name: 'Imprimer', onClick: () => window.print() },
    { icon: <EmailIcon />, name: 'Partager', onClick: () => console.log('Partager') },
  ];

  return (
    <Box sx={{ maxWidth: 1440, mx: "auto", p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 300 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2, width: 48, height: 48 }}>
            <DescriptionIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" noWrap>
              Mes courriers
            </Typography>
            <Typography variant="body1" color="text.secondary" noWrap>
              {filteredCourriers.length} document(s) trouvé(s)
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />} 
            onClick={refreshData}
            variant="outlined"
            disabled={loading}
          >
            Actualiser
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderLeft: `4px solid ${theme.palette.primary.main}`,
            height: '100%'
          }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                TOTAL
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {exampleCourriers.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Courriers au total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: alpha(theme.palette.warning.main, 0.05),
            borderLeft: `4px solid ${theme.palette.warning.main}`,
            height: '100%'
          }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                NON LUS
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {exampleCourriers.filter(c => c.statut === "non-lu").length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Requièrent attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: alpha(theme.palette.success.main, 0.05),
            borderLeft: `4px solid ${theme.palette.success.main}`,
            height: '100%'
          }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                ARCHIVÉS
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {exampleCourriers.filter(c => c.statut === "archivé").length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Documents classés
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: alpha(theme.palette.info.main, 0.05),
            borderLeft: `4px solid ${theme.palette.info.main}`,
            height: '100%'
          }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                CATÉGORIES
              </Typography>
              <AvatarGroup max={4} sx={{ justifyContent: 'flex-start', my: 1 }}>
                {categories.map(category => (
                  <Avatar key={category} sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: getCategoryColor(category),
                    fontSize: '0.8rem'
                  }}>
                    {category.charAt(0)}
                  </Avatar>
                ))}
              </AvatarGroup>
              <Typography variant="body2" color="textSecondary">
                {categories.length} catégories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden', borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: theme.palette.grey[50] }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="onglets courriers"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
            minHeight: 60,
            '& .MuiTab-root': {
              padding: { xs: '12px 16px', md: '16px 24px' },
              margin: { xs: '0 4px', md: '0 8px' },
              minHeight: 60,
              fontSize: { xs: '0.9rem', md: '1rem' },
              minWidth: 'auto',
            }
          }}
          >
            <Tab label="Tous les courriers" />
            <Tab 
              label={
                <Badge badgeContent={exampleCourriers.filter(c => c.statut === "non-lu").length} color="error">
                  Non lus
                </Badge>
              } 
            />
            <Tab label="Archivés" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, mb: 3, alignItems: { md: "center" } }}>
              <TextField
                placeholder="Rechercher un courrier..."
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
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant={categoryFilter === "all" ? "contained" : "outlined"}
                  size="small"
                  onClick={() => handleCategoryFilterChange("all")}
                >
                  Toutes catégories
                </Button>
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={categoryFilter === category ? "contained" : "outlined"}
                    size="small"
                    onClick={() => handleCategoryFilterChange(category)}
                    sx={{ 
                      borderColor: getCategoryColor(category),
                      color: categoryFilter === category ? 'white' : getCategoryColor(category),
                      backgroundColor: categoryFilter === category ? getCategoryColor(category) : 'transparent',
                      '&:hover': {
                        backgroundColor: categoryFilter === category ? getCategoryColor(category) : alpha(getCategoryColor(category), 0.1),
                      }
                    }}
                  >
                    {category}
                  </Button>
                ))}
                
                <Tooltip title="Filtrer par statut">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleFilterMenuOpen}
                    startIcon={<FilterListIcon />}
                  >
                    Statut
                  </Button>
                </Tooltip>
                <Menu
                  anchorEl={filterMenuAnchor}
                  open={Boolean(filterMenuAnchor)}
                  onClose={handleFilterMenuClose}
                >
                  <MenuItem onClick={() => handleStatusFilterChange("all")}>
                    Tous les statuts
                  </MenuItem>
                  <MenuItem onClick={() => handleStatusFilterChange("non-lu")}>
                    Non lus
                  </MenuItem>
                  <MenuItem onClick={() => handleStatusFilterChange("lu")}>
                    Lus
                  </MenuItem>
                  <MenuItem onClick={() => handleStatusFilterChange("archivé")}>
                    Archivés
                  </MenuItem>
                </Menu>
              </Box>
            </Box>

            {selected.length > 0 && (
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 2, 
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  '& .MuiAlert-message': { flex: 1 }
                }}
                action={
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={handleDownloadSelected}
                    startIcon={<DownloadIcon />}
                  >
                    Télécharger ({selected.length})
                  </Button>
                }
              >
                {selected.length} courrier(s) sélectionné(s)
              </Alert>
            )}

            <TableContainer>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Table aria-label="tableau courriers" size="medium">
                  <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
                    <TableRow>
                      <TableCell padding="checkbox" sx={{ width: 60 }}>
                        <Checkbox
                          color="primary"
                          indeterminate={selected.length > 0 && selected.length < visibleCourriers.length}
                          checked={visibleCourriers.length > 0 && selected.length === visibleCourriers.length}
                          onChange={handleSelectAllClick}
                          inputProps={{ "aria-label": "sélectionner tous les courriers visibles" }}
                        />
                      </TableCell>
                      <StyledTableHeadCell sortDirection={orderBy === "dateReception" ? order : false} sx={{ width: 120 }}>
                        <TableSortLabel
                          active={orderBy === "dateReception"}
                          direction={orderBy === "dateReception" ? order : "asc"}
                          onClick={(e) => handleRequestSort(e, "dateReception")}
                        >
                          Date
                        </TableSortLabel>
                      </StyledTableHeadCell>
                      <StyledTableHeadCell sx={{ width: 200 }}>
                        Expéditeur
                      </StyledTableHeadCell>
                      <StyledTableHeadCell sortDirection={orderBy === "nomDocument" ? order : false}>
                        <TableSortLabel
                          active={orderBy === "nomDocument"}
                          direction={orderBy === "nomDocument" ? order : "asc"}
                          onClick={(e) => handleRequestSort(e, "nomDocument")}
                        >
                          Document
                        </TableSortLabel>
                      </StyledTableHeadCell>
                      <StyledTableHeadCell sx={{ width: 100 }}>
                        Taille
                      </StyledTableHeadCell>
                      <StyledTableHeadCell sx={{ width: 120 }}>
                        Statut
                      </StyledTableHeadCell>
                      <StyledTableHeadCell align="center" sx={{ width: 120 }}>Actions</StyledTableHeadCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleCourriers.map((courrier) => {
                      const isItemSelected = selected.indexOf(courrier.id) !== -1;
                      return (
                        <StyledTableRow
                          key={courrier.id}
                          hover
                          role="checkbox"
                          aria-checked={isItemSelected}
                          selected={isItemSelected}
                          sx={{ cursor: 'pointer' }}
                        >
                          <StyledTableCell padding="checkbox" onClick={() => handleClick(courrier.id)}>
                            <Checkbox
                              color="primary"
                              checked={isItemSelected}
                              inputProps={{ "aria-labelledby": `courrier-checkbox-${courrier.id}` }}
                            />
                          </StyledTableCell>
                          <StyledTableCell>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(courrier.dateReception)}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {courrier.logo ? (
                                <Avatar src={courrier.logo} sx={{ width: 24, height: 24, mr: 1 }} />
                              ) : (
                                <Avatar sx={{ 
                                  width: 24, 
                                  height: 24, 
                                  mr: 1, 
                                  bgcolor: getCategoryColor(courrier.categorie),
                                  fontSize: '0.7rem'
                                }}>
                                  {courrier.expediteur.charAt(0)}
                                </Avatar>
                              )}
                              <Box>
                                <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                                  {courrier.expediteur}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {courrier.categorie}
                                </Typography>
                              </Box>
                              {getPriorityIcon(courrier.priorite)}
                            </Box>
                          </StyledTableCell>
                          <StyledTableCell>
                            <Typography variant="body2">
                              {courrier.nomDocument}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell>
                            <Typography variant="body2" color="text.secondary">
                              {courrier.taille}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell>
                            {getStatusChip(courrier.statut)}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                              <Tooltip title="Visualiser">
                                <IconButton 
                                  size="small" 
                                  color="primary" 
                                  onClick={() => handlePreviewOpen(courrier.urlDocument)}
                                  sx={{ 
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    "&:hover": {
                                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                    }
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Télécharger">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  component="a"
                                  href={courrier.urlDocument}
                                  download
                                  onClick={(e) => e.stopPropagation()}
                                  sx={{ 
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    "&:hover": {
                                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                    }
                                  }}
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </StyledTableCell>
                        </StyledTableRow>
                      );
                    })}
                    {visibleCourriers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <DescriptionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                            <Typography variant="body1" color="textSecondary" gutterBottom>
                              Aucun courrier trouvé
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Essayez de modifier vos filtres ou termes de recherche
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
            <TablePagination
              labelRowsPerPage="Lignes par page:"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={sortedCourriers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Alert severity="info" icon={<MarkEmailReadIcon />} sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                Vous avez {exampleCourriers.filter(c => c.statut === "non-lu").length} courrier(s) non lu(s)
              </Typography>
              <Typography variant="body2">
                Pensez à les consulter et à les traiter pour mettre à jour leur statut.
              </Typography>
            </Alert>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Alert severity="success" icon={<ArchiveIcon />} sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                Vous avez {exampleCourriers.filter(c => c.statut === "archivé").length} courrier(s) archivé(s)
              </Typography>
              <Typography variant="body2">
                Ces documents ont été classés et sont conservés pour consultation future.
              </Typography>
            </Alert>
          </Box>
        </TabPanel>
      </Paper>

      {/* Preview Dialog */}
      <Dialog 
        open={previewOpen} 
        onClose={handlePreviewClose} 
        maxWidth="lg" 
        fullWidth 
        sx={{ 
          '& .MuiDialog-paper': { 
            height: '80vh',
            borderRadius: 2
          } 
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2
        }}>
          <Typography variant="h6">Prévisualisation du document</Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {previewUrl ? (
            <iframe
              src={previewUrl}
              title="Prévisualisation document"
              width="100%"
              height="100%"
              style={{ border: "none", minHeight: '500px' }}
            />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              <Typography>Aucun document sélectionné</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handlePreviewClose}>
            Fermer
          </Button>
          <Button 
            component="a"
            href={previewUrl || ''}
            download
            target="_blank"
            variant="contained"
            startIcon={<DownloadIcon />}
          >
            Télécharger
          </Button>
        </DialogActions>
      </Dialog>

      {/* Speed Dial for quick actions */}
      <SpeedDial
        ariaLabel="Actions rapides"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        icon={<SpeedDialIcon />}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
        open={speedDialOpen}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.onClick}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default ClientCourriers;
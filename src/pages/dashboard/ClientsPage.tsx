import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  IconButton,
  SelectChangeEvent,
  alpha,
  Chip,
  Avatar,
  InputAdornment,
  Paper,
  Divider,
  Fade,
  Grid,
  Tooltip,
  Card,
  CircularProgress,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams, GridLocaleText } from "@mui/x-data-grid";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
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
  padding: theme.spacing(5, 4, 7),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(
    theme.palette.secondary.main || theme.palette.primary.light,
    0.16
  )} 100%)`,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  textAlign: 'center',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  padding: theme.spacing(1.5, 3),
  borderRadius: 14,
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.95rem',
  letterSpacing: '0.01em',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 14,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    fontSize: '0.95rem',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
    '&.Mui-focused': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}));

// -----------------------------------------------------------
// 2. Types et constantes
// -----------------------------------------------------------

interface Client {
  id: string;
  name: string;
  address: string;
  siren: string;
  status: "actif" | "en attente" | "inactif";
  email?: string;
  phone?: string;
  logo?: string;
  createdAt?: string;
  lastContact?: string;
}

const clientsData: Client[] = [
  {
    id: "client1",
    name: "Société Alpha",
    address: "12 rue de Paris, 75001 Paris",
    siren: "123456789",
    status: "actif",
    email: "contact@alpha.fr",
    phone: "+33 1 23 45 67 89",
    logo: "https://i.pravatar.cc/40?img=1",
    createdAt: "2023-03-01",
    lastContact: "2023-10-15"
  },
  {
    id: "client2",
    name: "Entreprise Beta",
    address: "45 avenue de Lyon, 69003 Lyon",
    siren: "987654321",
    status: "en attente",
    email: "info@beta.com",
    phone: "+33 4 56 78 90 12",
    logo: "https://i.pravatar.cc/40?img=2",
    createdAt: "2023-04-15",
    lastContact: "2023-09-20"
  },
  {
    id: "client3",
    name: "Compagnie Gamma",
    address: "78 boulevard de Marseille, 13001 Marseille",
    siren: "456789123",
    status: "inactif",
    email: "contact@gamma.org",
    phone: "+33 4 91 23 45 67",
    logo: "https://i.pravatar.cc/40?img=3",
    createdAt: "2023-05-10",
    lastContact: "2023-08-05"
  },
];

const statusColors: Record<Client["status"], string> = {
  "actif": "#4caf50",
  "en attente": "#ff9800",
  "inactif": "#f44336",
};

const statusIcons: Record<Client["status"], React.ReactNode> = {
  "actif": <CheckCircleIcon fontSize="small" />,
  "en attente": <ScheduleIcon fontSize="small" />,
  "inactif": <CancelIcon fontSize="small" />,
};

const localeText: Partial<GridLocaleText> = {
  noRowsLabel: "Aucun client à afficher",
  toolbarDensity: "Densité",
  toolbarDensityLabel: "Densité",
  toolbarDensityCompact: "Compact",
  toolbarDensityStandard: "Standard",
  toolbarDensityComfortable: "Confortable",
  MuiTablePagination: {
    labelRowsPerPage: "Clients par page",
    labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
      `${from}–${to} sur ${count !== -1 ? count : `plus de ${to}`}`,
  },
};

// -----------------------------------------------------------
// 3. Composant principal ClientsPage
// -----------------------------------------------------------

export default function ClientsPage() {
  const theme = useTheme();
  const [clients, setClients] = useState<Client[]>(clientsData);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<Client["status"] | "">("");
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        client.name.toLowerCase().includes(search) || 
        client.siren.includes(search) ||
        client.email?.toLowerCase().includes(search) ||
        client.address.toLowerCase().includes(search);
      const matchesStatus = statusFilter ? client.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    total: clients.length,
    actif: clients.filter(c => c.status === "actif").length,
    enAttente: clients.filter(c => c.status === "en attente").length,
    inactif: clients.filter(c => c.status === "inactif").length,
  }), [clients]);

  const columns: GridColDef[] = [
    {
      field: "client",
      headerName: "Client",
      flex: 1,
      sortable: true,
      renderCell: (params: GridRenderCellParams<Client>) => (
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar 
            src={params.row.logo} 
            sx={{ width: 40, height: 40, bgcolor: theme.palette.primary.main }}
          >
            {params.row.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body1" fontWeight="600">
              {params.row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              SIREN: {params.row.siren}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: "contact",
      headerName: "Contact",
      flex: 1,
      renderCell: (params: GridRenderCellParams<Client>) => (
        <Box>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <EmailIcon fontSize="small" color="action" />
            {params.row.email}
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PhoneIcon fontSize="small" color="action" />
            {params.row.phone}
          </Typography>
        </Box>
      ),
    },
    {
      field: "address",
      headerName: "Adresse",
      flex: 1.2,
      renderCell: (params: GridRenderCellParams<Client>) => (
        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LocationOnIcon fontSize="small" color="action" />
          {params.value}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Statut",
      width: 130,
      sortable: true,
      renderCell: (params: GridRenderCellParams<Client>) => (
        <Chip
          icon={statusIcons[params.value as Client["status"]]}
          label={params.value === "en attente" ? "En attente" : params.value}
          size="small"
          sx={{
            backgroundColor: alpha(statusColors[params.value as Client["status"]], 0.1),
            color: statusColors[params.value as Client["status"]],
            fontWeight: "600",
            border: `1px solid ${alpha(statusColors[params.value as Client["status"]], 0.2)}`,
            textTransform: "capitalize",
          }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Client>) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Voir les détails">
            <IconButton
              color="primary"
              onClick={() => {
                setEditingClient(params.row);
                setIsAdding(false);
              }}
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Modifier">
            <IconButton
              color="secondary"
              onClick={() => {
                setEditingClient(params.row);
                setIsAdding(false);
              }}
              sx={{
                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton
              color="error"
              onClick={() => {
                if (window.confirm(`Voulez-vous vraiment supprimer le client "${params.row.name}" ?`)) {
                  setClients((prev) => prev.filter((c) => c.id !== params.row.id));
                  if (editingClient?.id === params.row.id) {
                    setEditingClient(null);
                    setIsAdding(false);
                  }
                }
              }}
              sx={{
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.2),
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const handleSaveClient = (updatedClient: Client) => {
    setLoading(true);
    setTimeout(() => {
      if (isAdding) {
        setClients((prev) => [...prev, { 
          ...updatedClient, 
          id: `client${Date.now()}`,
          logo: "https://i.pravatar.cc/40?img=" + Math.floor(Math.random() * 10) + 1
        }]);
      } else {
        setClients((prev) =>
          prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
        );
      }
      setEditingClient(null);
      setIsAdding(false);
      setLoading(false);
    }, 1000);
  };

  const handleStatusFilterChange = (e: SelectChangeEvent<Client["status"] | "">) => {
    setStatusFilter(e.target.value as Client["status"] | "");
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
                  mb: 1
                }}
              >
                👥 Gestion des Clients
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                Gérez l'ensemble de votre portefeuille clients et suivez leur activité
              </Typography>
            </Header>

            <Box sx={{ p: 4 }}>
              {/* Statistiques */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <Typography variant="h4" fontWeight={800} color="primary.main">
                      {stats.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Clients total
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                    <Typography variant="h4" fontWeight={800} color="success.main">
                      {stats.actif}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Clients actifs
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                    <Typography variant="h4" fontWeight={800} color="warning.main">
                      {stats.enAttente}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      En attente
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                    <Typography variant="h4" fontWeight={800} color="error.main">
                      {stats.inactif}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Inactifs
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Actions principales */}
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", md: "center" }}
                spacing={3}
                sx={{ mb: 4 }}
              >
                <ActionButton
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                  onClick={() => {
                    setEditingClient({
                      id: "",
                      name: "",
                      siren: "",
                      address: "",
                      status: "actif",
                      email: "",
                      phone: "",
                    });
                    setIsAdding(true);
                  }}
                  disabled={loading}
                >
                  Nouveau client
                </ActionButton>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                  <SearchField
                    placeholder="Rechercher un client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ minWidth: 280 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControl sx={{ minWidth: 160 }}>
                    <InputLabel>Statut</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                      label="Statut"
                      size="small"
                    >
                      <MenuItem value="">Tous les statuts</MenuItem>
                      <MenuItem value="actif">Actif</MenuItem>
                      <MenuItem value="en attente">En attente</MenuItem>
                      <MenuItem value="inactif">Inactif</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>

              {/* DataGrid */}
              <Box sx={{ height: 560, width: "100%" }}>
                <DataGrid
                  rows={filteredClients}
                  columns={columns}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  pagination
                  disableRowSelectionOnClick
                  autoHeight={false}
                  localeText={localeText}
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      borderRadius: 2,
                    },
                    '& .MuiDataGrid-cell': {
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.02),
                    },
                  }}
                />
              </Box>
            </Box>
          </ModernCard>

          {editingClient !== null && (
            <ClientDialog
              client={editingClient}
              onClose={() => setEditingClient(null)}
              onSave={handleSaveClient}
              isAdding={isAdding}
              loading={loading}
            />
          )}
        </Box>
      </Fade>
    </Shell>
  );
}

interface ClientDialogProps {
  client: Client;
  onClose: () => void;
  onSave: (client: Client) => void;
  isAdding: boolean;
  loading: boolean;
}

function ClientDialog({ client, onClose, onSave, isAdding, loading }: ClientDialogProps) {
  const theme = useTheme();
  const [formState, setFormState] = React.useState<Omit<Client, "id">>({
    name: client.name,
    siren: client.siren,
    address: client.address,
    status: client.status,
    email: client.email || "",
    phone: client.phone || "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (!name) return;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (!name) return;
    setFormState((prev) => ({ ...prev, [name]: value as string }));
  };

  const handleSubmit = () => {
    if (!formState.name || !formState.siren || !formState.address) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    onSave({ ...client, ...formState });
  };

  return (
    <Dialog 
      open 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          overflow: 'hidden',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight="600">
          {isAdding ? "Créer un nouveau client" : `Modifier ${client.name}`}
        </Typography>
      </DialogTitle>
      <IconButton
        onClick={onClose}
        sx={{ 
          position: "absolute", 
          top: 12, 
          right: 12,
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nom du client *"
              name="name"
              value={formState.name}
              onChange={handleInputChange}
              autoFocus
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="SIREN *"
              name="siren"
              value={formState.siren}
              onChange={handleInputChange}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formState.email}
              onChange={handleInputChange}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Téléphone"
              name="phone"
              value={formState.phone}
              onChange={handleInputChange}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Adresse *"
              name="address"
              value={formState.address}
              onChange={handleInputChange}
              size="small"
              multiline
              rows={2}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Statut</InputLabel>
              <Select
                name="status"
                value={formState.status}
                onChange={handleSelectChange}
                label="Statut"
              >
                <MenuItem value="actif">Actif</MenuItem>
                <MenuItem value="en attente">En attente</MenuItem>
                <MenuItem value="inactif">Inactif</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <ActionButton onClick={onClose} color="inherit">
          Annuler
        </ActionButton>
        <ActionButton
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          {isAdding ? "Créer le client" : "Enregistrer"}
        </ActionButton>
      </DialogActions>
    </Dialog>
  );
}
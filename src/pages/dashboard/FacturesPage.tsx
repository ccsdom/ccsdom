import React, { useState, useMemo, useCallback, useEffect } from "react";
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
  IconButton,
  Tooltip,
  alpha,
  Chip,
  Card,
  useTheme,
  Paper,
  InputAdornment,
  Avatar,
  CircularProgress,
  Divider,
  Badge,
  Tabs,
  Tab,
  Grid,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
  GridRowId,
} from "@mui/x-data-grid";
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  PictureAsPdf as PictureAsPdfIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  CalendarMonth as CalendarMonthIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fr } from "date-fns/locale";

// -----------------------------------------------------------
// 1. Styled Components
// -----------------------------------------------------------

const Shell = styled(Box)(({ theme }) => ({
  maxWidth: 1600,
  marginInline: "auto",
  padding: theme.spacing(3),
  [theme.breakpoints.up("md")]: { padding: theme.spacing(4) },
}));

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.12)}`,
  overflow: "hidden",
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(
    theme.palette.background.default,
    0.95
  )} 100%)`,
  backdropFilter: "blur(10px)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const Header = styled(Box)(({ theme }) => ({
  position: "relative",
  padding: theme.spacing(4, 3, 6),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(
    theme.palette.secondary.main || theme.palette.primary.light,
    0.2
  )} 100%)`,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: "auto",
  padding: theme.spacing(1, 2),
  borderRadius: 12,
  fontWeight: 600,
  textTransform: "none",
  boxShadow: "none",
  "&:hover": {
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
  },
}));

const StatusBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
  },
}));

// -----------------------------------------------------------
// 2. Types & constantes
// -----------------------------------------------------------

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  status: "payée" | "impayée" | "en_attente";
  date: string;
  dueDate: string;
  clientLogo?: string;
  clientEmail?: string;
  items?: InvoiceItem[];
}

const initialInvoices: Invoice[] = [
  {
    id: "INV-001",
    clientName: "Société Alpha",
    amount: 1200,
    status: "payée",
    date: "2023-06-15",
    dueDate: "2023-07-15",
    clientLogo: "https://i.pravatar.cc/40?img=1",
    clientEmail: "contact@alpha.com",
    items: [
      { id: "1", description: "Développement d'application", quantity: 10, unitPrice: 100 },
      { id: "2", description: "Design UX/UI", quantity: 5, unitPrice: 40 },
    ],
  },
  {
    id: "INV-002",
    clientName: "Entreprise Beta",
    amount: 450,
    status: "impayée",
    date: "2023-06-20",
    dueDate: "2023-07-20",
    clientLogo: "https://i.pravatar.cc/40?img=2",
    clientEmail: "compta@beta.com",
    items: [{ id: "1", description: "Maintenance site web", quantity: 3, unitPrice: 150 }],
  },
  {
    id: "INV-003",
    clientName: "Compagnie Gamma",
    amount: 890,
    status: "en_attente",
    date: "2023-06-25",
    dueDate: "2023-07-25",
    clientLogo: "https://i.pravatar.cc/40?img=3",
    clientEmail: "info@gamma.com",
    items: [{ id: "1", description: "Hébergement mensuel", quantity: 1, unitPrice: 890 }],
  },
  {
    id: "INV-004",
    clientName: "Industries Delta",
    amount: 2300,
    status: "payée",
    date: "2023-07-01",
    dueDate: "2023-08-01",
    clientLogo: "https://i.pravatar.cc/40?img=4",
    clientEmail: "admin@delta.com",
    items: [
      { id: "1", description: "Formation équipe", quantity: 20, unitPrice: 100 },
      { id: "2", description: "Support technique", quantity: 10, unitPrice: 30 },
    ],
  },
  {
    id: "INV-005",
    clientName: "Services Epsilon",
    amount: 670,
    status: "impayée",
    date: "2023-07-05",
    dueDate: "2023-08-05",
    clientLogo: "https://i.pravatar.cc/40?img=5",
    clientEmail: "direction@epsilon.com",
    items: [{ id: "1", description: "Audit sécurité", quantity: 1, unitPrice: 670 }],
  },
];

const statusColors: Record<Invoice["status"], string> = {
  payée: "#4caf50",
  impayée: "#f44336",
  en_attente: "#ff9800",
};

// IMPORTANT : Chip.icon attend un ReactElement
const statusIcons: Record<Invoice["status"], React.ReactElement> = {
  payée: <CheckCircleIcon fontSize="small" />,
  impayée: <CancelIcon fontSize="small" />,
  en_attente: <ScheduleIcon fontSize="small" />,
};

// -----------------------------------------------------------
// 3. Composant principal
// -----------------------------------------------------------

export default function FacturesPage() {
  const theme = useTheme();
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [dateFilter, setDateFilter] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  // DataGrid v6/v7 pagination model
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  // DataGrid row selection
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter ? inv.status === statusFilter : true;

      let matchesDate = true;
      if (dateFilter.start && dateFilter.end) {
        const invoiceDate = new Date(inv.date);
        matchesDate = invoiceDate >= dateFilter.start && invoiceDate <= dateFilter.end;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [invoices, searchTerm, statusFilter, dateFilter]);

  const stats = useMemo(() => {
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paidAmount = invoices.filter((inv) => inv.status === "payée").reduce((s, i) => s + i.amount, 0);
    const overdueInvoices = invoices.filter(
      (inv) => inv.status !== "payée" && new Date(inv.dueDate) < new Date()
    );
    return {
      totalAmount,
      paidAmount,
      overdueCount: overdueInvoices.length,
      overdueAmount: overdueInvoices.reduce((s, i) => s + i.amount, 0),
    };
  }, [invoices]);

  const handleDeleteInvoice = useCallback((id: string) => {
    if (window.confirm("Confirmez-vous la suppression de cette facture ?")) {
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      setSelectionModel((prev: GridRowSelectionModel) =>
        prev.filter((selId: GridRowId) => selId !== id)
      );
    }
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectionModel.length === 0) {
      alert("Sélectionnez au moins une facture à supprimer.");
      return;
    }
    if (window.confirm(`Confirmez-vous la suppression des ${selectionModel.length} factures sélectionnées ?`)) {
      setInvoices((prev) => prev.filter((inv) => !selectionModel.includes(inv.id)));
      setSelectionModel([]);
    }
  }, [selectionModel]);

  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleSaveInvoice = useCallback(
    (updatedInvoice: Invoice) => {
      setLoading(true);
      setTimeout(() => {
        if (isAdding) {
          setInvoices((prev) => [
            ...prev,
            {
              ...updatedInvoice,
              id: `INV-${Date.now().toString().slice(-3)}`,
              items: updatedInvoice.items || [],
            },
          ]);
        } else {
          setInvoices((prev) => prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv)));
        }
        setEditingInvoice(null);
        setIsAdding(false);
        setLoading(false);
      }, 700);
    },
    [isAdding]
  );

  const handleOpenAddDialog = useCallback(() => {
    setEditingInvoice({
      id: "",
      clientName: "",
      amount: 0,
      status: "en_attente",
      date: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      clientEmail: "",
      items: [{ id: "1", description: "", quantity: 1, unitPrice: 0 }],
    });
    setIsAdding(true);
  }, []);

  const handleExportInvoices = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      alert("Export des factures en cours...");
      setLoading(false);
    }, 1000);
  }, []);

  const handleSendReminder = useCallback((invoice: Invoice) => {
    setLoading(true);
    setTimeout(() => {
      alert(`Rappel envoyé à ${invoice.clientEmail}`);
      setLoading(false);
    }, 1000);
  }, []);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "client",
        headerName: "Client",
        flex: 1,
        renderCell: (params: GridRenderCellParams) => (
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar src={params.row.clientLogo} sx={{ width: 40, height: 40, bgcolor: theme.palette.primary.main }}>
              {params.row.clientName.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="600">
                {params.row.clientName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {params.row.id}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        field: "amount",
        headerName: "Montant",
        width: 130,
        type: "number",
        sortable: true,
        renderCell: (params: GridRenderCellParams<number>) => (
          <Typography variant="body2" fontWeight="600">
            {params.value?.toFixed(2)} €
          </Typography>
        ),
      },
      {
        field: "status",
        headerName: "Statut",
        width: 130,
        renderCell: (params: GridRenderCellParams<Invoice["status"]>) => {
          const isOverdue = params.row.status !== "payée" && new Date(params.row.dueDate) < new Date();
          const status = params.value as Invoice["status"];
          return (
            <Stack spacing={0.5}>
              <Chip
                icon={statusIcons[status]}
                label={String(status).replace("_", " ")}
                size="small"
                sx={{
                  backgroundColor: alpha(statusColors[status], 0.1),
                  color: statusColors[status],
                  fontWeight: "600",
                  textTransform: "capitalize",
                  border: `1px solid ${alpha(statusColors[status], 0.3)}`,
                }}
              />
              {isOverdue && (
                <Chip label="En retard" size="small" color="error" variant="outlined" sx={{ fontSize: "0.7rem", height: 20 }} />
              )}
            </Stack>
          );
        },
      },
      {
        field: "date",
        headerName: "Date",
        width: 120,
        sortable: true,
        renderCell: (params: GridRenderCellParams<string>) => (
          <Typography variant="body2">{new Date(params.value).toLocaleDateString("fr-FR")}</Typography>
        ),
      },
      {
        field: "dueDate",
        headerName: "Échéance",
        width: 120,
        sortable: true,
        renderCell: (params: GridRenderCellParams<string>) => (
          <Typography variant="body2" color={new Date(params.value) < new Date() ? "error" : "text.primary"}>
            {new Date(params.value).toLocaleDateString("fr-FR")}
          </Typography>
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 180,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Visualiser/Modifier">
              <IconButton
                color="primary"
                onClick={() => {
                  setEditingInvoice(params.row as Invoice);
                  setIsAdding(false);
                }}
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.2) },
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Supprimer">
              <IconButton
                color="error"
                onClick={() => handleDeleteInvoice(params.id as string)}
                sx={{
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  "&:hover": { backgroundColor: alpha(theme.palette.error.main, 0.2) },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Télécharger PDF">
              <IconButton
                color="secondary"
                sx={{
                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                  "&:hover": { backgroundColor: alpha(theme.palette.secondary.main, 0.2) },
                }}
              >
                <PictureAsPdfIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {params.row.status !== "payée" && (
              <Tooltip title="Envoyer un rappel">
                <IconButton
                  color="warning"
                  onClick={() => handleSendReminder(params.row)}
                  sx={{
                    backgroundColor: alpha(theme.palette.warning.main, 0.1),
                    "&:hover": { backgroundColor: alpha(theme.palette.warning.main, 0.2) },
                  }}
                >
                  <NotificationsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        ),
      },
    ],
    [handleDeleteInvoice, theme, handleSendReminder]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Shell>
        <ModernCard>
          <Header>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="h4" fontWeight={800}>
                  📋 Gestion des factures
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Gérez et suivez toutes vos factures clients
                </Typography>
              </Box>
              <StatusBadge badgeContent={stats.overdueCount} color="error">
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<NotificationsIcon />}
                  onClick={() => setStatusFilter("impayée")}
                >
                  Factures en retard
                </Button>
              </StatusBadge>
            </Stack>
          </Header>

          <Box sx={{ p: 3 }}>
            {/* Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, borderRadius: 2, textAlign: "center" }}>
                  <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                    <AttachMoneyIcon color="primary" />
                    <Box>
                      <Typography variant="h6" fontWeight="600">
                        {stats.totalAmount.toFixed(2)} €
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Chiffre d'affaires
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, borderRadius: 2, textAlign: "center" }}>
                  <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                    <CheckCircleIcon color="success" />
                    <Box>
                      <Typography variant="h6" fontWeight="600" color="success.main">
                        {stats.paidAmount.toFixed(2)} €
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Factures payées
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, borderRadius: 2, textAlign: "center" }}>
                  <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                    <TrendingUpIcon color="info" />
                    <Box>
                      <Typography variant="h6" fontWeight="600">
                        {invoices.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total factures
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, borderRadius: 2, textAlign: "center" }}>
                  <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                    <CancelIcon color="error" />
                    <Box>
                      <Typography variant="h6" fontWeight="600" color="error.main">
                        {stats.overdueAmount.toFixed(2)} €
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        En retard
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>

            {/* Actions */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={2}
              mb={3}
            >
              <Stack direction="row" spacing={1.5}>
                <ActionButton
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
                  onClick={handleOpenAddDialog}
                  disabled={loading}
                >
                  Nouvelle facture
                </ActionButton>
                <ActionButton variant="outlined" color="secondary" startIcon={<DownloadIcon />} onClick={handleExportInvoices} disabled={loading}>
                  Exporter
                </ActionButton>
              </Stack>

              {selectionModel.length > 0 && (
                <ActionButton variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteSelected}>
                  Supprimer ({selectionModel.length})
                </ActionButton>
              )}
            </Stack>

            {/* Filtres */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
              <SearchField
                label="Rechercher"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
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
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Statut" sx={{ borderRadius: 2 }}>
                  <MenuItem value="">Tous les statuts</MenuItem>
                  <MenuItem value="payée">Payée</MenuItem>
                  <MenuItem value="impayée">Impayée</MenuItem>
                  <MenuItem value="en_attente">En attente</MenuItem>
                </Select>
              </FormControl>

              {/* DatePicker v5 (API renderInput) */}
              <DatePicker
                label="Date de début"
                value={dateFilter.start}
                onChange={(newValue: Date | null) => setDateFilter((prev) => ({ ...prev, start: newValue }))}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
              <DatePicker
                label="Date de fin"
                value={dateFilter.end}
                onChange={(newValue: Date | null) => setDateFilter((prev) => ({ ...prev, end: newValue }))}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
            </Stack>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                <Tab label="Toutes les factures" />
                <Tab label="Payées" />
                <Tab label="Impayées" />
                <Tab label="En attente" />
              </Tabs>
            </Box>

            {/* DataGrid v6/v7 */}
            <Box sx={{ height: 560, width: "100%" }}>
              <DataGrid
                rows={filteredInvoices}
                columns={columns}
                pagination
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 20, 50, 100]}
                checkboxSelection
                onRowSelectionModelChange={(newSelectionModel: GridRowSelectionModel) => setSelectionModel(newSelectionModel)}
                rowSelectionModel={selectionModel}
                disableRowSelectionOnClick
                loading={loading}
                sx={{
                  border: "none",
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 2,
                  },
                  "& .MuiDataGrid-cell": {
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  },
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  },
                }}
              />
            </Box>
          </Box>
        </ModernCard>

        {editingInvoice !== null && (
          <InvoiceDialog invoice={editingInvoice} onClose={() => setEditingInvoice(null)} onSave={handleSaveInvoice} isAdding={isAdding} loading={loading} />
        )}
      </Shell>
    </LocalizationProvider>
  );
}

// -----------------------------------------------------------
// 4. Dialog
// -----------------------------------------------------------

interface InvoiceDialogProps {
  invoice: Invoice;
  isAdding: boolean;
  loading: boolean;
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
}

function InvoiceDialog({ invoice, onClose, onSave, isAdding, loading }: InvoiceDialogProps) {
  const theme = useTheme();
  const [formState, setFormState] = useState<Omit<Invoice, "id">>({
    clientName: invoice.clientName,
    amount: invoice.amount,
    status: invoice.status,
    date: invoice.date,
    dueDate: invoice.dueDate,
    clientEmail: invoice.clientEmail || "",
    items: invoice.items || [{ id: "1", description: "", quantity: 1, unitPrice: 0 }],
  });

  useEffect(() => {
    setFormState({
      clientName: invoice.clientName,
      amount: invoice.amount,
      status: invoice.status,
      date: invoice.date,
      dueDate: invoice.dueDate,
      clientEmail: invoice.clientEmail || "",
      items: invoice.items || [{ id: "1", description: "", quantity: 1, unitPrice: 0 }],
    });
  }, [invoice]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...(formState.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    const totalAmount = newItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    setFormState((prev) => ({
      ...prev,
      items: newItems,
      amount: totalAmount,
    }));
  };

  const addNewItem = () => {
    setFormState((prev) => ({
      ...prev,
      items: [...(prev.items || []), { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    const newItems = [...(formState.items || [])];
    newItems.splice(index, 1);
    const totalAmount = newItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    setFormState((prev) => ({
      ...prev,
      items: newItems,
      amount: totalAmount,
    }));
  };

  const handleSubmit = () => {
    if (!formState.clientName || formState.amount === null) {
      alert("Le nom du client et le montant sont obligatoires.");
      return;
    }
    const savedInvoice = { ...invoice, ...formState };
    onSave(savedInvoice);
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": { borderRadius: 3, overflow: "hidden" },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight="600">
          {isAdding ? "Créer une nouvelle facture" : `Modifier la facture ${invoice.id}`}
        </Typography>
      </DialogTitle>
      <IconButton onClick={onClose} sx={{ position: "absolute", top: 12, right: 12 }}>
        <CloseIcon />
      </IconButton>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth margin="normal" label="Client" name="clientName" value={formState.clientName} onChange={handleChange} autoFocus />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth margin="normal" label="Email du client" name="clientEmail" type="email" value={formState.clientEmail} onChange={handleChange} />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth margin="normal" label="Date" name="date" type="date" value={formState.date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth margin="normal" label="Date d'échéance" name="dueDate" type="date" value={formState.dueDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          </Grid>
        </Grid>

        <FormControl fullWidth margin="normal">
          <InputLabel>Statut</InputLabel>
          <Select name="status" value={formState.status} onChange={(e) => handleChange(e as any)} label="Statut" sx={{ borderRadius: 2 }}>
            <MenuItem value="payée">Payée</MenuItem>
            <MenuItem value="impayée">Impayée</MenuItem>
            <MenuItem value="en_attente">En attente</MenuItem>
          </Select>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Articles de la facture
        </Typography>

        {formState.items?.map((item, index) => (
          <Grid container spacing={2} key={item.id} alignItems="center">
            <Grid item xs={5}>
              <TextField fullWidth margin="normal" label="Description" value={item.description} onChange={(e) => handleItemChange(index, "description", e.target.value)} />
            </Grid>
            <Grid item xs={2}>
              <TextField
                fullWidth
                margin="normal"
                label="Quantité"
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value, 10) || 0)}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                margin="normal"
                label="Prix unitaire"
                type="number"
                value={item.unitPrice}
                onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                InputProps={{ startAdornment: <InputAdornment position="start">€</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={2}>
              <IconButton color="error" onClick={() => removeItem(index)} disabled={(formState.items?.length || 0) <= 1}>
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}

        <Button startIcon={<AddIcon />} onClick={addNewItem} sx={{ mt: 1 }}>
          Ajouter un article
        </Button>

        <Divider sx={{ my: 2 }} />

        <TextField
          fullWidth
          margin="normal"
          label="Montant total (€)"
          name="amount"
          type="number"
          value={formState.amount}
          InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">€</InputAdornment> }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <ActionButton onClick={onClose} color="inherit">
          Annuler
        </ActionButton>
        <ActionButton variant="contained" color="primary" onClick={handleSubmit} disabled={loading} startIcon={loading ? <CircularProgress size={16} /> : undefined}>
          {isAdding ? "Créer" : "Enregistrer"}
        </ActionButton>
      </DialogActions>
    </Dialog>
  );
}

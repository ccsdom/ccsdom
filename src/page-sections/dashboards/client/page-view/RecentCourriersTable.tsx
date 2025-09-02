import React, { useState, useMemo } from "react";
import {
  alpha,
  Box,
  Checkbox,
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
  Typography,
  IconButton,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
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
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

interface Courrier {
  id: string;
  dateReception: string;
  expediteur: string;
  nomDocument: string;
  urlDocument: string;
  statut?: "non-lu" | "lu" | "archivé";
  priorite?: "normal" | "élevée" | "urgent";
}

interface Props {
  courriers: Courrier[];
  documentsAccessibles: boolean;
  onRefresh?: () => void;
  loading?: boolean;
}

type Order = "asc" | "desc";

interface HeadCell {
  id: keyof Courrier | "actions";
  label: string;
  numeric: boolean;
  disableSorting?: boolean;
  width?: string;
}

const headCells: HeadCell[] = [
  { id: "dateReception", numeric: false, label: "Date réception", width: "15%" },
  { id: "expediteur", numeric: false, label: "Expéditeur", width: "25%" },
  { id: "nomDocument", numeric: false, label: "Document", width: "30%" },
  { id: "statut", numeric: false, label: "Statut", width: "15%", disableSorting: true },
  { id: "actions", numeric: false, label: "Actions", disableSorting: true, width: "15%" },
];

interface EnhancedTableHeadProps {
  numSelected: number;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: keyof Courrier;
  rowCount: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Courrier) => void;
}

const EnhancedTableHead: React.FC<EnhancedTableHeadProps> = ({
  onSelectAllClick,
  order,
  orderBy,
  numSelected,
  rowCount,
  onRequestSort,
}) => {
  const createSortHandler = (property: keyof Courrier) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox" sx={{ width: '60px' }}>
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ "aria-label": "select all courriers" }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ width: headCell.width }}
          >
            {headCell.disableSorting ? (
              headCell.label
            ) : (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id as keyof Courrier)}
              >
                {headCell.label}
              </TableSortLabel>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

interface EnhancedTableToolbarProps {
  numSelected: number;
  selectedIds: string[];
  courriers: Courrier[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onBulkAction: (action: string, ids: string[]) => void;
}

const EnhancedTableToolbar: React.FC<EnhancedTableToolbarProps> = ({ 
  numSelected, 
  selectedIds, 
  courriers, 
  searchTerm, 
  onSearchChange,
  onBulkAction 
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  
  const handleDownloadSelected = () => {
    selectedIds.forEach((id) => {
      const courrier = courriers.find((c) => c.id === id);
      if (courrier) {
        window.open(courrier.urlDocument, "_blank");
      }
    });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleBulkAction = (action: string) => {
    onBulkAction(action, selectedIds);
    handleMenuClose();
  };

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        py: 2,
        bgcolor: (theme) =>
          numSelected > 0
            ? alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity)
            : "inherit",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "stretch", md: "center" },
        gap: 2,
      }}
    >
      {numSelected > 0 ? (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="subtitle1" component="div">
            {numSelected} élément{numSelected > 1 ? "s" : ""} sélectionné{numSelected > 1 ? "s" : ""}
          </Typography>
          <Button
            variant="text"
            color="primary"
            onClick={handleDownloadSelected}
            sx={{ ml: 2, textTransform: "none" }}
            startIcon={<DownloadIcon />}
          >
            Télécharger
          </Button>
          <IconButton onClick={handleMenuOpen} sx={{ ml: 1 }}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleBulkAction("marquer-lu")}>
              <ListItemIcon>
                <CheckCircleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Marquer comme lu</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleBulkAction("archiver")}>
              <ListItemIcon>
                <ArchiveIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Archiver</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleBulkAction("supprimer")}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Supprimer</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      ) : (
        <Typography variant="h6" id="tableTitle" component="div">
          Derniers courriers reçus
        </Typography>
      )}

      <TextField
        placeholder="Rechercher..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        sx={{ width: { xs: "100%", md: "300px" } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </Toolbar>
  );
};

const RecentCourriersTable: React.FC<Props> = ({ 
  courriers, 
  documentsAccessibles, 
  onRefresh,
  loading = false 
}) => {
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<keyof Courrier>("dateReception");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const theme = useTheme();

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof Courrier) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = filteredCourriers.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    event.stopPropagation();
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) newSelected = newSelected.concat(selected, id);
    else if (selectedIndex === 0) newSelected = newSelected.concat(selected.slice(1));
    else if (selectedIndex === selected.length - 1) newSelected = newSelected.concat(selected.slice(0, -1));
    else if (selectedIndex > 0) newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));

    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handlePreview = (url: string) => {
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
  };

  const handleBulkAction = (action: string, ids: string[]) => {
    console.log(`Action: ${action} sur les IDs:`, ids);
    // Implémenter la logique métier ici
    setSelected([]);
  };

  const filteredCourriers = useMemo(() => {
    if (!searchTerm) return courriers;
    
    const term = searchTerm.toLowerCase();
    return courriers.filter(
      (courrier) =>
        courrier.expediteur.toLowerCase().includes(term) ||
        courrier.nomDocument.toLowerCase().includes(term) ||
        courrier.dateReception.includes(term)
    );
  }, [courriers, searchTerm]);

  const visibleRows = useMemo(() => {
    const comparator = getComparator(order, orderBy);
    return filteredCourriers
      .slice()
      .sort(comparator)
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredCourriers, order, orderBy, page, rowsPerPage]);

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredCourriers.length) : 0;

  const getStatusChip = (statut: Courrier["statut"]) => {
    if (!statut) return null;
    
    const statusConfig = {
      "non-lu": { color: "error", label: "Non lu" },
      "lu": { color: "success", label: "Lu" },
      "archivé": { color: "default", label: "Archivé" },
    };
    
    const config = statusConfig[statut];
    return <Chip label={config.label} color={config.color as any} size="small" />;
  };

  if (!documentsAccessibles) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        Accès aux documents désactivé. Veuillez régulariser votre situation pour accéder à vos courriers.
      </Alert>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ mb: 2, overflow: 'hidden' }}>
        <EnhancedTableToolbar 
          numSelected={selected.length} 
          selectedIds={selected} 
          courriers={courriers} 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onBulkAction={handleBulkAction}
        />
        
        <TableContainer>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="medium">
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={filteredCourriers.length}
              />
              <TableBody>
                {visibleRows.map((row, index) => {
                  const isItemSelected = selected.indexOf(row.id) !== -1;
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox" onClick={(e) => handleClick(e, row.id)}>
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{ "aria-labelledby": labelId }}
                        />
                      </TableCell>
                      <TableCell 
                        component="th" 
                        id={labelId} 
                        scope="row" 
                        padding="normal"
                      >
                        {formatDate(row.dateReception)}
                      </TableCell>
                      <TableCell>{row.expediteur}</TableCell>
                      <TableCell>{row.nomDocument}</TableCell>
                      <TableCell>
                        {getStatusChip(row.statut)}
                      </TableCell>
                      <TableCell align="center" padding="none">
                        <Tooltip title="Visualiser">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(row.urlDocument);
                            }}
                            size="small"
                            color="primary"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Télécharger">
                          <IconButton
                            component="a"
                            href={row.urlDocument}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                            color="primary"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
                {visibleRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        {searchTerm ? "Aucun résultat trouvé" : "Aucun courrier disponible"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCourriers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Paper>

      <Dialog 
        open={previewOpen} 
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { height: '80vh' } }}
      >
        <DialogTitle>Aperçu du document</DialogTitle>
        <DialogContent dividers>
          <iframe 
            src={previewUrl} 
            width="100%" 
            height="100%" 
            style={{ border: 'none', minHeight: '500px' }}
            title="Aperçu du document"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>Fermer</Button>
          <Button 
            component="a"
            href={previewUrl}
            download
            target="_blank"
            variant="contained"
          >
            Télécharger
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Helper functions
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (a: { [key in Key]: any }, b: { [key in Key]: any }) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

export default RecentCourriersTable;
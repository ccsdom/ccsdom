import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Description } from "@mui/icons-material";
const ClientFoldersColumns = ({ folders }) => {
    return (_jsx(Box, { display: "flex", gap: 2, mt: 3, children: folders.map((folder) => (_jsxs(Paper, { sx: { p: 2, flex: 1, maxHeight: 300, overflowY: "auto", minWidth: 150 }, elevation: 3, children: [_jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: folder.name }), _jsx(List, { dense: true, children: folder.files.length > 0 ? (folder.files.map((fileName, idx) => (_jsxs(ListItem, { children: [_jsx(ListItemIcon, { children: _jsx(Description, {}) }), _jsx(ListItemText, { primary: fileName })] }, idx)))) : (_jsx(Typography, { variant: "body2", color: "textSecondary", sx: { pl: 2 }, children: "Aucun fichier" })) })] }, folder.name))) }));
};
export default ClientFoldersColumns;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Typography, List, ListItem, Collapse } from "@mui/material";
import { Folder, InsertDriveFile } from "@mui/icons-material";
const exampleFileTree = [
    {
        name: "Contrats",
        type: "folder",
        children: [
            { name: "Contrat_2023.pdf", type: "file" },
            { name: "Contrat_2024.pdf", type: "file" },
        ],
    },
    {
        name: "Factures",
        type: "folder",
        children: [
            { name: "Facture_001.pdf", type: "file" },
            { name: "Facture_002.pdf", type: "file" },
        ],
    },
    { name: "Résumé_client.docx", type: "file" },
];
const FileTreeView = ({ nodes }) => {
    const [openFolders, setOpenFolders] = useState({});
    const toggleFolder = (folderName) => {
        setOpenFolders((prev) => ({
            ...prev,
            [folderName]: !prev[folderName],
        }));
    };
    return (_jsx(List, { children: nodes.map((node) => node.type === "folder" ? (_jsxs(Box, { sx: { pl: 2 }, children: [_jsxs(ListItem, { button: true, onClick: () => toggleFolder(node.name), children: [_jsx(Folder, {}), _jsx(Typography, { sx: { ml: 1 }, children: node.name })] }), _jsx(Collapse, { in: openFolders[node.name], timeout: "auto", unmountOnExit: true, children: _jsx(FileTreeView, { nodes: node.children || [] }) })] }, node.name)) : (_jsxs(ListItem, { sx: { pl: 4 }, children: [_jsx(InsertDriveFile, {}), _jsx(Typography, { sx: { ml: 1 }, children: node.name })] }, node.name))) }));
};
export default FileTreeView;

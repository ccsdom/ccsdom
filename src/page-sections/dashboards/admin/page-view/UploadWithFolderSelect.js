import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, MenuItem, Select, InputLabel, FormControl, Typography, Paper, List, ListItem, ListItemText, Button, } from "@mui/material";
import { useDropzone } from "react-dropzone";
const folders = [
    { id: "urssaf", label: "Courrier URSSAF" },
    { id: "impots", label: "Impôts" },
    { id: "clients", label: "Clients/Fournisseurs" },
    { id: "autres", label: "Autres" },
];
const UploadWithFolderSelect = ({ onUpload }) => {
    const [selectedFolder, setSelectedFolder] = useState("");
    const [files, setFiles] = useState([]);
    const onDrop = (acceptedFiles) => {
        setFiles((prev) => [...prev, ...acceptedFiles]);
    };
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
    const handleFolderChange = (event) => {
        setSelectedFolder(event.target.value);
    };
    const handleSend = () => {
        if (!selectedFolder) {
            alert("Veuillez sélectionner un dossier.");
            return;
        }
        if (files.length === 0) {
            alert("Veuillez sélectionner au moins un fichier.");
            return;
        }
        onUpload(files, selectedFolder);
        setFiles([]);
        setSelectedFolder("");
    };
    return (_jsxs(Box, { mt: 3, children: [_jsxs(FormControl, { fullWidth: true, sx: { mb: 2 }, children: [_jsx(InputLabel, { id: "folder-select-label", children: "S\u00E9lectionner un dossier" }), _jsx(Select, { labelId: "folder-select-label", value: selectedFolder, label: "S\u00E9lectionner un dossier", onChange: handleFolderChange, children: folders.map((folder) => (_jsx(MenuItem, { value: folder.id, children: folder.label }, folder.id))) })] }), _jsxs(Paper, { ...getRootProps(), sx: {
                    border: "2px dashed #ccc",
                    p: 4,
                    textAlign: "center",
                    backgroundColor: isDragActive ? "#eee" : "#fafafa",
                    cursor: "pointer",
                }, children: [_jsx("input", { ...getInputProps() }), isDragActive ? (_jsx(Typography, { children: "D\u00E9posez vos fichiers ici..." })) : (_jsx(Typography, { children: "Glissez-d\u00E9posez les fichiers ou cliquez pour s\u00E9lectionner" }))] }), files.length > 0 && (_jsx(List, { sx: { mt: 2, maxHeight: 200, overflowY: "auto" }, children: files.map((file, idx) => (_jsx(ListItem, { children: _jsx(ListItemText, { primary: file.name }) }, idx))) })), _jsx(Button, { variant: "contained", color: "primary", onClick: handleSend, disabled: !selectedFolder || files.length === 0, sx: { mt: 2 }, children: "Envoyer dans le dossier" })] }));
};
export default UploadWithFolderSelect;

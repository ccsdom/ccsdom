import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/UploadZone.tsx
import { useState, useRef } from "react";
import { Box, Button, TextField, MenuItem, Typography, LinearProgress, Stack } from "@mui/material";
const UploadZone = ({ clientsList, onUpload, uploading, progress }) => {
    const [selectedClient, setSelectedClient] = useState(clientsList[0]);
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };
    const handleDragLeave = () => setDragActive(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
        }
    };
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };
    const handleUploadClick = async () => {
        if (file) {
            await onUpload(file, selectedClient);
            setFile(null);
        }
    };
    return (_jsxs(Box, { children: [_jsxs(Stack, { direction: { xs: "column", sm: "row" }, spacing: 2, alignItems: "center", mb: 3, children: [_jsx(TextField, { select: true, label: "S\u00E9lectionner le client", value: selectedClient, onChange: (e) => setSelectedClient(e.target.value), sx: { minWidth: 200 }, size: "small", children: clientsList.map((client) => (_jsx(MenuItem, { value: client, children: client }, client))) }), _jsx(Button, { variant: "contained", onClick: () => fileInputRef.current?.click(), disabled: uploading, children: file ? `Fichier: ${file.name}` : "Choisir un fichier" }), _jsx("input", { type: "file", hidden: true, ref: fileInputRef, onChange: handleFileChange, accept: ".pdf,.doc,.docx,.png,.jpg,.jpeg" }), _jsx(Button, { variant: "outlined", onClick: handleUploadClick, disabled: !file || uploading, children: uploading ? "Téléversement..." : "Téléverser" })] }), _jsxs(Box, { onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, sx: {
                    border: `2px dashed ${dragActive ? "primary.main" : "grey.400"}`,
                    borderRadius: 2,
                    p: 4,
                    textAlign: "center",
                    cursor: "pointer",
                    bgcolor: dragActive ? "primary.light" : "transparent",
                    transition: "background-color 0.3s ease",
                }, children: [_jsx(Typography, { variant: "body1", color: dragActive ? "primary.main" : "text.secondary", children: dragActive ? "Déposez le fichier ici..." : "Glissez-déposez un fichier pour téléverser" }), _jsx(Typography, { variant: "caption", color: "text.secondary", mt: 1, children: "Formats accept\u00E9s: PDF, DOC, DOCX, PNG, JPG. Taille max: 10 Mo." })] }), uploading && _jsx(LinearProgress, { variant: "determinate", value: progress, sx: { mt: 2 } })] }));
};
export default UploadZone;

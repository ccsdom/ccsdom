import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Paper, Typography } from "@mui/material";
const DropzoneArea = ({ onFilesSelected }) => {
    const onDrop = useCallback((acceptedFiles) => {
        onFilesSelected(acceptedFiles);
    }, [onFilesSelected]);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
    return (_jsxs(Paper, { ...getRootProps(), sx: {
            p: 4,
            textAlign: "center",
            border: "2px dashed #888",
            backgroundColor: isDragActive ? "#eee" : "#fafafa",
            cursor: "pointer",
            mb: 3,
        }, children: [_jsx("input", { ...getInputProps() }), _jsx(Typography, { variant: "body1", children: isDragActive
                    ? "Déposez les fichiers ici..."
                    : "Glissez-déposez des fichiers ici, ou cliquez pour sélectionner" })] }));
};
export default DropzoneArea;

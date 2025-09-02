import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog, Box, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
const DocumentPreview = ({ open, url, onClose }) => {
    if (!url)
        return null;
    const isPdf = url.endsWith(".pdf");
    return (_jsx(Dialog, { open: open, onClose: onClose, maxWidth: "lg", fullWidth: true, children: _jsxs(Box, { position: "relative", sx: { height: "80vh" }, children: [_jsx(IconButton, { onClick: onClose, sx: { position: "absolute", top: 8, right: 8, zIndex: 10, color: "white" }, "aria-label": "Fermer l'aper\u00E7u", children: _jsx(Close, {}) }), isPdf ? (_jsx("object", { data: url, type: "application/pdf", width: "100%", height: "100%", "aria-label": "Aper\u00E7u PDF" })) : (_jsx("img", { src: url, alt: "Aper\u00E7u du document", style: { width: "100%", height: "100%", objectFit: "contain" } }))] }) }));
};
export default DocumentPreview;

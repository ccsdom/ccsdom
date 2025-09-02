import { jsx as _jsx } from "react/jsx-runtime";
import { Typography, Box } from "@mui/material";
const DocumentsAccessControl = ({ accessible }) => (_jsx(Box, { sx: { mt: 3 }, children: _jsx(Typography, { sx: { color: accessible ? "success.main" : "error.main" }, children: accessible
            ? "Vos documents sont accessibles."
            : "Vos documents sont bloqués jusqu'au règlement de la facture." }) }));
export default DocumentsAccessControl;

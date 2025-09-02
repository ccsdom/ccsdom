import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Stack, Tooltip, Avatar } from "@mui/material";
const LetterAvatar = () => {
    return (_jsxs(Stack, { direction: "row", spacing: 2, justifyContent: "center", children: [_jsx(Tooltip, { title: "Default", children: _jsx(Avatar, { children: "A" }) }), _jsx(Tooltip, { title: "Primary", children: _jsx(Avatar, { sx: { bgcolor: "primary.main" }, children: "B" }) }), _jsx(Tooltip, { title: "Warning", children: _jsx(Avatar, { sx: { bgcolor: "warning.main" }, children: "C" }) }), _jsx(Tooltip, { title: "Success", children: _jsx(Avatar, { sx: { bgcolor: "success.main" }, children: "D" }) }), _jsx(Tooltip, { title: "Error", children: _jsx(Avatar, { sx: { bgcolor: "error.main" }, children: "E" }) }), _jsx(Tooltip, { title: "Info", children: _jsx(Avatar, { sx: { bgcolor: "info.main" }, children: "E" }) })] }));
};
export default LetterAvatar;

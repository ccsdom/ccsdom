import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Stack, Tooltip, Avatar } from "@mui/material";
import { Folder } from "@mui/icons-material";
const IconAvatar = () => {
    return (_jsxs(Stack, { direction: "row", spacing: 2, justifyContent: "center", children: [_jsx(Tooltip, { title: "Default", children: _jsx(Avatar, { children: _jsx(Folder, {}) }) }), _jsx(Tooltip, { title: "Primary", children: _jsx(Avatar, { sx: { bgcolor: "primary.main" }, children: _jsx(Folder, {}) }) }), _jsx(Tooltip, { title: "Warning", children: _jsx(Avatar, { sx: { bgcolor: "warning.main" }, children: _jsx(Folder, {}) }) }), _jsx(Tooltip, { title: "Success", children: _jsx(Avatar, { sx: { bgcolor: "success.main" }, children: _jsx(Folder, {}) }) }), _jsx(Tooltip, { title: "Error", children: _jsx(Avatar, { sx: { bgcolor: "error.main" }, children: _jsx(Folder, {}) }) }), _jsx(Tooltip, { title: "Info", children: _jsx(Avatar, { sx: { bgcolor: "info.main" }, children: _jsx(Folder, {}) }) })] }));
};
export default IconAvatar;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Stack, Tooltip, Avatar } from "@mui/material";
import { Folder } from "@mui/icons-material";
const AvatarVariants = () => {
    return (_jsxs(Stack, { direction: "row", spacing: 2, justifyContent: "center", children: [_jsx(Tooltip, { title: "Circular", children: _jsx(Avatar, { variant: "circular", children: _jsx(Folder, {}) }) }), _jsx(Tooltip, { title: "Bordered", children: _jsx(Avatar, { variant: "bordered", src: "/static/user/avatar.png" }) }), _jsx(Tooltip, { title: "Square", children: _jsx(Avatar, { variant: "square", children: _jsx(Folder, {}) }) }), _jsx(Tooltip, { title: "Rounded", children: _jsx(Avatar, { variant: "rounded", children: _jsx(Folder, {}) }) })] }));
};
export default AvatarVariants;

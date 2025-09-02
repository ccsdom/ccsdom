import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Cloud, ContentCopy, ContentCut, ContentPaste, MoreVert, } from "@mui/icons-material";
import { List, Grid, Menu, Button, Divider, MenuItem, MenuList, IconButton, ListItemText, ListItemIcon, ListItemButton, } from "@mui/material";
// CUSTOM COMPONENTS
import { Block } from "@/components/block";
import { Scrollbar } from "@/components/scrollbar";
import { Paragraph } from "@/components/typography";
import ComponentPageLayout from "../../ComponentPageLayout";
const options = [
    "Show some love to MUI",
    "Show all notification content",
    "Hide sensitive notification content",
    "Hide all notification content",
];
const options2 = [
    "None",
    "Atria",
    "Callisto",
    "Dione",
    "Ganymede",
    "Hangouts Call",
    "Luna",
    "Oberon",
    "Phobos",
    "Pyxis",
    "Sedna",
    "Titania",
    "Triton",
    "Umbriel",
];
const MuiMenuPageView = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const handleClose = () => setAnchorEl(null);
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    // icon menu list
    const [iconMenuEl, setIconMenuEl] = useState(null);
    const handleIconMenuClose = () => setIconMenuEl(null);
    const handleIconMenuClick = (event) => setIconMenuEl(event.currentTarget);
    // selected menu
    const [selectedIndex, setSelectedIndex] = useState(1);
    const [selectedMenuEl, setSelectedMenuEl] = useState(null);
    const handleSelectedMenuClose = () => setSelectedMenuEl(null);
    const handleClickListItem = (event) => {
        setSelectedMenuEl(event.currentTarget);
    };
    const handleMenuItemClick = (index) => {
        setSelectedIndex(index);
        setSelectedMenuEl(null);
    };
    // max height menu
    const [maxMenuEl, setMaxMenuEl] = useState(null);
    const handleMaxMenuClose = () => setMaxMenuEl(null);
    const handleMaxMenuClick = (event) => {
        setMaxMenuEl(event.currentTarget);
    };
    return (_jsx(ComponentPageLayout, { title: "Menu", children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, md: 4, sm: 6, xs: 12, children: _jsxs(Block, { title: "Basic", children: [_jsx(Button, { variant: "text", id: "basic-button", onClick: handleClick, children: "Dashboard" }), _jsxs(Menu, { id: "basic-menu", anchorEl: anchorEl, onClose: handleClose, open: Boolean(anchorEl), children: [_jsx(MenuItem, { onClick: handleClose, children: "Profile" }), _jsx(MenuItem, { onClick: handleClose, children: "My account" }), _jsx(MenuItem, { onClick: handleClose, children: "Logout" })] })] }) }), _jsx(Grid, { item: true, md: 4, sm: 6, xs: 12, children: _jsxs(Block, { title: "Icon Menu", children: [_jsx(Button, { variant: "text", id: "icon-button", onClick: handleIconMenuClick, children: "Dashboard" }), _jsx(Menu, { id: "icon-menu", anchorEl: iconMenuEl, open: Boolean(iconMenuEl), onClose: handleIconMenuClose, children: _jsxs(MenuList, { disablePadding: true, disableListWrap: true, children: [_jsxs(MenuItem, { children: [_jsx(ListItemIcon, { children: _jsx(ContentCut, { fontSize: "small" }) }), _jsx(ListItemText, { children: "Cut" }), _jsx(Paragraph, { color: "text.secondary", children: "\u2318X" })] }), _jsxs(MenuItem, { children: [_jsx(ListItemIcon, { children: _jsx(ContentCopy, { fontSize: "small" }) }), _jsx(ListItemText, { children: "Copy" }), _jsx(Paragraph, { color: "text.secondary", children: "\u2318C" })] }), _jsxs(MenuItem, { children: [_jsx(ListItemIcon, { children: _jsx(ContentPaste, { fontSize: "small" }) }), _jsx(ListItemText, { children: "Paste" }), _jsx(Paragraph, { color: "text.secondary", children: "\u2318V" })] }), _jsx(Divider, {}), _jsxs(MenuItem, { children: [_jsx(ListItemIcon, { children: _jsx(Cloud, { fontSize: "small" }) }), _jsx(ListItemText, { children: "Web Clipboard" })] })] }) })] }) }), _jsx(Grid, { item: true, md: 4, sm: 6, xs: 12, children: _jsxs(Block, { title: "Selected Menu", children: [_jsx(List, { component: "nav", "aria-label": "Device settings", children: _jsx(ListItemButton, { onClick: handleClickListItem, children: _jsx(ListItemText, { primary: "When device is locked", secondary: options[selectedIndex] }) }) }), _jsx(Menu, { id: "lock-menu", anchorEl: selectedMenuEl, open: Boolean(selectedMenuEl), onClose: handleSelectedMenuClose, children: options.map((option, index) => (_jsx(MenuItem, { disabled: index === 0, selected: index === selectedIndex, onClick: () => handleMenuItemClick(index), children: option }, option))) })] }) }), _jsx(Grid, { item: true, md: 4, sm: 6, xs: 12, children: _jsxs(Block, { title: "Max Height", children: [_jsx(IconButton, { onClick: handleMaxMenuClick, children: _jsx(MoreVert, {}) }), _jsx(Menu, { anchorEl: maxMenuEl, open: Boolean(maxMenuEl), onClose: handleMaxMenuClose, children: _jsx(Scrollbar, { sx: { maxHeight: 200, width: "20ch" }, children: options2.map((option) => (_jsx(MenuItem, { selected: option === "Pyxis", onClick: handleMaxMenuClose, children: option }, option))) }) })] }) })] }) }));
};
export default MuiMenuPageView;

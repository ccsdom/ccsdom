import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Send, Work, Image, Inbox, Drafts, Comment, StarBorder, ExpandLess, ExpandMore, BeachAccess, } from "@mui/icons-material";
import { List, Grid, Avatar, Divider, ListItem, Collapse, Checkbox, IconButton, ListItemIcon, ListItemText, ListItemButton, ListItemAvatar, } from "@mui/material";
// CUSTOM COMPONENTS
import ComponentPageLayout from "../../ComponentPageLayout";
import { Block } from "@/components/block";
const MuiListPageView = () => {
    const [open, setOpen] = useState(true);
    const handleClick = () => setOpen(!open);
    // selected list
    const [selectedIndex, setSelectedIndex] = useState(1);
    const handleListItemClick = (_, index) => setSelectedIndex(index);
    // list control
    const [checked, setChecked] = useState([0]);
    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];
        if (currentIndex === -1)
            newChecked.push(value);
        else
            newChecked.splice(currentIndex, 1);
        setChecked(newChecked);
    };
    return (_jsx(ComponentPageLayout, { title: "List", children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(Block, { title: "Basic", children: _jsxs(List, { children: [_jsx(ListItem, { disablePadding: true, children: _jsxs(ListItemButton, { children: [_jsx(ListItemIcon, { children: _jsx(Inbox, {}) }), _jsx(ListItemText, { primary: "Inbox" })] }) }), _jsx(ListItem, { disablePadding: true, children: _jsxs(ListItemButton, { children: [_jsx(ListItemIcon, { children: _jsx(Drafts, {}) }), _jsx(ListItemText, { primary: "Drafts" })] }) }), _jsx(Divider, { sx: { my: 1 } }), _jsx(ListItem, { disablePadding: true, children: _jsx(ListItemButton, { children: _jsx(ListItemText, { primary: "Trash" }) }) }), _jsx(ListItem, { disablePadding: true, children: _jsx(ListItemButton, { component: "a", href: "#simple-list", children: _jsx(ListItemText, { primary: "Spam" }) }) })] }) }) }), _jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(Block, { title: "Nested List", children: _jsxs(List, { component: "nav", children: [_jsxs(ListItemButton, { children: [_jsx(ListItemIcon, { children: _jsx(Send, {}) }), _jsx(ListItemText, { primary: "Sent mail" })] }), _jsxs(ListItemButton, { children: [_jsx(ListItemIcon, { children: _jsx(Drafts, {}) }), _jsx(ListItemText, { primary: "Drafts" })] }), _jsxs(ListItemButton, { onClick: handleClick, children: [_jsx(ListItemIcon, { children: _jsx(Inbox, {}) }), _jsx(ListItemText, { primary: "Inbox" }), open ? _jsx(ExpandLess, {}) : _jsx(ExpandMore, {})] }), _jsx(Collapse, { in: open, timeout: "auto", unmountOnExit: true, children: _jsx(List, { component: "div", disablePadding: true, children: _jsxs(ListItemButton, { sx: { pl: 4 }, children: [_jsx(ListItemIcon, { children: _jsx(StarBorder, {}) }), _jsx(ListItemText, { primary: "Starred" })] }) }) })] }) }) }), _jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(Block, { title: "Folder List", children: _jsxs(List, { children: [_jsxs(ListItem, { children: [_jsx(ListItemAvatar, { children: _jsx(Avatar, { children: _jsx(Image, {}) }) }), _jsx(ListItemText, { primary: "Photos", secondary: "Jan 9, 2014" })] }), _jsxs(ListItem, { children: [_jsx(ListItemAvatar, { children: _jsx(Avatar, { children: _jsx(Work, {}) }) }), _jsx(ListItemText, { primary: "Work", secondary: "Jan 7, 2014" })] }), _jsxs(ListItem, { children: [_jsx(ListItemAvatar, { children: _jsx(Avatar, { children: _jsx(BeachAccess, {}) }) }), _jsx(ListItemText, { primary: "Vacation", secondary: "July 20, 2014" })] })] }) }) }), _jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(Block, { title: "Selected List", children: _jsxs(List, { component: "nav", children: [_jsxs(ListItemButton, { selected: selectedIndex === 0, onClick: (event) => handleListItemClick(event, 0), children: [_jsx(ListItemIcon, { children: _jsx(Inbox, {}) }), _jsx(ListItemText, { primary: "Inbox" })] }), _jsxs(ListItemButton, { selected: selectedIndex === 1, onClick: (event) => handleListItemClick(event, 1), children: [_jsx(ListItemIcon, { children: _jsx(Drafts, {}) }), _jsx(ListItemText, { primary: "Drafts" })] }), _jsx(Divider, { sx: { my: 1 } }), _jsx(ListItemButton, { selected: selectedIndex === 2, onClick: (event) => handleListItemClick(event, 2), children: _jsx(ListItemText, { primary: "Trash" }) }), _jsx(ListItemButton, { selected: selectedIndex === 3, onClick: (event) => handleListItemClick(event, 3), children: _jsx(ListItemText, { primary: "Spam" }) })] }) }) }), _jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(Block, { title: "List Controls", children: _jsx(List, { children: [0, 1, 2, 3].map((value) => (_jsx(ListItem, { disablePadding: true, secondaryAction: _jsx(IconButton, { edge: "end", children: _jsx(Comment, {}) }), children: _jsxs(ListItemButton, { role: undefined, onClick: handleToggle(value), dense: true, children: [_jsx(ListItemIcon, { children: _jsx(Checkbox, { edge: "start", tabIndex: -1, disableRipple: true, checked: checked.indexOf(value) !== -1 }) }), _jsx(ListItemText, { primary: `Line item ${value + 1}` })] }) }, value))) }) }) })] }) }));
};
export default MuiListPageView;

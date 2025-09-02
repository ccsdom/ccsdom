import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, useState } from "react";
import { Add, Close, Person } from "@mui/icons-material";
import { Box, List, Grid, Slide, Button, Dialog, Avatar, AppBar, Select, Switch, Divider, Toolbar, ListItem, MenuItem, TextField, InputLabel, IconButton, DialogTitle, FormControl, ListItemText, DialogContent, DialogActions, ListItemAvatar, ListItemButton, FormControlLabel, DialogContentText, } from "@mui/material";
import { H6 } from "@/components/typography";
// CUSTOM COMPONENTS
import ComponentPageLayout from "../../ComponentPageLayout";
import { Block } from "@/components/block";
const SlideUp = forwardRef((props, ref) => (_jsx(Slide, { direction: "up", ref: ref, ...props })));
const emails = ["username@gmail.com", "user02@gmail.com"];
const MuiDialogPageView = () => {
    // basic dialog
    const [openBasicDialog, setOpenBasicDialog] = useState(false);
    const handleOpenBasicDialog = () => setOpenBasicDialog(true);
    const handleCloseBasicDialog = () => setOpenBasicDialog(false);
    // alert dialog
    const [openAlertDialog, setOpenAlertDialog] = useState(false);
    const handleOpenAlertDialog = () => setOpenAlertDialog(true);
    const handleCloseAlertDialog = () => setOpenAlertDialog(false);
    // transition dialog
    const [openTransitionDialog, setOpenTransitionDialog] = useState(false);
    const handleOpenTransitionDialog = () => setOpenTransitionDialog(true);
    const handleCloseTransitionDialog = () => setOpenTransitionDialog(false);
    // form dialog
    const [openFromDialog, setOpenFromDialog] = useState(false);
    const handleOpenFromDialog = () => setOpenFromDialog(true);
    const handleCloseFromDialog = () => setOpenFromDialog(false);
    // full-screen dialog
    const [openFullScreenDialog, setOpenFullScreenDialog] = useState(false);
    const handleOpenFullScreenDialog = () => setOpenFullScreenDialog(true);
    const handleCloseFullScreenDialog = () => setOpenFullScreenDialog(false);
    // max width dialog
    const [fullWidth, setFullWidth] = useState(true);
    const [openMaxWidthDialog, setOpenMaxWidthDialog] = useState(false);
    const [maxWidth, setMaxWidth] = useState("sm");
    const handleCloseMaxWidthDialog = () => setOpenMaxWidthDialog(false);
    const handleOpenMaxWidthDialog = () => setOpenMaxWidthDialog(true);
    const handleMaxWidthChange = (event) => {
        setMaxWidth(event.target.value);
    };
    const handleFullWidthChange = (event) => {
        setFullWidth(event.target.checked);
    };
    return (_jsx(ComponentPageLayout, { title: "Dialog", children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, md: 4, xs: 12, children: _jsxs(Block, { title: "Basic", children: [_jsx(Button, { fullWidth: true, variant: "outlined", onClick: handleOpenBasicDialog, children: "Open simple dialog" }), _jsxs(Dialog, { onClose: handleCloseBasicDialog, open: openBasicDialog, children: [_jsx(DialogTitle, { children: "Set backup account" }), _jsxs(List, { sx: { pt: 0 }, children: [emails.map((email) => (_jsx(ListItem, { disablePadding: true, disableGutters: true, children: _jsxs(ListItemButton, { onClick: handleCloseBasicDialog, children: [_jsx(ListItemAvatar, { children: _jsx(Avatar, { children: _jsx(Person, {}) }) }), _jsx(ListItemText, { primary: email })] }) }, email))), _jsx(ListItem, { disablePadding: true, disableGutters: true, children: _jsxs(ListItemButton, { autoFocus: true, onClick: handleCloseBasicDialog, children: [_jsx(ListItemAvatar, { children: _jsx(Avatar, { children: _jsx(Add, {}) }) }), _jsx(ListItemText, { primary: "Add account" })] }) })] })] })] }) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsxs(Block, { title: "Alert", children: [_jsx(Button, { fullWidth: true, onClick: handleOpenAlertDialog, children: "Open alert dialog" }), _jsxs(Dialog, { onClose: handleCloseAlertDialog, open: openAlertDialog, children: [_jsx(DialogTitle, { children: "Use Google's location service?" }), _jsx(DialogContent, { children: _jsx(DialogContentText, { children: "Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running." }) }), _jsxs(DialogActions, { children: [_jsx(Button, { color: "warning", onClick: handleCloseAlertDialog, children: "Disagree" }), _jsx(Button, { onClick: handleCloseAlertDialog, autoFocus: true, children: "Agree" })] })] })] }) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsxs(Block, { title: "Transitions", children: [_jsx(Button, { fullWidth: true, variant: "text", onClick: handleOpenTransitionDialog, children: "Slide in alert dialog" }), _jsxs(Dialog, { keepMounted: true, open: openTransitionDialog, TransitionComponent: SlideUp, onClose: handleCloseTransitionDialog, children: [_jsx(DialogTitle, { children: "Use Google's location service?" }), _jsx(DialogContent, { children: _jsx(DialogContentText, { children: "Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running." }) }), _jsxs(DialogActions, { children: [_jsx(Button, { color: "warning", onClick: handleCloseTransitionDialog, children: "Disagree" }), _jsx(Button, { onClick: handleCloseTransitionDialog, autoFocus: true, children: "Agree" })] })] })] }) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsxs(Block, { title: "Form", children: [_jsx(Button, { fullWidth: true, variant: "text", onClick: handleOpenFromDialog, children: "Open form dialog" }), _jsxs(Dialog, { open: openFromDialog, onClose: handleCloseFromDialog, children: [_jsx(DialogTitle, { children: "Subscribe" }), _jsxs(DialogContent, { children: [_jsx(DialogContentText, { mb: 1.5, children: "To subscribe to this website, please enter your email address here. We will send updates occasionally." }), _jsx(TextField, { fullWidth: true, autoFocus: true, id: "name", type: "email", margin: "dense", label: "Email Address" })] }), _jsxs(DialogActions, { children: [_jsx(Button, { color: "secondary", onClick: handleCloseFromDialog, children: "Cancel" }), _jsx(Button, { onClick: handleCloseFromDialog, children: "Subscribe" })] })] })] }) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsxs(Block, { title: "Full-screen", children: [_jsx(Button, { fullWidth: true, variant: "outlined", onClick: handleOpenFullScreenDialog, children: "Open full-screen dialog" }), _jsxs(Dialog, { fullScreen: true, open: openFullScreenDialog, TransitionComponent: SlideUp, onClose: handleCloseFullScreenDialog, children: [_jsx(AppBar, { sx: { position: "relative" }, children: _jsxs(Toolbar, { children: [_jsx(IconButton, { edge: "start", color: "inherit", onClick: handleCloseFullScreenDialog, children: _jsx(Close, {}) }), _jsx(H6, { flex: 1, children: "Sound" }), _jsx(Button, { color: "inherit", variant: "text", onClick: handleCloseFullScreenDialog, children: "Save" })] }) }), _jsxs(List, { children: [_jsx(ListItem, { children: _jsx(ListItemText, { primary: "Phone ringtone", secondary: "Titania" }) }), _jsx(Divider, {}), _jsx(ListItem, { children: _jsx(ListItemText, { primary: "Default notification ringtone", secondary: "Tethys" }) })] })] })] }) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsxs(Block, { title: "Optional sizes", children: [_jsx(Button, { fullWidth: true, onClick: handleOpenMaxWidthDialog, children: "Open max-width dialog" }), _jsxs(Dialog, { maxWidth: maxWidth, fullWidth: fullWidth, open: openMaxWidthDialog, onClose: handleCloseMaxWidthDialog, children: [_jsx(DialogTitle, { children: "Optional sizes" }), _jsxs(DialogContent, { children: [_jsx(DialogContentText, { children: "You can set my maximum width and whether to adapt or not." }), _jsxs(Box, { noValidate: true, component: "form", sx: {
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    m: "auto",
                                                    width: "fit-content",
                                                }, children: [_jsxs(FormControl, { sx: { my: 2, minWidth: 120 }, children: [_jsx(InputLabel, { htmlFor: "max-width", children: "maxWidth" }), _jsxs(Select, { autoFocus: true, label: "maxWidth", value: maxWidth, onChange: handleMaxWidthChange, inputProps: { name: "max-width", id: "max-width" }, children: [_jsx(MenuItem, { value: false, children: "false" }), _jsx(MenuItem, { value: "xs", children: "xs" }), _jsx(MenuItem, { value: "sm", children: "sm" }), _jsx(MenuItem, { value: "md", children: "md" }), _jsx(MenuItem, { value: "lg", children: "lg" }), _jsx(MenuItem, { value: "xl", children: "xl" })] })] }), _jsx(FormControlLabel, { label: "Full width", control: _jsx(Switch, { checked: fullWidth, onChange: handleFullWidthChange }) })] })] }), _jsx(DialogActions, { children: _jsx(Button, { onClick: handleCloseMaxWidthDialog, children: "Close" }) })] })] }) })] }) }));
};
export default MuiDialogPageView;

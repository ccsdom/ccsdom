import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Grid, Stack, Button, Snackbar, IconButton, Box, } from "@mui/material";
import Close from "@mui/icons-material/Close";
// CUSTOM COMPONENTS
import ComponentPageLayout from "../../ComponentPageLayout";
import { Block } from "@/components/block";
const MuiSnackbarPageView = () => {
    const [open, setOpen] = useState({
        1: false,
        2: false,
    });
    const handleClick = (num) => () => {
        setOpen((state) => ({ ...state, [num]: true }));
    };
    const handleClose = (num) => (_, reason) => {
        if (reason === "clickaway")
            return;
        setOpen((state) => ({ ...state, [num]: false }));
    };
    const [state, setState] = useState({
        open: false,
        vertical: "top",
        horizontal: "center",
    });
    const handleChange = (newState) => () => {
        setState({ ...newState, open: true });
    };
    const handleCloseSnackbar = () => {
        setState({ ...state, open: false });
    };
    return (_jsx(ComponentPageLayout, { title: "Snackbar", children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, lg: 6, xs: 12, children: _jsx(Block, { title: "Simple", children: _jsxs(Stack, { direction: "row", alignItems: "center", justifyContent: "center", spacing: 3, children: [_jsx(Button, { onClick: handleClick(1), children: "Simple Snackbar" }), _jsx(Snackbar, { open: open[1], onClose: handleClose(1), autoHideDuration: 2000, message: "This is Essence Snackbar" })] }) }) }), _jsx(Grid, { item: true, lg: 6, xs: 12, children: _jsx(Block, { title: "With Action", children: _jsxs(Stack, { direction: "row", alignItems: "center", justifyContent: "center", spacing: 3, children: [_jsx(Button, { onClick: handleClick(2), children: "With Action Snackbar" }), _jsx(Snackbar, { open: open[2], onClose: handleClose(2), autoHideDuration: 2000, message: "This is Essence Snackbar", action: _jsx(IconButton, { size: "small", color: "inherit", onClick: handleClose(2), children: _jsx(Close, { fontSize: "small" }) }) })] }) }) }), _jsx(Grid, { item: true, lg: 6, xs: 12, children: _jsxs(Block, { title: "Positioned Snackbar", children: [_jsxs("div", { children: [_jsx(Box, { display: "flex", justifyContent: "center", children: _jsx(Button, { onClick: handleChange({
                                                vertical: "top",
                                                horizontal: "center",
                                            }), children: "Top-Center" }) }), _jsxs(Grid, { container: true, justifyContent: "center", spacing: 2, children: [_jsx(Grid, { item: true, xs: 6, children: _jsx(Button, { onClick: handleChange({
                                                        vertical: "top",
                                                        horizontal: "left",
                                                    }), children: "Top-Left" }) }), _jsx(Grid, { item: true, xs: 6, textAlign: "right", children: _jsx(Button, { onClick: handleChange({
                                                        vertical: "top",
                                                        horizontal: "right",
                                                    }), children: "Top-Right" }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(Button, { onClick: handleChange({
                                                        vertical: "bottom",
                                                        horizontal: "left",
                                                    }), children: "Bottom-Left" }) }), _jsx(Grid, { item: true, xs: 6, textAlign: "right", children: _jsx(Button, { onClick: handleChange({
                                                        vertical: "bottom",
                                                        horizontal: "right",
                                                    }), children: "Bottom-Right" }) })] }), _jsx(Box, { display: "flex", justifyContent: "center", children: _jsx(Button, { onClick: handleChange({
                                                vertical: "bottom",
                                                horizontal: "center",
                                            }), children: "Bottom-Center" }) })] }), _jsx(Snackbar, { anchorOrigin: {
                                    vertical: state.vertical,
                                    horizontal: state.horizontal,
                                }, open: state.open, onClose: handleCloseSnackbar, message: "This is Essence Snackbar" }, state.vertical + state.horizontal)] }) })] }) }));
};
export default MuiSnackbarPageView;

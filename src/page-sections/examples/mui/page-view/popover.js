import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Fade, Grid, Grow, Zoom, Stack, Button, Popover, } from "@mui/material";
import { useState } from "react";
// CUSTOM COMPONENTS
import { Block } from "@/components/block";
import { FlexBox } from "@/components/flexbox";
import { H6, Paragraph } from "@/components/typography";
import ComponentPageLayout from "../../ComponentPageLayout";
const MuiPopoverPageView = () => {
    const [basicEl, setBasicEl] = useState(null);
    const handleBasicClose = () => setBasicEl(null);
    const handleBasicClick = (event) => {
        setBasicEl(event.currentTarget);
    };
    const [hoverEl, setHoverEl] = useState(null);
    const handleHoverClose = () => setHoverEl(null);
    const handleHover = (e) => setHoverEl(e.currentTarget);
    const [transitionEl, setTransitionEl] = useState(null);
    const [trans, setTrans] = useState("z");
    const handleTransClose = () => setTransitionEl(null);
    const handleTransClick = (val) => (event) => {
        setTransitionEl(event.currentTarget);
        setTrans(val);
    };
    return (_jsx(ComponentPageLayout, { title: "Popover", children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, lg: 6, xs: 12, children: _jsx(Block, { title: "Basic", children: _jsxs(Stack, { justifyContent: "center", alignItems: "center", children: [_jsx(Button, { variant: "contained", onClick: handleBasicClick, children: "Open Popover" }), _jsx(Popover, { anchorEl: basicEl, open: Boolean(basicEl), onClose: handleBasicClose, anchorOrigin: { vertical: "bottom", horizontal: "left" }, children: _jsxs(Box, { p: 3, maxWidth: 400, children: [_jsx(H6, { fontSize: 18, children: "The content of the Popover." }), _jsx(Paragraph, { mt: 1, children: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quisquam odio fugit suscipit iste est beatae vero quia hic explicabo mollitia?" })] }) })] }) }) }), _jsx(Grid, { item: true, lg: 6, xs: 12, children: _jsx(Block, { title: "Mouse over interaction", children: _jsxs(Stack, { justifyContent: "center", alignItems: "center", children: [_jsx(Paragraph, { color: "primary.main", fontWeight: 600, onMouseEnter: handleHover, onMouseLeave: handleHoverClose, children: "Hover with a Popover" }), _jsx(Popover, { disableRestoreFocus: true, anchorEl: hoverEl, open: Boolean(hoverEl), onClose: handleHoverClose, anchorOrigin: { vertical: "bottom", horizontal: "left" }, transformOrigin: { vertical: "top", horizontal: "left" }, sx: { pointerEvents: "none" }, children: _jsxs(Box, { p: 3, maxWidth: 400, children: [_jsx(H6, { fontSize: 18, children: "The content of the Popover." }), _jsx(Paragraph, { mt: 1, children: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quisquam odio fugit suscipit iste est beatae vero quia hic explicabo mollitia?" })] }) })] }) }) }), _jsx(Grid, { item: true, lg: 6, xs: 12, children: _jsx(Block, { title: "Transition", children: _jsxs(Stack, { justifyContent: "center", alignItems: "center", children: [_jsxs(FlexBox, { gap: 3, children: [_jsx(Button, { variant: "contained", onClick: handleTransClick("z"), children: "Zoom" }), _jsx(Button, { variant: "contained", onClick: handleTransClick("f"), children: "Fade" })] }), _jsx(Popover, { anchorEl: transitionEl, open: Boolean(transitionEl), onClose: handleTransClose, anchorOrigin: { vertical: "bottom", horizontal: "left" }, TransitionComponent: trans === "z" ? Zoom : trans === "f" ? Fade : Grow, children: _jsxs(Box, { p: 3, maxWidth: 400, children: [_jsx(H6, { fontSize: 18, children: "The content of the Popover." }), _jsx(Paragraph, { mt: 1, children: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quisquam odio fugit suscipit iste est beatae vero quia hic explicabo mollitia?" })] }) })] }) }) })] }) }));
};
export default MuiPopoverPageView;

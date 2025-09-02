import { jsx as _jsx } from "react/jsx-runtime";
import { Drawer, styled } from "@mui/material";
// styled component
const Wrapper = styled("div")(({ theme }) => ({
    height: "100%",
    width: "inherit",
    position: "fixed",
    overflow: "hidden",
    boxShadow: theme.shadows[1],
    zIndex: theme.zIndex.drawer + 3,
    backgroundColor: theme.palette.background.paper,
}));
// ================================================================
const LayoutDrawer = (props) => {
    const { children, open, onClose, drawerWidth = 280 } = props;
    return (_jsx(Drawer, { anchor: "left", open: open, onClose: onClose, PaperProps: { sx: { width: drawerWidth } }, children: _jsx(Wrapper, { children: children }) }));
};
export default LayoutDrawer;

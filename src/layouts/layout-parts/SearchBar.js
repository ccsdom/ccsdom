import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, InputAdornment, InputBase, Slide, styled, } from "@mui/material";
// CUSTOM ICON COMPONENT
import SearchIcon from "@/icons/SearchIcon";
// STYLED COMPONENT
const RootStyle = styled("div")(({ theme }) => ({
    gap: 16,
    left: 0,
    top: -16,
    height: 60,
    zIndex: 9999,
    width: "100%",
    display: "flex",
    padding: "0 1rem",
    borderRadius: "4px",
    alignItems: "center",
    position: "absolute",
    boxShadow: theme.shadows[1],
    backgroundColor: theme.palette.background.paper,
}));
// --------------------------------------------------------
const SearchBar = ({ open, handleClose }) => {
    // SEARCH ICON IN INPUT BOX
    const INPUT_ADORNMENT = (_jsx(InputAdornment, { position: "start", children: _jsx(SearchIcon, { sx: { color: "grey.400" } }) }));
    return (_jsx(Slide, { direction: "down", in: open, mountOnEnter: true, unmountOnExit: true, children: _jsxs(RootStyle, { children: [_jsx(InputBase, { fullWidth: true, autoFocus: true, placeholder: "Rechercher...", startAdornment: INPUT_ADORNMENT, sx: { fontSize: 13, fontWeight: 500, flexGrow: 1 } }), _jsx(Button, { variant: "contained", onClick: handleClose, children: "Rechercher" })] }) }));
};
export default SearchBar;

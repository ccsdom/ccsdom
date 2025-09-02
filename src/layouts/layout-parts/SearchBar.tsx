import { FC } from "react";
import {
  Button,
  InputAdornment,
  InputBase,
  Slide,
  styled,
} from "@mui/material";
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
type SearchBarProps = {
  open: boolean;
  handleClose: () => void;
};
// --------------------------------------------------------

const SearchBar: FC<SearchBarProps> = ({ open, handleClose }) => {
  // SEARCH ICON IN INPUT BOX
  const INPUT_ADORNMENT = (
    <InputAdornment position="start">
      <SearchIcon sx={{ color: "grey.400" }} />
    </InputAdornment>
  );

  return (
    <Slide direction="down" in={open} mountOnEnter unmountOnExit>
      <RootStyle>
        <InputBase
          fullWidth
          autoFocus
          placeholder="Rechercher..."
          startAdornment={INPUT_ADORNMENT}
          sx={{ fontSize: 13, fontWeight: 500, flexGrow: 1 }}
        />

        <Button variant="contained" onClick={handleClose}>
          Rechercher
        </Button>
      </RootStyle>
    </Slide>
  );
};

export default SearchBar;

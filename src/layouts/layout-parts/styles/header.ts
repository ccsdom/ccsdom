import { AppBar, Toolbar, styled } from "@mui/material";

export const DashboardHeaderRoot = styled(AppBar)(({ theme }) => ({
  boxShadow: "none",
  paddingTop: "1rem",
  paddingBottom: "1rem",
  backgroundImage: "none",
  backdropFilter: "blur(6px)",
  backgroundColor: "transparent",
  color: theme.palette.text.primary,
}));

export const StyledToolBar = styled(Toolbar)({
  "@media (min-width: 0px)": {
    paddingLeft: 0,
    paddingRight: 0,
    minHeight: "auto",
  },
});

import { jsx as _jsx } from "react/jsx-runtime";
import { TableCell, styled } from "@mui/material";
const StyledTableCell = styled(TableCell)({
    paddingBottom: 16,
    textTransform: "uppercase",
    ":first-of-type": { paddingLeft: 24 },
});
// ==============================================================
const HeadTableCell = ({ children, ...props }) => {
    return _jsx(StyledTableCell, { ...props, children: children });
};
export default HeadTableCell;

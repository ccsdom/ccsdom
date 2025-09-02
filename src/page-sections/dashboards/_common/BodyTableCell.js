import { jsx as _jsx } from "react/jsx-runtime";
import { TableCell, styled } from "@mui/material";
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 500,
    padding: ".75rem 0",
    borderTop: `1px dashed ${theme.palette.divider}`,
    ":first-of-type": { paddingLeft: 24 },
}));
// ==============================================================
const BodyTableCell = ({ children, ...props }) => {
    return _jsx(StyledTableCell, { ...props, children: children });
};
export default BodyTableCell;

import { FC, PropsWithChildren } from "react";
import { TableCell, TableCellProps, styled } from "@mui/material";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 500,
  padding: ".75rem 0",
  borderTop: `1px dashed ${theme.palette.divider}`,
  ":first-of-type": { paddingLeft: 24 },
}));

// ==============================================================
interface Props extends TableCellProps, PropsWithChildren {}
// ==============================================================

const BodyTableCell: FC<Props> = ({ children, ...props }) => {
  return <StyledTableCell {...props}>{children}</StyledTableCell>;
};

export default BodyTableCell;

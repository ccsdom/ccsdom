import { FC, PropsWithChildren } from "react";
import { TableCell, TableCellProps, styled } from "@mui/material";

const StyledTableCell = styled(TableCell)({
  paddingBottom: 16,
  textTransform: "uppercase",
  ":first-of-type": { paddingLeft: 24 },
});

// ==============================================================
interface Props extends TableCellProps, PropsWithChildren {}
// ==============================================================

const HeadTableCell: FC<Props> = ({ children, ...props }) => {
  return <StyledTableCell {...props}>{children}</StyledTableCell>;
};

export default HeadTableCell;

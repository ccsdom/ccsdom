import { MouseEvent, useState } from "react";
import {
  Avatar,
  Box,
  Checkbox,
  Chip,
  TableCell,
  TableRow,
} from "@mui/material";
import { DeleteOutline, Edit } from "@mui/icons-material";
import { format } from "date-fns";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
// CUSTOM COMPONENTS
import { FlexBox } from "@/components/flexbox";
import { Paragraph } from "@/components/typography";
import { TableMoreMenuItem, TableMoreMenu } from "@/components/table";

// ==============================================================
type Invoice = {
  id: string;
  date: Date;
  email: string;
  invoiceId: string;
  status: string;
  avatar: string;
  name: string;
};

interface InvoiceTableRowProps {
  invoice: Invoice;
  isSelected: boolean;
  handleDeleteInvoice: (id: string) => void;
  handleSelectRow: (_: MouseEvent, name: string) => void;
}
// ==============================================================

const InvoiceTableRow = (props: InvoiceTableRowProps) => {
  const { invoice, handleDeleteInvoice, isSelected, handleSelectRow } = props;

  const navigate = useNavigate();
  const [openMenuEl, setOpenMenuEl] = useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setOpenMenuEl(event.currentTarget);
  };

  const handleCloseOpenMenu = () => setOpenMenuEl(null);

  return (
    <TableRow hover>
      <TableCell padding="checkbox">
        <Checkbox
          size="small"
          color="primary"
          checked={isSelected}
          onClick={(event) => handleSelectRow(event, invoice.id)}
        />
      </TableCell>

      <TableCell padding="normal">
        <FlexBox alignItems="center" gap={2}>
          <Avatar src={invoice.avatar} alt={invoice.name} variant="rounded" />

          <div>
            <Paragraph
              fontWeight={500}
              color="text.primary"
              sx={{
                ":hover": { textDecoration: "underline", cursor: "pointer" },
              }}
            >
              {invoice.name}
            </Paragraph>

            <Paragraph fontSize={13}>{invoice.id.substring(0, 15)}</Paragraph>
          </div>
        </FlexBox>
      </TableCell>

      <TableCell padding="normal">{invoice.email}</TableCell>

      <TableCell padding="normal">
        <Paragraph color="text.secondary">
          {format(invoice.date, "MMM dd, yyyy")}
        </Paragraph>
      </TableCell>

      <TableCell padding="normal">
        <Chip
          size="small"
          label={invoice.status}
          color={invoice.status === "Complete" ? "success" : "error"}
        />
      </TableCell>

      <TableCell padding="normal">
        <TableMoreMenu
          open={openMenuEl}
          handleOpen={handleOpenMenu}
          handleClose={handleCloseOpenMenu}
        >
          <TableMoreMenuItem
            Icon={Edit}
            title="Edit"
            handleClick={() => {
              handleCloseOpenMenu();
              navigate("/dashboard/invoice-details");
            }}
          />
          <TableMoreMenuItem
            Icon={DeleteOutline}
            title="Delete"
            handleClick={() => {
              handleCloseOpenMenu();
              handleDeleteInvoice(invoice.id);
            }}
          />
        </TableMoreMenu>
      </TableCell>
    </TableRow>
  );
};

export default InvoiceTableRow;

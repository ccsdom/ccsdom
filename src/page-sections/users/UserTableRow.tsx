import { MouseEvent, useState } from "react";
import { Avatar, Checkbox, TableCell, TableRow } from "@mui/material";
import { DeleteOutline, Edit } from "@mui/icons-material";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
// CUSTOM COMPONENTS
import { FlexBox } from "@/components/flexbox";
import { Paragraph } from "@/components/typography";
import { TableMoreMenuItem, TableMoreMenu } from "@/components/table";

// ==============================================================
interface UserRowProps {
  user: any;
  isSelected: boolean;
  handleDeleteUser: (id: string) => void;
  handleSelectRow: (_: MouseEvent, name: string) => void;
}
// ==============================================================

const UserTableRow = (props: UserRowProps) => {
  const { user, isSelected, handleSelectRow, handleDeleteUser } = props;

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
          onClick={(event) => handleSelectRow(event, user.id)}
        />
      </TableCell>

      <TableCell padding="normal">
        <FlexBox alignItems="center" gap={2}>
          <Avatar src={user.avatar} alt={user.name} variant="rounded" />

          <div>
            <Paragraph
              fontWeight={500}
              color="text.primary"
              sx={{
                ":hover": { textDecoration: "underline", cursor: "pointer" },
              }}
            >
              {user.name}
            </Paragraph>

            <Paragraph fontSize={13}>#{user.id.substring(0, 11)}</Paragraph>
          </div>
        </FlexBox>
      </TableCell>

      <TableCell padding="normal">{user.email}</TableCell>

      <TableCell padding="normal">{user.company}</TableCell>

      <TableCell padding="normal">{user.role}</TableCell>

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
              navigate("/dashboard/add-user");
            }}
          />
          <TableMoreMenuItem
            Icon={DeleteOutline}
            title="Delete"
            handleClick={() => {
              handleCloseOpenMenu();
              handleDeleteUser(user.id);
            }}
          />
        </TableMoreMenu>
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;

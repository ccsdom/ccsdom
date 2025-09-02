import { Fragment, useRef, useState } from "react";
import { Box, styled, Avatar, Divider, ButtonBase } from "@mui/material";
import PopoverLayout from "./PopoverLayout";
import { FlexBox } from "@/components/flexbox";
import { AvatarLoading } from "@/components/avatar-loading";
import { H6, Paragraph, Small } from "@/components/typography";
import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom"; // si tu utilises react-router

import { isDark } from "@/utils/constants";

const StyledButtonBase = styled(ButtonBase)(({ theme }) => ({
  marginLeft: 8,
  borderRadius: 30,
  border: `1px solid ${theme.palette.grey[isDark(theme) ? 800 : 200]}`,
  "&:hover": { backgroundColor: theme.palette.action.hover },
}));

const StyledSmall = styled(Paragraph)(({ theme }) => ({
  fontSize: 13,
  display: "block",
  cursor: "pointer",
  padding: "5px 1rem",
  "&:hover": { backgroundColor: theme.palette.action.hover },
}));

const ProfilePopover = () => {
  const anchorRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) {
    return null; // ou loader si besoin
  }

  const handleMenuItem = (path: string) => () => {
    navigate(path);
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login"); // redirection après déconnexion
  };

  return (
    <Fragment>
      <StyledButtonBase ref={anchorRef} onClick={() => setOpen(true)}>
        <AvatarLoading
          alt={user.name || "Utilisateur"}
          percentage={60} // tu peux calculer un vrai % si tu veux
          src={user.avatar || "/static/user/user-11.png"}
          sx={{ width: 35, height: 35 }}
        />
      </StyledButtonBase>

      <PopoverLayout
        hiddenViewButton
        maxWidth={230}
        minWidth={200}
        popoverOpen={open}
        anchorRef={anchorRef}
        popoverClose={() => setOpen(false)}
        title={
          <FlexBox alignItems="center" gap={1}>
            <Avatar
              src={user.avatar || "/static/user/user-11.png"}
              sx={{ width: 35, height: 35 }}
              alt={user.name || "Utilisateur"}
            />
            <div>
              <H6 fontSize={14}>{user.name || "Utilisateur"}</H6>
              <Small color="text.secondary" display="block">
                {user.email || "email@example.com"}
              </Small>
            </div>
          </FlexBox>
        }
      >
        <Box pt={1}>
          <StyledSmall onClick={handleMenuItem("/client/profil/informations")}>
            Informations
          </StyledSmall>

          <StyledSmall onClick={handleMenuItem("/client/profil/documents")}>
            Documents
          </StyledSmall>

          <StyledSmall onClick={handleMenuItem("/client/profil/parametres")}>
            Paramètres
          </StyledSmall>

          <Divider sx={{ my: 1 }} />

          <StyledSmall onClick={handleLogout}>Déconnexion</StyledSmall>
        </Box>
      </PopoverLayout>
    </Fragment>
  );
};

export default ProfilePopover;

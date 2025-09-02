import { Box, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
// CUSTOM COMPONENTS
import { Paragraph } from "@/components/typography";
import { FlexRowAlign } from "@/components/flexbox";
import { AvatarLoading } from "@/components/avatar-loading";
import useAuth from "@/hooks/useAuth";

const UserAccount = () => {
  const { user } = useAuth();

  if (!user) {
    return null; // ou un loader
  }

  return (
    <FlexRowAlign flexDirection="column" py={5}>
      <AvatarLoading
        alt={user.name || "user"}
        src={user.avatar || "/static/user/user-11.png"}
        sx={{ width: 50, height: 50 }}
      />

      <Box textAlign="center" pt={2} pb={3}>
        <Paragraph fontSize={16} fontWeight={600} mt={2}>
          {user.name || "Utilisateur"}
        </Paragraph>
        <Paragraph
          fontSize={13}
          fontWeight={500}
          color="text.secondary"
          mt={0.5}
        >
          {user.email || "email@example.com"}
        </Paragraph>
      </Box>

      <Button
        variant="contained"
        color="primary"
        size="small"
        component={RouterLink}
        to="/dashboard/profil"
      >
        Mon compte
      </Button>
    </FlexRowAlign>
  );
};

export default UserAccount;

import { Box, styled } from "@mui/material";
import useLayout from "./context/useLayout";
import { Scrollbar } from "@/components/scrollbar";
import MultiLevelMenu from "./MultiLevelMenu";
import UserAccount from "../layout-parts/UserAccount";
import LayoutDrawer from "../layout-parts/LayoutDrawer";

import useAuth from "@/hooks/useAuth";

// Import des menus de navigation
import { adminNavigations } from "../layout-parts/navigation-admin";
import { clientNavigations } from "../layout-parts/navigation-client";

const NavWrapper = styled("div")({
  height: "100%",
  paddingLeft: 16,
  paddingRight: 16,
});

const MobileSidebar = () => {
  const { showMobileSideBar, handleCloseMobileSidebar } = useLayout();
  const { user } = useAuth();

  // Choix dynamique des menus selon rôle
  const navigations = user?.role === "admin" ? adminNavigations : clientNavigations;

  return (
    <LayoutDrawer open={showMobileSideBar} onClose={handleCloseMobileSidebar}>
      <Scrollbar autoHide clickOnTrack={false} sx={{ overflowX: "hidden", height: "100%" }}>
        <NavWrapper>
          <Box
            component="img"
            src="/static/logo/logo-svg.svg"
            alt="logo"
            maxWidth={45}
            pl={1}
            pt={3}
            sx={{ cursor: "pointer" }}
          />

          {/* Passer la prop navigations obligatoires */}
          <MultiLevelMenu sidebarCompact={false} navigations={navigations || []} />

          <UserAccount />
        </NavWrapper>
      </Scrollbar>
    </LayoutDrawer>
  );
};

export default MobileSidebar;

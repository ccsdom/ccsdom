import { FC, Fragment, ReactNode, SyntheticEvent } from "react";
import { Outlet } from "react-router-dom";
import {
  Box,
  Tab,
  Card,
  Stack,
  styled,
  IconButton,
  SvgIconProps,
} from "@mui/material";
import CameraAlt from "@mui/icons-material/CameraAlt";
import TabList from "@mui/lab/TabList";
// CUSTOM COMPONENTS
import { AvatarBadge } from "@/components/avatar-badge";
import { H6, Paragraph } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// ICON COMPONENTS
import DateRange from "@/icons/DateRange";
import Bratislava from "@/icons/Bratislava";
import MapMarkerIcon from "@/icons/MapMarkerIcon";
// CUSTOM UTILS METHOD
import { format } from "@/utils/currency";
import { AvatarLoading } from "@/components/avatar-loading";

// STYLED COMPONENTS
const ContentWrapper = styled("div")({
  zIndex: 1,
  padding: 24,
  marginTop: 55,
  position: "relative",
});

const CoverPicWrapper = styled("div")({
  top: 0,
  left: 0,
  height: 125,
  width: "100%",
  overflow: "hidden",
  position: "absolute",
});

const StyledFlexBetween = styled(FlexBetween)({
  margin: "auto",
  flexWrap: "wrap",
});

const StyledTabList = styled(TabList)(({ theme }) => ({
  borderBottom: 0,
  paddingLeft: 16,
  paddingRight: 16,
  [theme.breakpoints.up("sm")]: {
    "& .MuiTabs-flexContainer": { justifyContent: "center" },
  },
}));

// =======================================================================
type LayoutProps = {
  children: ReactNode;
  handleTabList: (_: SyntheticEvent, value: string) => void;
};
// =======================================================================

const Layout: FC<LayoutProps> = ({ children, handleTabList }) => {
  return (
    <Fragment>
      <Card sx={{ position: "relative" }}>
        <CoverPicWrapper>
          <img
            width="100%"
            height="100%"
            alt="Team Member"
            src="/static/cover/user-cover-pic.png"
            style={{ objectFit: "cover" }}
          />
        </CoverPicWrapper>

        <ContentWrapper>
          <FlexBox justifyContent="center">
            <AvatarBadge
              badgeContent={
                <label htmlFor="icon-button-file">
                  <input
                    type="file"
                    accept="image/*"
                    id="icon-button-file"
                    style={{ display: "none" }}
                  />

                  <IconButton aria-label="upload picture" component="span">
                    <CameraAlt
                      sx={{ fontSize: 16, color: "background.paper" }}
                    />
                  </IconButton>
                </label>
              }
            >
              <AvatarLoading
                alt="user"
                borderSize={2}
                percentage={60}
                src="/static/user/user-11.png"
                sx={{ width: 100, height: 100 }}
              />
            </AvatarBadge>
          </FlexBox>

          <Box mt={2}>
            <H6 fontSize={18} textAlign="center">
              Pixy Krovasky
            </H6>

            <StyledFlexBetween paddingTop={1} maxWidth={340}>
              <ListItem title="Developer" Icon={Bratislava} />
              <ListItem title="New York" Icon={MapMarkerIcon} />
              <ListItem title="Joined March 17" Icon={DateRange} />
            </StyledFlexBetween>
          </Box>

          <StyledFlexBetween paddingTop={4} maxWidth={400}>
            <BoxItem
              amount={`$${format(4550, "0,00")}`}
              title="Earnings"
              color="primary.main"
            />
            <BoxItem
              amount={format(60, "0,00")}
              title="Projects"
              color="success.600"
            />
            <BoxItem
              amount={`$${format(2800, "0,00")}`}
              title="Success Rate"
              color="warning.600"
            />
          </StyledFlexBetween>
        </ContentWrapper>

        <StyledTabList variant="scrollable" onChange={handleTabList}>
          <Tab disableRipple label="Overview" value="1" />
          <Tab disableRipple label="Projects" value="2" />
          <Tab disableRipple label="Campaigns" value="3" />
          <Tab disableRipple label="Documents" value="4" />
          <Tab disableRipple label="Connections" value="5" />
          <Tab disableRipple label="Activity" value="6" />
        </StyledTabList>
      </Card>

      {children || <Outlet />}
    </Fragment>
  );
};

export default Layout;

// ============================================================================================
type ListItemProps = {
  title: string;
  Icon: (props: SvgIconProps) => JSX.Element;
};

type BoxItemProps = {
  amount: string;
  title: string;
  color: string;
};
// ============================================================================================

function ListItem({ title, Icon }: ListItemProps) {
  return (
    <FlexBox gap={1} alignItems="center">
      <Icon sx={{ fontSize: 14, color: "text.secondary" }} />
      <Paragraph color="text.secondary">{title}</Paragraph>
    </FlexBox>
  );
}

function BoxItem({ title, amount, color }: BoxItemProps) {
  return (
    <Stack
      spacing={0.5}
      alignItems="center"
      sx={{
        borderRadius: "8px",
        border: "1px solid",
        padding: "1rem .5rem",
        borderColor: "divider",
        width: { sm: 120, xs: "100%" },
        marginBottom: { sm: 0, xs: 1 },
      }}
    >
      <H6 fontSize={16} color={color}>
        {amount}
      </H6>

      <Paragraph color="text.secondary">{title}</Paragraph>
    </Stack>
  );
}

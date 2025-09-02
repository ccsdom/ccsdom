import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment } from "react";
import { Outlet } from "react-router-dom";
import { Box, Tab, Card, Stack, styled, IconButton, } from "@mui/material";
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
const Layout = ({ children, handleTabList }) => {
    return (_jsxs(Fragment, { children: [_jsxs(Card, { sx: { position: "relative" }, children: [_jsx(CoverPicWrapper, { children: _jsx("img", { width: "100%", height: "100%", alt: "Team Member", src: "/static/cover/user-cover-pic.png", style: { objectFit: "cover" } }) }), _jsxs(ContentWrapper, { children: [_jsx(FlexBox, { justifyContent: "center", children: _jsx(AvatarBadge, { badgeContent: _jsxs("label", { htmlFor: "icon-button-file", children: [_jsx("input", { type: "file", accept: "image/*", id: "icon-button-file", style: { display: "none" } }), _jsx(IconButton, { "aria-label": "upload picture", component: "span", children: _jsx(CameraAlt, { sx: { fontSize: 16, color: "background.paper" } }) })] }), children: _jsx(AvatarLoading, { alt: "user", borderSize: 2, percentage: 60, src: "/static/user/user-11.png", sx: { width: 100, height: 100 } }) }) }), _jsxs(Box, { mt: 2, children: [_jsx(H6, { fontSize: 18, textAlign: "center", children: "Pixy Krovasky" }), _jsxs(StyledFlexBetween, { paddingTop: 1, maxWidth: 340, children: [_jsx(ListItem, { title: "Developer", Icon: Bratislava }), _jsx(ListItem, { title: "New York", Icon: MapMarkerIcon }), _jsx(ListItem, { title: "Joined March 17", Icon: DateRange })] })] }), _jsxs(StyledFlexBetween, { paddingTop: 4, maxWidth: 400, children: [_jsx(BoxItem, { amount: `$${format(4550, "0,00")}`, title: "Earnings", color: "primary.main" }), _jsx(BoxItem, { amount: format(60, "0,00"), title: "Projects", color: "success.600" }), _jsx(BoxItem, { amount: `$${format(2800, "0,00")}`, title: "Success Rate", color: "warning.600" })] })] }), _jsxs(StyledTabList, { variant: "scrollable", onChange: handleTabList, children: [_jsx(Tab, { disableRipple: true, label: "Overview", value: "1" }), _jsx(Tab, { disableRipple: true, label: "Projects", value: "2" }), _jsx(Tab, { disableRipple: true, label: "Campaigns", value: "3" }), _jsx(Tab, { disableRipple: true, label: "Documents", value: "4" }), _jsx(Tab, { disableRipple: true, label: "Connections", value: "5" }), _jsx(Tab, { disableRipple: true, label: "Activity", value: "6" })] })] }), children || _jsx(Outlet, {})] }));
};
export default Layout;
// ============================================================================================
function ListItem({ title, Icon }) {
    return (_jsxs(FlexBox, { gap: 1, alignItems: "center", children: [_jsx(Icon, { sx: { fontSize: 14, color: "text.secondary" } }), _jsx(Paragraph, { color: "text.secondary", children: title })] }));
}
function BoxItem({ title, amount, color }) {
    return (_jsxs(Stack, { spacing: 0.5, alignItems: "center", sx: {
            borderRadius: "8px",
            border: "1px solid",
            padding: "1rem .5rem",
            borderColor: "divider",
            width: { sm: 120, xs: "100%" },
            marginBottom: { sm: 0, xs: 1 },
        }, children: [_jsx(H6, { fontSize: 16, color: color, children: amount }), _jsx(Paragraph, { color: "text.secondary", children: title })] }));
}

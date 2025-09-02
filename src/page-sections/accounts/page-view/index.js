import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment, useState } from "react";
import { Box, Card, Grid, styled, Drawer, Button, useTheme, IconButton, useMediaQuery, } from "@mui/material";
// CUSTOM COMPONENTS
import { H5 } from "@/components/typography";
import { FlexBox } from "@/components/flexbox";
// CUSTOM PAGE SECTION COMPONENTS
import TabComponent from "@/page-sections/accounts";
// CUSTOM ICON COMPONENTS
import Apps from "@/icons/Apps";
import Icons from "@/icons/account";
// STYLED COMPONENTS
const StyledButton = styled(Button)(({ theme }) => ({
    borderRadius: 0,
    fontWeight: 500,
    position: "relative",
    padding: "0.6rem 1.5rem",
    justifyContent: "flex-start",
    color: theme.palette.grey[500],
}));
const AccountsPageView = () => {
    const theme = useTheme();
    const [openDrawer, setOpenDrawer] = useState(false);
    const [active, setActive] = useState("Basic Information");
    const downMd = useMediaQuery((theme) => theme.breakpoints.down("md"));
    // COMMON TAB LIST ITEM STYLE
    const STYLE = {
        color: theme.palette.primary.main,
        backgroundColor: theme.palette.action.selected,
        "&:hover": { backgroundColor: theme.palette.action.hover },
        "&::before": {
            left: 0,
            width: 4,
            content: '""',
            height: "100%",
            borderRadius: 4,
            position: "absolute",
            transition: "all 0.3s",
            backgroundColor: theme.palette.primary.main,
        },
    };
    // HANDLE LIST ITEM ON CLICK
    const handleListItemBtn = (name) => () => {
        setActive(name);
        setOpenDrawer(false);
    };
    // SIDEBAR LIST CONTENT
    const TabListContent = (_jsx(FlexBox, { flexDirection: "column", children: tabList.map(({ id, name, Icon }) => (_jsx(StyledButton, { variant: "text", startIcon: _jsx(Icon, {}), onClick: handleListItemBtn(name), sx: active === name ? STYLE : { "&:hover": STYLE }, children: name }, id))) }));
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, md: 3, xs: 12, children: downMd ? (_jsxs(Fragment, { children: [_jsxs(FlexBox, { alignItems: "center", gap: 1, onClick: () => setOpenDrawer(true), children: [_jsx(IconButton, { sx: { padding: 0 }, children: _jsx(Apps, { sx: { color: "text.primary" } }) }), _jsx(H5, { fontSize: 16, children: "More" })] }), _jsx(Drawer, { open: openDrawer, onClose: () => setOpenDrawer(false), children: _jsx(Box, { padding: 1, children: TabListContent }) })] })) : (_jsx(Card, { sx: { p: "1rem 0" }, children: TabListContent })) }), _jsxs(Grid, { item: true, md: 9, xs: 12, children: [active === tabList[0].name && _jsx(TabComponent.BasicInformation, {}), active === tabList[1].name && _jsx(TabComponent.Password, {}), active === tabList[2].name && _jsx(TabComponent.Preferences, {}), active === tabList[3].name && _jsx(TabComponent.RecentDevices, {}), active === tabList[4].name && _jsx(TabComponent.Notifications, {}), active === tabList[5].name && _jsx(TabComponent.TwoStepVerification, {}), active === tabList[6].name && _jsx(TabComponent.ConnectedAccounts, {}), active === tabList[7].name && _jsx(TabComponent.SocialAccounts, {}), active === tabList[8].name && _jsx(TabComponent.Billing, {}), active === tabList[9].name && _jsx(TabComponent.Statements, {}), active === tabList[10].name && _jsx(TabComponent.Referrals, {}), active === tabList[11].name && _jsx(TabComponent.ApiKeys, {}), active === tabList[12].name && _jsx(TabComponent.DeleteAccount, {})] })] }) }));
};
const tabList = [
    { id: 1, name: "Basic Information", Icon: Icons.UserOutlined },
    { id: 2, name: "Password", Icon: Icons.LockOutlined },
    { id: 3, name: "Preferences", Icon: Icons.SettingsOutlined },
    { id: 4, name: "Recent Devices", Icon: Icons.DevicesApple },
    { id: 5, name: "Notifications", Icon: Icons.NotificationOutlined },
    { id: 6, name: "Two-step verification", Icon: Icons.Fingerprint },
    { id: 7, name: "Connected accounts", Icon: Icons.Link },
    { id: 8, name: "Social Account", Icon: Icons.Instagram },
    { id: 9, name: "Billing", Icon: Icons.DollarOutlined },
    { id: 10, name: "Statements", Icon: Icons.FileOutlined },
    { id: 11, name: "Referrals", Icon: Icons.PremiumOutlined },
    { id: 12, name: "API Keys", Icon: Icons.Key },
    { id: 13, name: "Delete account", Icon: Icons.DeleteOutlined },
];
export default AccountsPageView;

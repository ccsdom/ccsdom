import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TabContext, TabList } from "@mui/lab";
import { Button, styled, Tab } from "@mui/material";
// CUSTOM DEFINED HOOK
import useNavigate from "@/hooks/useNavigate";
// CUSTOM COMPONENTS
import { Paragraph } from "@/components/typography";
import { IconWrapper } from "@/components/icon-wrapper";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// CUSTOM ICON COMPONENTS
import GroupSenior from "@/icons/GroupSenior";
import Add from "@/icons/Add";
// STYLED COMPONENT
const TabListWrapper = styled(TabList)(({ theme }) => ({
    borderBottom: 0,
    [theme.breakpoints.down(727)]: { order: 3 },
}));
// ===================================================================
const HeadingArea = ({ value, changeTab }) => {
    const navigate = useNavigate();
    return (_jsxs(FlexBetween, { flexWrap: "wrap", gap: 1, children: [_jsxs(FlexBox, { alignItems: "center", children: [_jsx(IconWrapper, { children: _jsx(GroupSenior, { sx: { color: "primary.main" } }) }), _jsx(Paragraph, { fontSize: 16, children: "Users" })] }), _jsx(TabContext, { value: value, children: _jsxs(TabListWrapper, { variant: "scrollable", onChange: changeTab, children: [_jsx(Tab, { disableRipple: true, label: "All Users", value: "" }), _jsx(Tab, { disableRipple: true, label: "Editor", value: "editor" }), _jsx(Tab, { disableRipple: true, label: "Contributor", value: "contributor" }), _jsx(Tab, { disableRipple: true, label: "Administrator", value: "administrator" }), _jsx(Tab, { disableRipple: true, label: "Subscriber", value: "subscriber" })] }) }), _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: () => navigate("/dashboard/add-user"), children: "Add New User" })] }));
};
export default HeadingArea;

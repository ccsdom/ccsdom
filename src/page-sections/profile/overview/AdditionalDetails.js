import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Stack, useTheme, alpha } from "@mui/material";
// CUSTOM COMPONENTS
import { H6, Small } from "@/components/typography";
import { MoreButton } from "@/components/more-button";
import FlexBetween from "@/components/flexbox/FlexBetween";
// CUSTOM ICON COMPONENTS
import Globe from "@/icons/Globe";
import DateRange from "@/icons/DateRange";
import Education from "@/icons/Education";
import UserOutlined from "@/icons/UserOutlined";
import EmailOutlined from "@/icons/EmailOutlined";
import BriefcaseOutlined from "@/icons/BriefcaseOutlined";
const AdditionalDetails = () => {
    const theme = useTheme();
    return (_jsxs(Card, { sx: { padding: 3 }, children: [_jsxs(FlexBetween, { children: [_jsx(H6, { fontSize: 16, children: "Additional Details" }), _jsx(MoreButton, { size: "small" })] }), _jsxs(Stack, { mt: 3, spacing: 2, children: [_jsx(ListItem, { title: "Email", Icon: EmailOutlined, subTitle: "Uilib@gmail.com", color: theme.palette.grey[400] }), _jsx(ListItem, { Icon: Globe, title: "Language", subTitle: "English, Spanish", color: theme.palette.primary.main }), _jsx(ListItem, { title: "Nickname", subTitle: "Pixy", Icon: UserOutlined, color: theme.palette.warning[600] }), _jsx(ListItem, { Icon: DateRange, title: "Join Date", subTitle: "Aug 15th, 2021", color: theme.palette.success.main }), _jsx(ListItem, { title: "Work History", subTitle: "Theme Forest", Icon: BriefcaseOutlined, color: theme.palette.error.main }), _jsx(ListItem, { Icon: Education, title: "Education", subTitle: "Cambridge University", color: theme.palette.warning.main })] })] }));
};
export default AdditionalDetails;
// ===========================================================================
function ListItem({ title, subTitle, Icon, color }) {
    return (_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1.5, children: [_jsx(Stack, { alignItems: "center", justifyContent: "center", sx: {
                    width: 30,
                    height: 30,
                    borderRadius: "4px",
                    backgroundColor: alpha(color, 0.2),
                }, children: _jsx(Icon, { sx: { color } }) }), _jsxs("div", { children: [_jsx(Small, { lineHeight: 1, color: "text.secondary", children: title }), _jsx(H6, { fontSize: 14, children: subTitle })] })] }));
}

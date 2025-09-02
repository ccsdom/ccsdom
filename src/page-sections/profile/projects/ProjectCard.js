import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Chip, alpha, Stack, styled, Avatar, useTheme, AvatarGroup, LinearProgress, } from "@mui/material";
// CUSTOM COMPONENTS
import { H6, Paragraph } from "@/components/typography";
import { FlexBetween, FlexRowAlign } from "@/components/flexbox";
// STYLED COMPONENTS
const IconWrapper = styled(FlexRowAlign)({
    width: 35,
    height: 30,
    borderRadius: "4px",
});
const StyledAvatarGroup = styled(AvatarGroup, {
    shouldForwardProp: (prop) => prop !== "type",
})(({ type }) => ({
    "& .MuiAvatar-root": { width: 30, height: 30 },
    "& .MuiAvatar-colorDefault": {
        color: type,
        fontWeight: 500,
        backgroundColor: alpha(type, 0.1),
    },
}));
// =======================================================================
const ProjectCard = ({ title, value, status, description, Icon, }) => {
    const theme = useTheme();
    const getStatusColor = (status) => {
        if (status === "Pending")
            return theme.palette.primary.main;
        if (status === "Completed")
            return theme.palette.success.main;
        return theme.palette.warning.main;
    };
    const color = getStatusColor(status);
    // FOR CHIP AND LINEAR PROGRESS
    const getColorType = () => {
        if (status === "Pending")
            return "primary";
        else if (status === "Completed")
            return "success";
        else
            return "warning";
    };
    return (_jsxs(Card, { sx: { padding: 3 }, children: [_jsxs(FlexBetween, { children: [_jsx(IconWrapper, { bgcolor: alpha(color, 0.1), children: _jsx(Icon, { sx: { color } }) }), _jsx(Chip, { label: status, size: "small", color: getColorType() })] }), _jsx(H6, { fontSize: 16, my: 2, children: title }), _jsx(Paragraph, { color: "text.secondary", children: description }), _jsxs(Stack, { my: 2, direction: "row", alignItems: "center", spacing: 2, children: [_jsx(LinearProgress, { value: value, variant: "determinate", color: getColorType() }), _jsxs(H6, { fontSize: 12, children: [value, "%"] })] }), _jsxs(FlexBetween, { children: [_jsxs(StyledAvatarGroup, { max: 3, type: color, children: [_jsx(Avatar, { src: "/static/user/user-11.png" }), _jsx(Avatar, { src: "/static/user/user-11.png" }), _jsx(Avatar, { src: "/static/user/user-11.png" }), _jsx(Avatar, { src: "/static/user/user-11.png" })] }), _jsx(Paragraph, { fontWeight: 600, color: "text.secondary", children: "Due In 2 Days" })] })] }));
};
export default ProjectCard;

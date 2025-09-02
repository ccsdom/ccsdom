import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Chip, Stack, Table, alpha, styled, Avatar, TableRow, useTheme, TableBody, TableCell, AvatarGroup, } from "@mui/material";
// CUSTOM COMPONENTS
import { Scrollbar } from "@/components/scrollbar";
import { H6, Paragraph } from "@/components/typography";
import FlexRowAlign from "@/components/flexbox/FlexRowAlign";
// CUSTOM ICON COMPONENTS
import InvertColors from "@/icons/InvertColors";
import PaletteOutlined from "@/icons/PaletteOutlined";
import KeyframeBezierIn from "@/icons/KeyframeBezierIn";
// STYLED COMPONENTS
const StyledAvatarGroup = styled(AvatarGroup)({
    "& .MuiAvatarGroup-avatar": { width: 25, height: 25 },
});
const IconWrapper = styled(FlexRowAlign, {
    shouldForwardProp: (prop) => prop !== "color",
})(({ color }) => ({
    width: 35,
    height: 30,
    borderRadius: "4px",
    backgroundColor: alpha(color, 0.2),
}));
const Teams = () => {
    const theme = useTheme();
    // CUSTOM DUMMY DATA
    const TEAM_LIST = [
        {
            id: 1,
            Icon: KeyframeBezierIn,
            company: "Ui Lib",
            position: "Software Engineers",
            date: "Jan 12, 2021",
            color: theme.palette.primary.main,
        },
        {
            id: 2,
            Icon: PaletteOutlined,
            company: "Team Uko",
            position: "Visual Designers",
            date: "Jan 22, 2021",
            color: theme.palette.info.main,
        },
        {
            id: 3,
            Icon: InvertColors,
            company: "Team Olly",
            position: "Web Developers",
            date: "Jan 12, 2021",
            color: theme.palette.warning.main,
        },
    ];
    return (_jsxs(Card, { sx: { padding: 3 }, children: [_jsx(H6, { fontSize: 16, mb: 2, children: "Teams" }), _jsx(Scrollbar, { autoHide: false, children: _jsx(Table, { sx: { minWidth: 600 }, children: _jsx(TableBody, { children: TEAM_LIST.map(({ Icon, color, company, date, id, position }) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsxs(Stack, { mb: 1, alignItems: "center", direction: "row", spacing: 2, children: [_jsx(IconWrapper, { color: color, children: _jsx(Icon, { sx: { color: color } }) }), _jsxs("div", { children: [_jsx(H6, { color: "text.primary", fontSize: 14, children: company }), _jsx(Paragraph, { color: "text.secondary", children: position })] })] }) }), _jsxs(TableCell, { children: ["Formed ", date] }), _jsx(TableCell, { children: _jsxs(Stack, { direction: "row", justifyContent: "flex-end", spacing: 2, children: [_jsxs(StyledAvatarGroup, { max: 3, children: [_jsx(Avatar, { src: "/static/user/user-11.png" }), _jsx(Avatar, { src: "/static/user/user-11.png" }), _jsx(Avatar, { src: "/static/user/user-11.png" }), _jsx(Avatar, { src: "/static/user/user-11.png" }), _jsx(Avatar, { src: "/static/user/user-11.png" })] }), _jsx(Chip, { size: "small", color: "secondary", label: "30 members" })] }) })] }, id))) }) }) })] }));
};
export default Teams;

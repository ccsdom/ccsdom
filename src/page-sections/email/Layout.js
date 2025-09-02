import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Card, Tooltip, useTheme, Checkbox, IconButton, useMediaQuery, } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, Menu, MoreVert, } from "@mui/icons-material";
// CUSTOM COMPONENTS
import { Paragraph } from "@/components/typography";
import { SearchInput } from "@/components/search-input";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// CUSTOM PAGE SECTION COMPONENTS
import MailSidebar from "./MailSidebar";
// CUSTOM ICON COMPONENTS
import Trash from "@/icons/duotone/Trash";
import Reload from "@/icons/duotone/Reload";
import Report from "@/icons/duotone/Report";
import Archive from "@/icons/duotone/Archive";
import ReadMail from "@/icons/duotone/ReadMail";
import UnreadMail from "@/icons/duotone/UnreadMail";
// ==============================================================
const Layout = ({ children, showTopActions = true }) => {
    const { palette, direction } = useTheme();
    const [openSidebar, setOpenSidebar] = useState(false);
    const upSm = useMediaQuery((theme) => theme.breakpoints.up("sm"));
    const downMd = useMediaQuery((theme) => theme.breakpoints.down("md"));
    const downLg = useMediaQuery((theme) => theme.breakpoints.down("xl"));
    const ICONS = [
        { title: "Reload", Icon: Reload },
        { title: "Archive", Icon: Archive },
        { title: "Report", Icon: Report },
        { title: "Trash", Icon: Trash },
        { title: "Read All", Icon: ReadMail },
        { title: "Unread All", Icon: UnreadMail },
    ];
    return (_jsx(Box, { py: 3, height: "100%", children: _jsxs(Card, { sx: { display: "flex", minHeight: 800 }, children: [_jsx(MailSidebar, { openSidebar: openSidebar, onClose: () => setOpenSidebar(false) }), _jsxs(Box, { flexGrow: 1, children: [showTopActions && (_jsxs(FlexBetween, { p: 3, flexWrap: "wrap", borderBottom: `1px solid ${palette.divider}`, children: [_jsxs(FlexBox, { gap: 1, alignItems: "center", children: [downMd && (_jsx(IconButton, { color: "secondary", onClick: () => setOpenSidebar(true), children: _jsx(Menu, { fontSize: "small" }) })), upSm && _jsx(Checkbox, { size: "small", sx: { p: 0 } }), downLg ? (_jsx(Tooltip, { title: "More", children: _jsx(IconButton, { color: "secondary", children: _jsx(MoreVert, { fontSize: "small" }) }) })) : (_jsx(_Fragment, { children: ICONS.map(({ title, Icon }, i) => (_jsx(Tooltip, { title: title, children: _jsx(IconButton, { sx: {
                                                        ".MuiSvgIcon-root": {
                                                            fontSize: 17,
                                                            color: "grey.400",
                                                        },
                                                    }, children: _jsx(Icon, {}) }) }, i))) }))] }), _jsxs(FlexBox, { alignItems: "center", gap: 2, flexShrink: 0, children: [_jsx(SearchInput, { placeholder: "Search email" }), _jsxs(FlexBox, { flexShrink: 0, color: "grey.400", alignItems: "center", display: { md: "flex", xs: "none" }, children: [_jsx(Paragraph, { color: "inherit", mr: 2, children: "1-10 of 50" }), _jsx(Tooltip, { title: "Previous Page", children: _jsx(IconButton, { color: "inherit", size: "small", children: _jsx(ArrowBackIos, { fontSize: "inherit", sx: { rotate: direction === "rtl" ? "180deg" : 0 } }) }) }), _jsx(Tooltip, { title: "Next Page", children: _jsx(IconButton, { color: "inherit", size: "small", children: _jsx(ArrowForwardIos, { fontSize: "inherit", sx: { rotate: direction === "rtl" ? "180deg" : 0 } }) }) })] })] })] })), children] })] }) }));
};
export default Layout;

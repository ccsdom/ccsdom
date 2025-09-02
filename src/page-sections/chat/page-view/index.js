import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Card, Grid, Drawer, styled, Divider, IconButton, useMediaQuery, } from "@mui/material";
import Add from "@mui/icons-material/Add";
// CUSTOM COMPONENTS
import PinChats from "../PinChats";
import AllMessages from "../AllMessages";
import Conversation from "../Conversation";
import { H6 } from "@/components/typography";
import { FlexBetween } from "@/components/flexbox";
import { SearchInput } from "@/components/search-input";
// CUSTOM UTIL METHOD
import { isDark } from "@/utils/constants";
// STYLED COMPONENTS
const StyledSearchInput = styled(SearchInput)(({ theme }) => ({
    backgroundColor: theme.palette.action.selected,
    border: `1px solid ${theme.palette.grey[isDark(theme) ? 600 : 200]}`,
}));
const StyledIconButton = styled(IconButton)(({ theme }) => ({
    backgroundColor: theme.palette.action.selected,
    border: `1px solid ${theme.palette.divider}`,
}));
const ChatPageView = () => {
    const [openLeftDrawer, setOpenLeftDrawer] = useState(false);
    const downMd = useMediaQuery((theme) => theme.breakpoints.down("md"));
    const handleOpen = () => setOpenLeftDrawer(true);
    // RECENT CONVERSATION LIST
    const MESSAGE_CONTENT = (_jsxs(Card, { sx: { height: "100%", pb: 1 }, children: [_jsxs(Box, { p: 3, children: [_jsxs(FlexBetween, { mb: 3, children: [_jsx(H6, { fontSize: 18, children: "Messages" }), _jsx(StyledIconButton, { size: "small", children: _jsx(Add, {}) })] }), _jsx(StyledSearchInput, { placeholder: "Search..." })] }), _jsx(PinChats, {}), _jsx(Divider, {}), _jsx(AllMessages, {})] }));
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsxs(Grid, { container: true, spacing: 3, children: [downMd ? (_jsx(Drawer, { anchor: "left", open: openLeftDrawer, onClose: () => setOpenLeftDrawer(false), children: _jsx(Box, { width: 300, padding: 1, children: MESSAGE_CONTENT }) })) : (_jsx(Grid, { item: true, xl: 4, md: 4, children: MESSAGE_CONTENT })), _jsx(Grid, { item: true, xl: 8, md: 8, xs: 12, children: _jsx(Conversation, { handleOpen: handleOpen }) })] }) }));
};
export default ChatPageView;

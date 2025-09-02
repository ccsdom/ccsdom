import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Add, AttachFile, CameraAlt, ChevronRight, Mic, MoreHoriz, } from "@mui/icons-material";
import { Box, Card, Stack, styled, Button, Avatar, Divider, InputBase, IconButton, } from "@mui/material";
import { useDropzone } from "react-dropzone";
// CUSTOM COMPONENTS
import IncomingMsg from "./IncomingMsg";
import OutgoingMsg from "./OutgoingMsg";
import { Scrollbar } from "@/components/scrollbar";
import { H6, Small } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// CUSTOM ICON COMPONENT
import Search from "@/icons/duotone/Search";
// STYLED COMPONENTS
const ToggleBtn = styled("div", {
    shouldForwardProp: (prop) => prop !== "screen",
})(({ theme, screen = "md" }) => ({
    left: 0,
    top: 20,
    zIndex: 1,
    padding: 5,
    display: "flex",
    cursor: "pointer",
    alignItems: "center",
    position: "absolute",
    justifyContent: "center",
    borderRadius: "0 8px 8px 0",
    backgroundColor: theme.palette.primary.main,
    [theme.breakpoints.up(screen)]: { display: "none" },
}));
const StyledIconButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.grey[400],
    backgroundColor: theme.palette.grey[50],
    border: `1px solid ${theme.palette.grey[200]}`,
}));
const AttachButton = styled("div")(({ theme }) => ({
    width: 36,
    height: 36,
    fontSize: 18,
    display: "flex",
    cursor: "pointer",
    borderRadius: "50%",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.grey[400],
    backgroundColor: theme.palette.grey[50],
    border: `1px solid ${theme.palette.grey[200]}`,
}));
// ==============================================================
const Conversation = ({ handleOpen }) => {
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (files) => {
            // console.log(files);
        },
    });
    return (_jsxs(Card, { sx: { height: "100%" }, children: [_jsxs(FlexBetween, { padding: 3, children: [_jsxs(FlexBox, { alignItems: "center", gap: 1.5, children: [_jsx(Avatar, { src: "/static/user/user-19.png", alt: "" }), _jsxs("div", { children: [_jsx(H6, { lineHeight: 1, fontSize: 16, children: "Aiony Haust" }), _jsx(Small, { color: "text.secondary", children: "Online" })] })] }), _jsxs(FlexBox, { alignItems: "center", gap: 1, children: [_jsx(IconButton, { size: "small", children: _jsx(Search, { fontSize: "small" }) }), _jsx(StyledIconButton, { size: "small", children: _jsx(MoreHoriz, { fontSize: "inherit" }) })] })] }), _jsx(Divider, {}), _jsxs(Box, { position: "relative", children: [_jsx(ToggleBtn, { screen: "md", onClick: handleOpen, children: _jsx(ChevronRight, { sx: { fontSize: 16, color: "white" } }) }), _jsx(Scrollbar, { style: { maxHeight: 580 }, children: _jsxs(Stack, { spacing: 4, px: 3, py: 2, children: [_jsx(OutgoingMsg, {}), _jsx(IncomingMsg, {}), _jsx(OutgoingMsg, {}), _jsx(IncomingMsg, {}), _jsx(OutgoingMsg, {}), _jsx(IncomingMsg, {}), _jsx(OutgoingMsg, {})] }) })] }), _jsx(Divider, {}), _jsxs(Box, { px: 3, py: 2, children: [_jsxs(FlexBetween, { mb: 2, gap: 2, children: [_jsx(InputBase, { fullWidth: true, multiline: true, placeholder: "Type Something.....", sx: { fontSize: 14, fontWeight: 500, flex: 1 } }), _jsx(StyledIconButton, { size: "small", children: _jsx(Mic, {}) })] }), _jsxs(FlexBetween, { gap: 2, children: [_jsxs(FlexBox, { gap: 1.5, children: [_jsxs(AttachButton, { ...getRootProps(), children: [_jsx("input", { ...getInputProps() }), _jsx(CameraAlt, { fontSize: "inherit" })] }), _jsxs(AttachButton, { ...getRootProps(), children: [_jsx("input", { ...getInputProps() }), _jsx(AttachFile, { fontSize: "inherit" })] }), _jsx(StyledIconButton, { size: "small", children: _jsx(Add, { fontSize: "small" }) })] }), _jsx(Button, { size: "small", children: "Send" })] })] })] }));
};
export default Conversation;

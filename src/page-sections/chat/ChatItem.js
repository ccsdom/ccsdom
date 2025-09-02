import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, Box, styled } from "@mui/material";
import { DoneAll } from "@mui/icons-material";
import { formatDistanceToNowStrict } from "date-fns";
// CUSTOM COMPONENTS
import { Paragraph, Small, Span } from "@/components/typography";
import { FlexBetween, FlexBox, FlexRowAlign } from "@/components/flexbox";
// STYLED COMPONENT
const Wrapper = styled(FlexBox)(({ theme }) => ({
    cursor: "pointer",
    "&:hover": { backgroundColor: theme.palette.action.selected },
}));
// ===============================================================
const ChatItem = (props) => {
    const { name, time, image, lastMsg, unseenMsg, lastMsgSeen, isLastMsgIncoming, } = props;
    return (_jsxs(Wrapper, { gap: 1.5, p: 2, children: [_jsx(Avatar, { src: image }), _jsxs(Box, { flexGrow: 1, children: [_jsxs(FlexBetween, { children: [_jsx(Paragraph, { fontWeight: 500, children: name }), _jsxs(Paragraph, { fontSize: 12, color: "text.secondary", children: [formatDistanceToNowStrict(new Date(time)), " ago"] })] }), _jsxs(FlexBetween, { mt: 0.5, children: [_jsxs(Paragraph, { fontSize: 12, color: "text.secondary", children: [!isLastMsgIncoming && _jsx(Span, { color: "text.primary", children: "You: " }), lastMsg] }), unseenMsg ? (_jsx(FlexRowAlign, { sx: {
                                    width: 18,
                                    height: 18,
                                    color: "white",
                                    borderRadius: "50%",
                                    backgroundColor: "primary.main",
                                }, children: _jsx(Small, { fontWeight: 500, children: unseenMsg }) })) : (_jsx(DoneAll, { sx: {
                                    fontSize: 18,
                                    color: lastMsgSeen ? "primary.main" : "grey.400",
                                } }))] })] })] }));
};
export default ChatItem;

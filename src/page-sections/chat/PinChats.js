import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// CUSTOM ICON COMPONENT
import PushPin from "@/icons/PushPin";
// CUSTOM COMPONENTS
import ChatItem from "./ChatItem";
import { FlexBox } from "@/components/flexbox";
import { Paragraph } from "@/components/typography";
// CUSTOM DUMMY DATA
import { PIN_CHATS } from "@/__fakeData__/chats";
const PinChats = () => {
    return (_jsxs("div", { children: [_jsxs(FlexBox, { alignItems: "center", gap: 1, px: 3, mb: 1, children: [_jsx(PushPin, { sx: { fontSize: 19, color: "grey.500" } }), _jsx(Paragraph, { fontSize: 16, color: "text.secondary", children: "Pinned" })] }), PIN_CHATS.map((item) => (_jsx(ChatItem, { id: item.id, name: item.name, time: item.time, image: item.image, lastMsg: item.lastMsg, unseenMsg: item.unseenMsg, lastMsgSeen: item.lastMsgSeen, isLastMsgIncoming: item.isLastMsgIncoming }, item.id)))] }));
};
export default PinChats;

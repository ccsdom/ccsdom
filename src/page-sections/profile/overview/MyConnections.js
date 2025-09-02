import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, Card, Stack } from "@mui/material";
// CUSTOM COMPONENTS
import { H6, Small } from "@/components/typography";
const MyConnections = () => {
    return (_jsxs(Card, { sx: { padding: 3 }, children: [_jsx(H6, { fontSize: 16, children: "My Connections" }), _jsxs(Stack, { spacing: 3, mt: 3, children: [_jsx(SingleItem, { name: "Martha Hawk", position: "Developer", imageUrl: "/static/user/user-11.png" }), _jsx(SingleItem, { name: "Smantha Hoopes", position: "Developer", imageUrl: "/static/user/user-11.png" }), _jsx(SingleItem, { name: "Chris Pine", position: "Developer", imageUrl: "/static/user/user-11.png" }), _jsx(SingleItem, { name: "Sun Myi", position: "Developer", imageUrl: "/static/user/user-11.png" })] })] }));
};
export default MyConnections;
// =======================================================================================
function SingleItem({ name, imageUrl, position }) {
    return (_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(Avatar, { src: imageUrl }), _jsxs(Stack, { spacing: 0.5, children: [_jsx(H6, { fontSize: 14, children: name }), _jsx(Small, { color: "text.secondary", lineHeight: 1, fontWeight: 500, children: position })] })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Grid, Box, Select, MenuItem } from "@mui/material";
// CUSTOM COMPONENTS
import ConnectionCard from "./ConnectionCard";
import { H6, Span } from "@/components/typography";
import FlexBetween from "@/components/flexbox/FlexBetween";
// CUSTOM DUMMY DATA
const CONNECTION_LIST = [
    {
        id: 1,
        connected: false,
        name: "Miphoshka",
        position: "Visual Designer",
        img: "/static/user/user-11.png",
    },
    {
        id: 2,
        connected: true,
        name: "Tim Carrey",
        position: "Visual Designer",
        img: "/static/user/user-10.png",
    },
    {
        id: 3,
        connected: false,
        name: "Edward Norton",
        position: "Visual Designer",
        img: "/static/user/user-9.png",
    },
    {
        id: 4,
        connected: true,
        name: "Eva Mendes",
        position: "Visual Designer",
        img: "/static/user/user-8.png",
    },
    {
        id: 5,
        connected: false,
        name: "Vida Lao",
        position: "Visual Designer",
        img: "/static/user/user-7.png",
    },
    {
        id: 6,
        connected: false,
        name: "Angelina",
        position: "Visual Designer",
        img: "/static/user/user-6.png",
    },
];
const Connections = () => {
    return (_jsx(Box, { py: 3, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, children: _jsxs(FlexBetween, { flexWrap: "wrap", children: [_jsxs(H6, { fontSize: 16, mb: 1, children: ["My Connections", " ", _jsx(Span, { fontSize: 14, fontWeight: 400, color: "text.secondary", children: "(100+ Resources)" })] }), _jsxs(Select, { defaultValue: "active", size: "small", children: [_jsx(MenuItem, { value: "active", children: "Active" }), _jsx(MenuItem, { value: "deactivate", children: "Deactivate" })] })] }) }), CONNECTION_LIST.map((item) => (_jsx(Grid, { item: true, md: 4, sm: 6, xs: 12, children: _jsx(ConnectionCard, { img: item.img, name: item.name, position: item.position, connected: item.connected }) }, item.id)))] }) }));
};
export default Connections;

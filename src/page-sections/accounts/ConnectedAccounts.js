import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, Box, Card, Divider, Switch } from "@mui/material";
// CUSTOM COMPONENTS
import { Link } from "@/components/link";
import { FlexBetween, FlexBox } from "@/components/flexbox";
import { H6, Paragraph, Small } from "@/components/typography";
// CUSTOM DUMMY DATA SET
const ACCOUNT_LIST = [
    {
        id: 1,
        title: "Facebook",
        body: "Plan properly your workflow",
        image: "/static/social-media/036-facebook.svg",
    },
    {
        id: 2,
        title: "Twitter",
        body: "Keep eye on on your Repositories",
        image: "/static/social-media/twitter-round.svg",
    },
    {
        id: 3,
        title: "Instagram",
        body: "Keep up with the stories",
        image: "/static/social-media/instagram-round.svg",
    },
    {
        id: 4,
        title: "Sound Cloud",
        body: "Playlist to get you by",
        image: "/static/social-media/soundcloud.svg",
    },
];
const ConnectedAccounts = () => {
    return (_jsxs(Card, { sx: { pb: 2 }, children: [_jsxs(Box, { padding: 3, children: [_jsx(H6, { fontSize: 14, children: "Connected accounts" }), _jsxs(Small, { color: "text.secondary", children: ["Two-factor authentication adds to log in, in you'll need to provide a 4 digit amazing code. ", _jsx(Link, { href: "#", children: "Learn More" })] })] }), _jsx(Divider, {}), ACCOUNT_LIST.map(({ id, title, body, image }) => (_jsxs(FlexBetween, { sx: {
                    borderBottom: 1,
                    padding: "1rem 1.5rem",
                    borderColor: "divider",
                    "&:last-of-type": { borderBottom: 0 },
                }, children: [_jsxs(FlexBox, { alignItems: "center", gap: 2, children: [_jsx(Avatar, { src: image }), _jsxs("div", { children: [_jsx(Paragraph, { fontWeight: 500, fontSize: 14, children: title }), _jsx(Small, { color: "text.secondary", mt: 0.3, children: body })] })] }), _jsx(Switch, { defaultChecked: true })] }, id)))] }));
};
export default ConnectedAccounts;

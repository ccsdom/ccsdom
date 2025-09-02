import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, Button, Card, Divider } from "@mui/material";
// CUSTOM COMPONENTS
import { H6, Paragraph, Small } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// CUSTOM DUMMY DATA SET
const ACCOUNT_LIST = [
    {
        id: 1,
        connect: false,
        title: "Facebook",
        body: "www.facebook.com/ui-lib",
        image: "/static/social-media/036-facebook.svg",
    },
    {
        id: 2,
        connect: false,
        title: "Twitter",
        body: "www.twitter.com/ui-lib",
        image: "/static/social-media/twitter-round.svg",
    },
    {
        id: 3,
        connect: false,
        title: "Linkedin",
        body: "www.linkedin.com/ui-lib",
        image: "/static/social-media/linkedin.svg",
    },
    {
        id: 4,
        connect: true,
        title: "Skype",
        body: "www.skype.com/ui-lib",
        image: "/static/social-media/skype.svg",
    },
];
const SocialAccounts = () => {
    return (_jsxs(Card, { sx: { pb: 2 }, children: [_jsx(H6, { fontSize: 14, p: 3, children: "Social Account" }), _jsx(Divider, {}), ACCOUNT_LIST.map(({ id, body, connect, image, title }) => (_jsxs(FlexBetween, { sx: {
                    borderBottom: 1,
                    padding: "1rem 1.5rem",
                    borderColor: "divider",
                    "&:last-of-type": { borderBottom: 0 },
                }, children: [_jsxs(FlexBox, { alignItems: "center", gap: 2, children: [_jsx(Avatar, { src: image }), _jsxs("div", { children: [_jsx(Paragraph, { fontWeight: 500, lineHeight: 1, children: title }), _jsx(Small, { color: "text.secondary", children: body })] })] }), _jsx(Button, { color: connect ? "primary" : "secondary", variant: connect ? "contained" : "outlined", children: connect ? "Connect" : "Disconnect" })] }, id)))] }));
};
export default SocialAccounts;

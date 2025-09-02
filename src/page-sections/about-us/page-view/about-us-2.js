import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { GitHub, LinkedIn } from "@mui/icons-material";
import { Box, Card, Grid, IconButton, useTheme } from "@mui/material";
import { nanoid } from "nanoid";
// CUSTOM COMPONENTS
import { FlexRowAlign } from "@/components/flexbox";
import { H6, Paragraph } from "@/components/typography";
// CUSTOM ICON COMPONENTS
import Database from "@/icons/Database";
import Facebook from "@/icons/Facebook";
import Minimize from "@/icons/Minimize";
import Recycle from "@/icons/Recycle";
import Twitter from "@/icons/Twitter";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
// CUSTOM DUMMY DATA
const DATA = [
    {
        id: nanoid(),
        title: "Easy",
        Icon: Minimize,
        description: "Building and deploying should be as easy as a single tap.",
    },
    {
        id: nanoid(),
        Icon: Recycle,
        title: "Universal",
        description: "To connect the world, sites should be fast from everywhere.",
    },
    {
        id: nanoid(),
        Icon: Database,
        title: "Accessible",
        description: "Great care in user experience and design enables everyone.",
    },
];
const AboutUs2PageView = () => {
    const theme = useTheme();
    return (_jsx(Box, { py: 3, maxWidth: 930, margin: "auto", children: _jsxs(Card, { children: [_jsx("img", { src: "/static/thumbnail/thumbnail-7.png", width: "100%", alt: "about" }), _jsxs(Box, { p: 3, children: [_jsx(H6, { fontSize: 18, mb: 1, children: "About Us" }), _jsx(Paragraph, { textAlign: "justify", color: "text.secondary", lineHeight: 1.7, children: "To other made was hunt, their not at them. How the that they task. Options they to hours. And the should company, in into being herself get approached country. We same bread so slid duty think chair. Had leather oh, client which phase uneasiness, way. Shared agency, kind he tone name was had how the name can one man he is and text doctor ridden spree. Farther, a not noise self-discipline. In is on both I and hazardous for the text devotion phase in much eminent his with state that we could there text presented. Changes acquired made, the feel." }), _jsx(Paragraph, { textAlign: "justify", color: "text.secondary", mt: 2, mb: 8, lineHeight: 1.7, children: "All economics city, a she day into and concept. Seemed I profiles with him as rolled called align than the up acknowledge a because and tag bold, if there pay both you original second of target. It eminent so more been best hope a of behind and the and attempt. That fur place. Into I bed. A couldn't it and secretly keep compensation necessary any wait must and yes, clothes, you'd it lay troubled magnitude, work for very act and of just conduct, partiality more behind gentlemen, an get few where were phase parts could the other and thought." }), _jsx(Grid, { container: true, spacing: 3, children: DATA.map(({ id, Icon, title, description }) => (_jsx(Grid, { item: true, md: 4, xs: 12, children: _jsxs(Card, { sx: {
                                        padding: 3,
                                        display: "flex",
                                        textAlign: "center",
                                        alignItems: "center",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                    }, children: [_jsx(Icon, { fontSize: "large", sx: { color: "grey.500" } }), _jsx(H6, { fontSize: 18, py: 1, children: title }), _jsx(Paragraph, { color: "text.secondary", px: 2, children: description })] }) }, id))) }), _jsxs(FlexRowAlign, { mt: 3, py: 3, borderRadius: 4, flexDirection: "column", bgcolor: isDark(theme) ? "grey.700" : "grey.100", children: [_jsx(H6, { fontSize: 16, children: "Follow More" }), _jsxs("div", { children: [_jsx(IconButton, { children: _jsx(Facebook, { sx: { color: "grey.500" } }) }), _jsx(IconButton, { children: _jsx(Twitter, { sx: { color: "grey.500" } }) }), _jsx(IconButton, { children: _jsx(LinkedIn, { sx: { color: "grey.500" } }) }), _jsx(IconButton, { children: _jsx(GitHub, { sx: { color: "grey.500" } }) })] })] })] })] }) }));
};
export default AboutUs2PageView;

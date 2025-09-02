import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, useTheme } from "@mui/material";
// CUSTOM COMPONENTS
import { Carousel } from "@/components/carousel";
import { H1, H6, Paragraph } from "@/components/typography";
// CUSTOM DUMMY DATA
const TEAM_MEMBERS = [
    {
        id: 1,
        name: "Lucian Obrien",
        designation: "UX Designer",
        image: "/static/user/user-20.png",
    },
    {
        id: 2,
        name: "Reech Chung",
        designation: "Full Stack Developer",
        image: "/static/user/user-21.png",
    },
    {
        id: 3,
        name: "Harrison Stain",
        designation: "Marketer",
        image: "/static/user/user-22.png",
    },
    {
        id: 4,
        name: "Lainey Davidson",
        designation: "UI Designer",
        image: "/static/user/user-23.png",
    },
    {
        id: 5,
        name: "Reech Chung",
        designation: "Full Stack Developer",
        image: "/static/user/user-20.png",
    },
];
const Section3 = () => {
    const { breakpoints } = useTheme();
    // carousel breakpoints for responsive
    const carouselBreakpoints = {
        [breakpoints.values.lg]: { slidesPerView: 4 },
        [breakpoints.values.md]: { slidesPerView: 3 },
        [breakpoints.values.sm]: { slidesPerView: 2 },
        [breakpoints.values.xs]: { slidesPerView: 1 },
    };
    return (_jsxs(Box, { py: 10, children: [_jsxs(Box, { textAlign: "center", mb: 2, children: [_jsx(H1, { fontSize: { sm: 52, xs: 42 }, mb: 3, children: "Meet Our Team" }), _jsxs(Paragraph, { color: "text.secondary", fontSize: { sm: 18, xs: 16 }, children: ["If you face any problem, our support team will help you ", _jsx("br", {}), "within a business working day."] })] }), _jsx(Carousel, { grabCursor: true, rewind: true, pagination: true, breakpoints: carouselBreakpoints, children: TEAM_MEMBERS.map(({ designation, id, image, name }) => (_jsx(Box, { px: 2, py: 4, children: _jsxs(Card, { sx: { p: 4, boxShadow: 3 }, children: [_jsx(Box, { height: { lg: 250, md: 300, sm: 375, xs: 350 }, borderRadius: 4, overflow: "hidden", children: _jsx("img", { alt: "", width: "100%", height: "100%", src: image, style: { objectFit: "cover" } }) }), _jsxs(Box, { mt: 2, textAlign: "center", children: [_jsx(H6, { fontSize: 18, children: name }), _jsx(Paragraph, { color: "text.secondary", children: designation })] })] }) }, id))) })] }));
};
export default Section3;

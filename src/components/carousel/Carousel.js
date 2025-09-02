import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Children, useState } from "react";
import { Navigation, Pagination, A11y, Autoplay } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { styled, alpha } from "@mui/material";
// CUSTOM ICON COMPONENTS
import ChevronLeft from "@/icons/ChevronLeft";
import ChevronRight from "@/icons/ChevronRight";
// STYLED COMPONENT
const SwiperContainer = styled("div")(({ theme }) => ({
    overflow: "hidden",
    position: "relative",
    "& .swiper:has(+ .swiper-controls .swiper-pagination)": { marginBottom: 40 },
    "& .swiper-controls": {
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        position: "absolute",
        pointerEvents: "none",
        ".swiper-pagination": {
            bottom: 0,
            ".swiper-pagination-bullet": {
                width: 8,
                height: 8,
                backgroundColor: theme.palette.grey[400],
                "&.swiper-pagination-bullet-active": {
                    backgroundColor: theme.palette.primary.main,
                    boxShadow: `${alpha(theme.palette.primary.main, 0.1)} 0px 0px 0px 4px`,
                },
            },
        },
        ".swiper-navigation": {
            pointerEvents: "all",
            ".swiper-button": {
                width: 50,
                height: 50,
                backgroundColor: theme.palette.common.white,
                borderRadius: "50%",
                "::after": { display: "none" },
                ".MuiSvgIcon-root": { color: theme.palette.grey[900], fontSize: 25 },
                "&.swiper-button-disabled": { opacity: 0.6 },
            },
        },
    },
}));
// ==============================================================
const Carousel = ({ children, navigation, pagination, ...props }) => {
    const [prevEl, setPrevEl] = useState(null);
    const [nextEl, setNextEl] = useState(null);
    const [paginationEl, setPaginationEl] = useState(null);
    return (_jsxs(SwiperContainer, { children: [_jsx(Swiper, { spaceBetween: 0, autoplay: { delay: 2500 }, modules: [Navigation, Pagination, Autoplay, A11y], navigation: navigation ? { prevEl, nextEl } : false, pagination: pagination ? { clickable: true, el: paginationEl } : false, ...props, children: Children.map(children, (child) => (_jsx(SwiperSlide, { children: child }))) }), _jsxs("div", { className: "swiper-controls", children: [navigation ? (_jsxs("div", { className: "swiper-navigation", children: [_jsx("div", { role: "button", ref: (node) => setPrevEl(node), className: "swiper-button swiper-button-prev", children: _jsx(ChevronLeft, {}) }), _jsx("div", { role: "button", ref: (node) => setNextEl(node), className: "swiper-button swiper-button-next", children: _jsx(ChevronRight, {}) })] })) : null, pagination ? (_jsx("div", { className: "swiper-pagination", ref: (node) => setPaginationEl(node) })) : null] })] }));
};
export default Carousel;

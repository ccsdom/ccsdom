import { jsx as _jsx } from "react/jsx-runtime";
import { lazy } from "react";
import { Outlet } from "react-router-dom";
// CUSTOM COMPONENTS
import Loadable from "./Loadable";
import MainLayout from "@/layouts/main/MainLayout";
// const Home = Loadable(lazy(() => import("@/pages/home")));
// ROLE BASED PERMISSION TEST PAGE
const Permission = Loadable(lazy(() => import("@/pages/permission")));
// FEATURES RELATED PAGES
const Faqs = Loadable(lazy(() => import("@/pages/faq")));
const Pricing = Loadable(lazy(() => import("@/pages/pricing")));
const Checkout = Loadable(lazy(() => import("@/pages/checkout")));
const ContactUs = Loadable(lazy(() => import("@/pages/contact-us")));
const ComingSoon = Loadable(lazy(() => import("@/pages/coming-soon")));
const Maintenance = Loadable(lazy(() => import("@/pages/maintenance")));
const CareerTwo = Loadable(lazy(() => import("@/pages/career/career-2")));
const AboutUsOne = Loadable(lazy(() => import("@/pages/about-us/about-us-1")));
export const PublicRoutes = [
    // { path: "home", element: <Home /> },
    { path: "permission", element: _jsx(Permission, {}) },
    { path: "maintenance", element: _jsx(Maintenance, {}) },
    {
        element: (_jsx(MainLayout, { children: _jsx(Outlet, {}) })),
        children: [
            { path: "about-us", element: _jsx(AboutUsOne, {}) },
            { path: "contact-us", element: _jsx(ContactUs, {}) },
            { path: "faqs", element: _jsx(Faqs, {}) },
            { path: "pricing", element: _jsx(Pricing, {}) },
            { path: "career", element: _jsx(CareerTwo, {}) },
            { path: "checkout", element: _jsx(Checkout, {}) },
            { path: "coming-soon", element: _jsx(ComingSoon, {}) },
        ],
    },
];

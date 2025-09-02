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
  { path: "permission", element: <Permission /> },
  { path: "maintenance", element: <Maintenance /> },
  {
    element: (
      <MainLayout>
        <Outlet />
      </MainLayout>
    ),
    children: [
      { path: "about-us", element: <AboutUsOne /> },
      { path: "contact-us", element: <ContactUs /> },
      { path: "faqs", element: <Faqs /> },
      { path: "pricing", element: <Pricing /> },
      { path: "career", element: <CareerTwo /> },
      { path: "checkout", element: <Checkout /> },
      { path: "coming-soon", element: <ComingSoon /> },
    ],
  },
];

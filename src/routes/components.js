import { jsx as _jsx } from "react/jsx-runtime";
import { lazy } from "react";
import { Outlet } from "react-router-dom";
// CUSTOM COMPONENTS
import Loadable from "./Loadable";
import MainLayout from "@/layouts/main/MainLayout";
// ALL MUI COMPONENT SHOWCASE PAGES
const Components = Loadable(lazy(() => import("@/pages/examples/components")));
const MuiChip = Loadable(lazy(() => import("@/pages/examples/mui/chip")));
const MuiList = Loadable(lazy(() => import("@/pages/examples/mui/list")));
const MuiMenu = Loadable(lazy(() => import("@/pages/examples/mui/menu")));
const MuiTabs = Loadable(lazy(() => import("@/pages/examples/mui/tabs")));
const MuiAlert = Loadable(lazy(() => import("@/pages/examples/mui/alert")));
const MuiBadge = Loadable(lazy(() => import("@/pages/examples/mui/badge")));
const MuiTable = Loadable(lazy(() => import("@/pages/examples/mui/table")));
const MuiRating = Loadable(lazy(() => import("@/pages/examples/mui/rating")));
const MuiSlider = Loadable(lazy(() => import("@/pages/examples/mui/slider")));
const MuiAvatar = Loadable(lazy(() => import("@/pages/examples/mui/avatar")));
const MuiDialog = Loadable(lazy(() => import("@/pages/examples/mui/dialog")));
const MuiSwitch = Loadable(lazy(() => import("@/pages/examples/mui/switch")));
const MuiTooltip = Loadable(lazy(() => import("@/pages/examples/mui/tooltip")));
const MuiButtons = Loadable(lazy(() => import("@/pages/examples/mui/buttons")));
const MuiPickers = Loadable(lazy(() => import("@/pages/examples/mui/pickers")));
const MuiPopover = Loadable(lazy(() => import("@/pages/examples/mui/popover")));
const MuiStepper = Loadable(lazy(() => import("@/pages/examples/mui/stepper")));
const MuiTimeline = Loadable(lazy(() => import("@/pages/examples/mui/timeline")));
const MuiSnackbar = Loadable(lazy(() => import("@/pages/examples/mui/snackbar")));
const MuiCheckbox = Loadable(lazy(() => import("@/pages/examples/mui/checkbox")));
const MuiProgress = Loadable(lazy(() => import("@/pages/examples/mui/progress")));
const MuiDataGrid = Loadable(lazy(() => import("@/pages/examples/mui/data-grid")));
const MuiTreeview = Loadable(lazy(() => import("@/pages/examples/mui/tree-view")));
const MuiAccordion = Loadable(lazy(() => import("@/pages/examples/mui/accordion")));
const MuiTextField = Loadable(lazy(() => import("@/pages/examples/mui/textfield")));
const MuiPagination = Loadable(lazy(() => import("@/pages/examples/mui/pagination")));
const MuiBreadcrumbs = Loadable(lazy(() => import("@/pages/examples/mui/breadcrumbs")));
const MuiRadioButton = Loadable(lazy(() => import("@/pages/examples/mui/radio-button")));
const MuiAutocomplete = Loadable(lazy(() => import("@/pages/examples/mui/autocomplete")));
const MuiTransferList = Loadable(lazy(() => import("@/pages/examples/mui/transfer-list")));
export const ComponentRoutes = [
    {
        path: "components",
        element: (_jsx(MainLayout, { children: _jsx(Outlet, {}) })),
        children: [
            { element: _jsx(Components, {}), index: true },
            { path: "accordion", element: _jsx(MuiAccordion, {}) },
            { path: "alert", element: _jsx(MuiAlert, {}) },
            { path: "autocomplete", element: _jsx(MuiAutocomplete, {}) },
            { path: "avatar", element: _jsx(MuiAvatar, {}) },
            { path: "badge", element: _jsx(MuiBadge, {}) },
            { path: "breadcrumbs", element: _jsx(MuiBreadcrumbs, {}) },
            { path: "buttons", element: _jsx(MuiButtons, {}) },
            { path: "checkbox", element: _jsx(MuiCheckbox, {}) },
            { path: "chip", element: _jsx(MuiChip, {}) },
            { path: "data-grid", element: _jsx(MuiDataGrid, {}) },
            { path: "dialog", element: _jsx(MuiDialog, {}) },
            { path: "list", element: _jsx(MuiList, {}) },
            { path: "menu", element: _jsx(MuiMenu, {}) },
            { path: "pagination", element: _jsx(MuiPagination, {}) },
            { path: "pickers", element: _jsx(MuiPickers, {}) },
            { path: "popover", element: _jsx(MuiPopover, {}) },
            { path: "progress", element: _jsx(MuiProgress, {}) },
            { path: "radio-button", element: _jsx(MuiRadioButton, {}) },
            { path: "rating", element: _jsx(MuiRating, {}) },
            { path: "slider", element: _jsx(MuiSlider, {}) },
            { path: "stepper", element: _jsx(MuiStepper, {}) },
            { path: "switch", element: _jsx(MuiSwitch, {}) },
            { path: "table", element: _jsx(MuiTable, {}) },
            { path: "tabs", element: _jsx(MuiTabs, {}) },
            { path: "textfield", element: _jsx(MuiTextField, {}) },
            { path: "timeline", element: _jsx(MuiTimeline, {}) },
            { path: "tooltip", element: _jsx(MuiTooltip, {}) },
            { path: "transfer-list", element: _jsx(MuiTransferList, {}) },
            { path: "tree-view", element: _jsx(MuiTreeview, {}) },
            { path: "snackbar", element: _jsx(MuiSnackbar, {}) },
        ],
    },
];

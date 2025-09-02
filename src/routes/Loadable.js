import { jsx as _jsx } from "react/jsx-runtime";
import { Suspense } from "react";
import { LoadingProgress } from "@/components/loader";
const Loadable = (Component) => (props) => {
    return (_jsx(Suspense, { fallback: _jsx(LoadingProgress, {}), children: _jsx(Component, { ...props }) }));
};
export default Loadable;

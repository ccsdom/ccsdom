import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from "react";
import Box from "@mui/material/Box";
import NProgress from "nprogress";
const LoadingProgress = () => {
    NProgress.configure({ showSpinner: false });
    useEffect(() => {
        NProgress.start();
        return () => {
            NProgress.done();
        };
    }, []);
    return _jsx(Box, { minHeight: "100vh" });
};
export default LoadingProgress;

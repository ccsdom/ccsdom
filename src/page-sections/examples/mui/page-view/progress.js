import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Grid, Stack, LinearProgress, CircularProgress } from "@mui/material";
// CUSTOM COMPONENTS
import ComponentPageLayout from "../../ComponentPageLayout";
import { Block } from "@/components/block";
const MuiProgressPageView = () => {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prevProgress) => prevProgress >= 100 ? 0 : prevProgress + 10);
        }, 800);
        return () => {
            clearInterval(timer);
        };
    }, []);
    const progressRef = useRef(() => { });
    const [buffer, setBuffer] = useState(10);
    const [bufferProgress, setBufferProgress] = useState(0);
    useEffect(() => {
        progressRef.current = () => {
            if (progress > 100) {
                setBufferProgress(0);
                setBuffer(10);
            }
            else {
                const diff = Math.random() * 10;
                const diff2 = Math.random() * 10;
                setBufferProgress(progress + diff);
                setBuffer(progress + diff + diff2);
            }
        };
    });
    useEffect(() => {
        const timer = setInterval(() => {
            progressRef.current();
        }, 500);
        return () => {
            clearInterval(timer);
        };
    }, []);
    return (_jsx(ComponentPageLayout, { title: "Progress", children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, lg: 6, xs: 12, children: _jsx(Block, { title: "Circular", children: _jsxs(Stack, { direction: "row", gap: 3, children: [_jsx(CircularProgress, { color: "primary" }), _jsx(CircularProgress, { color: "warning" }), _jsx(CircularProgress, { color: "error" }), _jsx(CircularProgress, { color: "success" }), _jsx(CircularProgress, { color: "inherit" })] }) }) }), _jsx(Grid, { item: true, lg: 6, xs: 12, children: _jsx(Block, { title: "Determinate", children: _jsxs(Stack, { direction: "row", gap: 3, children: [_jsx(CircularProgress, { variant: "determinate", value: 25 }), _jsx(CircularProgress, { variant: "determinate", value: 50 }), _jsx(CircularProgress, { variant: "determinate", value: 75 }), _jsx(CircularProgress, { variant: "determinate", value: 100 }), _jsx(CircularProgress, { variant: "determinate", value: progress })] }) }) }), _jsx(Grid, { item: true, lg: 6, xs: 12, children: _jsx(Block, { title: "Sizes", children: _jsxs(Stack, { alignItems: "center", direction: "row", gap: 3, children: [_jsx(CircularProgress, { size: 50, color: "primary" }), _jsx(CircularProgress, { size: 40, color: "primary" }), _jsx(CircularProgress, { size: 30, color: "primary" }), _jsx(CircularProgress, { size: 20, color: "primary" })] }) }) }), _jsx(Grid, { item: true, lg: 6, xs: 12, children: _jsx(Block, { title: "Linear", children: _jsxs(Stack, { gap: 3, children: [_jsx(LinearProgress, { color: "primary" }), _jsx(LinearProgress, { color: "warning" }), _jsx(LinearProgress, { color: "error" }), _jsx(LinearProgress, { color: "success" }), _jsx(LinearProgress, { color: "inherit" })] }) }) }), _jsx(Grid, { item: true, lg: 6, xs: 12, children: _jsx(Block, { title: "Determinate", children: _jsxs(Stack, { gap: 3, children: [_jsx(LinearProgress, { variant: "determinate", value: 25 }), _jsx(LinearProgress, { variant: "determinate", value: 50 }), _jsx(LinearProgress, { variant: "determinate", value: 75 }), _jsx(LinearProgress, { variant: "determinate", value: 100 }), _jsx(LinearProgress, { variant: "determinate", value: progress })] }) }) }), _jsx(Grid, { item: true, lg: 6, xs: 12, children: _jsx(Block, { title: "Buffer", children: _jsxs(Stack, { gap: 3, children: [_jsx(LinearProgress, { variant: "buffer", value: bufferProgress, valueBuffer: buffer }), _jsx(LinearProgress, { color: "error", variant: "buffer", value: bufferProgress, valueBuffer: buffer }), _jsx(LinearProgress, { color: "success", variant: "buffer", value: bufferProgress, valueBuffer: buffer }), _jsx(LinearProgress, { color: "warning", variant: "buffer", value: bufferProgress, valueBuffer: buffer }), _jsx(LinearProgress, { color: "inherit", variant: "buffer", value: bufferProgress, valueBuffer: buffer })] }) }) })] }) }));
};
export default MuiProgressPageView;

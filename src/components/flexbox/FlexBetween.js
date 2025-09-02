import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from "react";
import Box from "@mui/material/Box";
const FlexBetween = forwardRef(({ children, ...props }, ref) => (_jsx(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", ref: ref, ...props, children: children })));
export default FlexBetween;

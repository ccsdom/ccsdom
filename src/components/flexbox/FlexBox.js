import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from "react";
import Box from "@mui/material/Box";
const FlexBox = forwardRef(({ children, ...props }, ref) => (_jsx(Box, { display: "flex", ref: ref, ...props, children: children })));
export default FlexBox;

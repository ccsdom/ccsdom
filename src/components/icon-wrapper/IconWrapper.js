import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from "react";
import { styled } from "@mui/material";
// CUSTOM COMPONENT
import { FlexRowAlign } from "../flexbox";
// STYLED COMPONENT
const Wrapper = styled(FlexRowAlign)(({ theme }) => ({
    width: 40,
    height: 40,
    borderRadius: "5px",
    marginRight: "0.5rem",
    backgroundColor: theme.palette.primary[100],
}));
const IconWrapper = forwardRef(({ children, ...props }, ref) => (_jsx(Wrapper, { ref: ref, ...props, children: children })));
export default IconWrapper;

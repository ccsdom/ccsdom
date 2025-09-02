import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from "react";
// CUSTOM COMPONENT
import { Paragraph } from "../typography";
// STYLED COMPONENT
import { StyledCard } from "./styles";
// ==============================================================
const Block = forwardRef(({ title, children, bgTransparent = false, ...props }, ref) => (_jsxs(StyledCard, { ref: ref, bg: bgTransparent ? 1 : 0, ...props, children: [_jsx(Paragraph, { mb: 3, fontSize: 18, fontWeight: 600, children: title }), children] })));
export default Block;

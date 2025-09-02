import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from "react";
import { Link as RouterLink } from "react-router-dom";
// ==============================================================
const Link = forwardRef(({ href, ...others }, ref) => {
    return _jsx(RouterLink, { ref: ref, to: href, ...others });
});
export default Link;

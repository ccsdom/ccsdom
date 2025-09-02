import { jsx as _jsx } from "react/jsx-runtime";
import { SvgIcon } from "@mui/material";
const OvalIcon = (props) => {
    return (_jsx(SvgIcon, { viewBox: "0 0 14 14", ...props, children: _jsx("circle", { cx: "7", cy: "7", r: "6.5", 
            // fill="#61A9FF"
            fillOpacity: "0.06", stroke: "currentColor" }) }));
};
export default OvalIcon;

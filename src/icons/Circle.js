import { jsx as _jsx } from "react/jsx-runtime";
import { SvgIcon } from "@mui/material";
const Circle = (props) => {
    return (_jsx(SvgIcon, { viewBox: "0 0 24 24", ...props, children: _jsx("path", { d: "M22,12A10,10,0,1,1,12,2,10,10,0,0,1,22,12Z" }) }));
};
export default Circle;

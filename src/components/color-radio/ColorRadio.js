import { jsx as _jsx } from "react/jsx-runtime";
import { Radio, styled } from "@mui/material";
// STYLED COMPONENTS
const OuterBox = styled("div", {
    shouldForwardProp: (prop) => prop !== "color",
})(({ color }) => ({
    width: 25,
    height: 25,
    padding: "1px",
    borderRadius: "50%",
    border: `1.8px solid ${color || "transparent"}`,
}));
const InnerBox = styled("div")(({ color, theme }) => ({
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    backgroundColor: color || theme.palette.primary.main,
}));
// ==============================================================
const ColorRadio = ({ icon_color, ...props }) => (_jsx(Radio, { icon: _jsx(OuterBox, { children: _jsx(InnerBox, { color: icon_color }) }), checkedIcon: _jsx(OuterBox, { color: icon_color, children: _jsx(InnerBox, { color: icon_color }) }), sx: { padding: 0 }, ...props }));
export default ColorRadio;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment } from "react";
import Container from "@mui/material/Container";
// CUSTOM PAGE SECTION COMPONENTS
import Section1 from "../Section1";
import Section2 from "../Section2";
import Section3 from "../Section3";
import Section4 from "../Section4";
const AboutUs1PageView = () => {
    return (_jsxs(Fragment, { children: [_jsx(Section1, {}), _jsxs(Container, { maxWidth: "lg", children: [_jsx(Section2, {}), _jsx(Section3, {})] }), _jsx(Section4, {})] }));
};
export default AboutUs1PageView;

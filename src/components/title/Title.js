import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment } from "react";
// CUSTOM COMPONENTS
import { FlexBox } from "../flexbox";
import { Percentage } from "../percentage";
import { H6, Paragraph, Span } from "../typography";
// CUSTOM UTILS METHOD
import { numberFormat } from "@/utils/numberFormat";
// ==============================================================
const Title = ({ title, subtitle, percentage, titlePrefix, percentageType = "success", }) => {
    return (_jsxs(Fragment, { children: [_jsxs(FlexBox, { alignItems: "center", gap: 1, children: [_jsxs(H6, { children: [titlePrefix && (_jsx(Span, { fontWeight: 500, fontSize: 18, color: "grey.400", children: titlePrefix })), typeof title === "number" ? numberFormat(title) : title] }), _jsx(Percentage, { type: percentageType, children: percentage })] }), _jsx(Paragraph, { color: "text.secondary", children: subtitle })] }));
};
export default Title;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// CUSTOM COMPONENTS
import { FlexBox } from "@/components/flexbox";
import { Paragraph } from "@/components/typography";
import CheckCircleOutline from "@/icons/CheckCircleOutline";
// ==============================================================
const FeatureListItem = ({ title }) => {
    return (_jsxs(FlexBox, { alignItems: "center", gap: 1, children: [_jsx(CheckCircleOutline, { color: "success" }), _jsx(Paragraph, { fontSize: 16, children: title })] }));
};
export default FeatureListItem;

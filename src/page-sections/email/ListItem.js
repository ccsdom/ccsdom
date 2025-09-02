import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, useTheme } from "@mui/material";
// CUSTOM COMPONENTS
import { Paragraph } from "@/components/typography";
import { FlexBox, FlexRowAlign } from "@/components/flexbox";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
// =========================================================================
const ListItem = ({ Icon, title, subTitle, iconStyle = {}, titleStyle = {}, }) => {
    const theme = useTheme();
    const BG_COLOR = isDark(theme) ? "grey.700" : "grey.50";
    return (_jsxs(FlexBox, { alignItems: "center", gap: 1.5, children: [_jsx(FlexRowAlign, { width: 40, height: 40, borderRadius: 2, bgcolor: BG_COLOR, sx: iconStyle, children: Icon }), _jsxs(Box, { children: [_jsx(Paragraph, { lineHeight: 1, fontSize: 16, fontWeight: 600, sx: titleStyle, children: title }), subTitle && (_jsx(Paragraph, { color: "text.secondary", mt: 0.5, children: subTitle }))] })] }));
};
export default ListItem;

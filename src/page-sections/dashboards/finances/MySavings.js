import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, IconButton, Stack } from "@mui/material";
import { KeyboardArrowRightRounded } from "@mui/icons-material";
import { nanoid } from "nanoid";
// CUSTOM COMPONENTS
import ListItem from "./shared/ListItem";
import { FlexBetween } from "@/components/flexbox";
import { Paragraph } from "@/components/typography";
import { MoreButton } from "@/components/more-button";
// CUSTOM ICON COMPONENTS
import Health from "@/icons/Health";
import Emergency from "@/icons/Emergency";
import Investment from "@/icons/Investment";
import EducationTwo from "@/icons/EducationTwo";
// CUSTOM UTILS METHOD
import { numberFormat } from "@/utils/numberFormat";
// CUSTOM DUMMY DATA
const DATA = [
    {
        id: nanoid(),
        amount: 23560,
        Icon: Emergency,
        title: "Emergency",
        color: "primary.main",
    },
    {
        id: nanoid(),
        amount: 19489,
        Icon: Health,
        title: "Health",
        color: "success.500",
    },
    {
        id: nanoid(),
        amount: 18889,
        Icon: Investment,
        title: "Investment",
        color: "error.main",
    },
    {
        id: nanoid(),
        amount: 21489,
        Icon: EducationTwo,
        title: "Education",
        color: "warning.main",
    },
];
const MySavings = () => {
    return (_jsxs(Card, { sx: { p: 3, height: "100%" }, children: [_jsxs(FlexBetween, { mb: 4, children: [_jsx(Paragraph, { fontSize: 18, fontWeight: 500, children: "My Savings" }), _jsx(MoreButton, { size: "small" })] }), _jsx(Stack, { spacing: 1.5, children: DATA.map(({ id, amount, Icon, title, color }) => (_jsxs(FlexBetween, { children: [_jsx(ListItem, { subTitle: title, Icon: _jsx(Icon, { sx: { color } }), title: `$${numberFormat(amount)}`, titleStyle: { fontSize: 18, lineHeight: 1.5 }, iconStyle: { width: 48, height: 48, borderRadius: 3 } }), _jsx(IconButton, { children: _jsx(KeyboardArrowRightRounded, { sx: { color: "grey.400" } }) })] }, id))) })] }));
};
export default MySavings;

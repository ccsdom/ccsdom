import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, Card, styled } from "@mui/material";
import { North, South } from "@mui/icons-material";
import { nanoid } from "nanoid";
// CUSTOM COMPONENTS
import ListItem from "./shared/ListItem";
import { FlexBox } from "@/components/flexbox";
import { H6, Paragraph } from "@/components/typography";
// CUSTOM UTILS METHODS
import { isDark } from "@/utils/constants";
import { numberFormat } from "@/utils/numberFormat";
// STYLED COMPONENTS
const StyledCard = styled(Card)(({ theme }) => ({
    border: 0,
    padding: 3,
    position: "relative",
    background: "linear-gradient(103.35deg, #FFFFFF 63.76%, #EDEAFF 98.71%)",
    ...(isDark(theme) && { background: "auto" }),
}));
const ImageContainer = styled("div")(({ theme }) => ({
    right: 0,
    bottom: 0,
    position: "absolute",
    "& > img": { width: "100%" },
    [theme.breakpoints.down("sm")]: { display: "none" },
}));
// CUSTOM DUMMY DATA
const DATA = [
    {
        id: nanoid(),
        title: "Income",
        amount: 14210.15,
        Icon: _jsx(South, { color: "success", fontSize: "small" }),
    },
    {
        id: nanoid(),
        title: "Expance",
        amount: 7352.17,
        Icon: _jsx(North, { color: "error", fontSize: "small" }),
    },
];
const Balance = () => {
    return (_jsxs(StyledCard, { children: [_jsxs(Box, { p: 3, children: [_jsxs(H6, { lineHeight: 1, fontSize: 28, fontWeight: 600, children: ["$", numberFormat(21350.25)] }), _jsx(Paragraph, { color: "text.secondary", children: "My Balance" }), _jsx(FlexBox, { flexWrap: "wrap", alignItems: "center", gap: 3, py: 4, children: DATA.map(({ Icon, amount, id, title }) => (_jsx(ListItem, { Icon: Icon, title: numberFormat(amount), subTitle: title }, id))) }), _jsxs(FlexBox, { alignItems: "center", gap: 2, children: [_jsx(Button, { sx: { minWidth: 100 }, children: "Send" }), _jsx(Button, { variant: "outlined", color: "secondary", sx: { minWidth: 100 }, children: "Receive" })] })] }), _jsx(ImageContainer, { children: _jsx("img", { src: "/static/illustration/finance-balance.svg", alt: "my-balance" }) })] }));
};
export default Balance;

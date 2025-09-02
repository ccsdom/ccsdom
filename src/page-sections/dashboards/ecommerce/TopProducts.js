import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Table, Avatar, TableRow, TableBody, TableHead, TextField, } from "@mui/material";
import Search from "@mui/icons-material/Search";
import { nanoid } from "nanoid";
// CUSTOM COMPONENTS
import { Scrollbar } from "@/components/scrollbar";
import { MoreButton } from "@/components/more-button";
import { Paragraph, Small } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// CUSTOM UTILS METHODS
import { numberFormat } from "@/utils/numberFormat";
// COMMON DASHBOARD RELATED COMPONENT
import { BodyTableCell, HeadTableCell } from "../_common";
// CUSTOM DUMMY DATA SET
const DATA = [
    {
        id: nanoid(),
        price: 1799,
        sales: 17689,
        totalSold: 2389,
        title: "Apple Watch",
        image: "/static/products/apple-watch.png",
    },
    {
        id: nanoid(),
        price: 739,
        sales: 62397,
        totalSold: 6698,
        title: "Nike Shoes",
        image: "/static/products/shoe-1.png",
    },
    {
        id: nanoid(),
        price: 245,
        sales: 7658,
        totalSold: 300,
        title: "Ribbon Glass",
        image: "/static/products/sunglass.png",
    },
    {
        id: nanoid(),
        price: 139,
        sales: 6658,
        totalSold: 2389,
        title: "Apple Watch",
        image: "/static/products/headset.png",
    },
];
const TopProducts = () => {
    return (_jsxs(Card, { children: [_jsxs(FlexBetween, { p: 3, children: [_jsx(Paragraph, { fontSize: 18, fontWeight: 500, children: "Top Products" }), _jsxs(FlexBox, { gap: 1, alignItems: "center", children: [_jsx(TextField, { placeholder: "Search products...", InputProps: { startAdornment: _jsx(Search, {}) } }), _jsx(MoreButton, {})] })] }), _jsx(Scrollbar, { children: _jsxs(Table, { sx: { minWidth: 500 }, children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(HeadTableCell, { children: "PRODUCT NAME" }), _jsx(HeadTableCell, { children: "PRICE" }), _jsx(HeadTableCell, { align: "center", children: "SOLD" }), _jsx(HeadTableCell, { align: "center", children: "SALES" })] }) }), _jsx(TableBody, { children: DATA.map((item, index) => (_jsxs(TableRow, { children: [_jsx(BodyTableCell, { children: _jsxs(FlexBox, { gap: 1, children: [_jsx(Avatar, { variant: "rounded", src: item.image }), _jsxs("div", { children: [_jsx(Paragraph, { color: "text.primary", fontWeight: 500, children: item.title }), _jsxs(Small, { children: ["#", item.id.substring(0, 6)] })] })] }) }), _jsxs(BodyTableCell, { children: ["$", numberFormat(item.price)] }), _jsxs(BodyTableCell, { align: "center", children: [numberFormat(item.totalSold), " pcs"] }), _jsx(BodyTableCell, { align: "center", children: _jsxs(Paragraph, { color: "text.primary", fontWeight: 500, children: ["$", numberFormat(item.sales)] }) })] }, index))) })] }) })] }));
};
export default TopProducts;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Table, TableBody, TableHead, TableRow, LinearProgress, } from "@mui/material";
import { nanoid } from "nanoid";
// CUSTOM COMPONENTS
import { Scrollbar } from "@/components/scrollbar";
import { Paragraph } from "@/components/typography";
import { MoreButton } from "@/components/more-button";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// CUSTOM UTILS METHOD
import { numberFormat } from "@/utils/numberFormat";
// STYLED COMPONENTS
import { BodyTableCell, HeadTableCell } from "./styles";
// DUMMY DATA LIST
const DATA = [
    { id: nanoid(), keyword: "Admin Dashboard", click: 1369, value: 90 },
    { id: nanoid(), keyword: "Top Admin Dashboard", click: 1003, value: 80 },
    { id: nanoid(), keyword: "Admin Panel", click: 1987, value: 95 },
    { id: nanoid(), keyword: "Analytics Dashboard", click: 1462, value: 85 },
    { id: nanoid(), keyword: "Minimal Dashboard", click: 986, value: 75 },
    { id: nanoid(), keyword: "Clean UI Template", click: 1028, value: 90 },
    { id: nanoid(), keyword: "Logistics Dashboard", click: 369, value: 87 },
];
const TopQueries = () => {
    return (_jsxs(Card, { sx: { padding: 3, pb: 1 }, children: [_jsxs(FlexBetween, { mb: 4, children: [_jsxs("div", { children: [_jsx(Paragraph, { fontSize: 18, fontWeight: 500, children: "Top Queries" }), _jsx(Paragraph, { color: "text.secondary", children: "Counted in Millions" })] }), _jsx(MoreButton, { size: "small" })] }), _jsx(Scrollbar, { children: _jsxs(Table, { sx: { minWidth: 470 }, children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(HeadTableCell, { children: "KEYWORDS" }), _jsx(HeadTableCell, { children: "CLICKS" })] }) }), _jsx(TableBody, { children: DATA.map((item) => (_jsxs(TableRow, { children: [_jsx(BodyTableCell, { sx: { color: "grey.500" }, children: item.keyword }), _jsx(BodyTableCell, { children: _jsxs(FlexBox, { alignItems: "center", gap: 2, minWidth: 120, children: [_jsx(Paragraph, { color: "text.primary", fontWeight: 600, children: numberFormat(item.click) }), _jsx(LinearProgress, { value: item.value, variant: "determinate" })] }) })] }, item.id))) })] }) })] }));
};
export default TopQueries;

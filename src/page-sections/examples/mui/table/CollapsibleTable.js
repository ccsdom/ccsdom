import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Paper, Table, styled, TableRow, Collapse, TableBody, TableHead, TableCell, IconButton, TableContainer, } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Paragraph } from "@/components/typography";
import { Scrollbar } from "@/components/scrollbar";
import { isDark } from "@/utils/constants";
// styled components
const HeadTableCell = styled((props) => (_jsx(TableCell, { ...props, padding: "normal" })))(({ theme }) => ({
    fontWeight: 600,
    color: theme.palette.text.primary,
}));
function createData(name, calories, fat, carbs, protein, price) {
    return {
        name,
        calories,
        fat,
        carbs,
        protein,
        price,
        history: [
            { date: "2020-01-05", customerId: "11091700", amount: 3 },
            { date: "2020-01-02", customerId: "Anonymous", amount: 1 },
        ],
    };
}
const rows = [
    createData("Frozen yoghurt", 159, 6.0, 24, 4.0, 3.99),
    createData("Ice cream sandwich", 237, 9.0, 37, 4.3, 4.99),
    createData("Eclair", 262, 16.0, 24, 6.0, 3.79),
    createData("Cupcake", 305, 3.7, 67, 4.3, 2.5),
    createData("Gingerbread", 356, 16.0, 49, 3.9, 1.5),
];
function Row({ row }) {
    const [open, setOpen] = useState(false);
    return (_jsxs(_Fragment, { children: [_jsxs(TableRow, { children: [_jsx(TableCell, { padding: "normal", children: _jsx(IconButton, { size: "small", onClick: () => setOpen(!open), children: open ? _jsx(KeyboardArrowUp, {}) : _jsx(KeyboardArrowDown, {}) }) }), _jsx(TableCell, { padding: "normal", component: "th", scope: "row", children: row.name }), _jsx(TableCell, { padding: "normal", align: "right", children: row.calories }), _jsx(TableCell, { padding: "normal", align: "right", children: row.fat }), _jsx(TableCell, { padding: "normal", align: "right", children: row.carbs }), _jsx(TableCell, { padding: "normal", align: "right", children: row.protein })] }), _jsx(TableRow, { children: _jsx(TableCell, { padding: "normal", colSpan: 6, style: { paddingBottom: 0, paddingTop: 0 }, children: _jsx(Collapse, { in: open, timeout: "auto", unmountOnExit: true, children: _jsxs("div", { children: [_jsx(Paragraph, { fontWeight: 600, mx: 2, mb: 1, children: "History" }), _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { padding: "normal", children: "Date" }), _jsx(TableCell, { padding: "normal", children: "Customer" }), _jsx(TableCell, { padding: "normal", align: "right", children: "Amount" }), _jsx(TableCell, { padding: "normal", align: "right", children: "Total price ($)" })] }) }), _jsx(TableBody, { children: row.history.map((historyRow) => (_jsxs(TableRow, { children: [_jsx(TableCell, { padding: "normal", component: "th", scope: "row", children: historyRow.date }), _jsx(TableCell, { padding: "normal", children: historyRow.customerId }), _jsx(TableCell, { padding: "normal", align: "right", children: historyRow.amount }), _jsx(TableCell, { padding: "normal", align: "right", children: Math.round(historyRow.amount * row.price * 100) / 100 })] }, historyRow.date))) })] })] }) }) }) })] }));
}
const CollapsibleTable = () => {
    return (_jsx(TableContainer, { component: Paper, sx: { borderRadius: 2, boxShadow: 2 }, children: _jsx(Scrollbar, { children: _jsxs(Table, { children: [_jsx(TableHead, { sx: {
                            backgroundColor: (theme) => isDark(theme) ? "grey.700" : "grey.100",
                        }, children: _jsxs(TableRow, { children: [_jsx(HeadTableCell, {}), _jsx(HeadTableCell, { children: "Dessert (100g serving)" }), _jsx(HeadTableCell, { align: "right", children: "Calories" }), _jsx(HeadTableCell, { align: "right", children: "Fat\u00A0(g)" }), _jsx(HeadTableCell, { align: "right", children: "Carbs\u00A0(g)" }), _jsx(HeadTableCell, { align: "right", children: "Protein\u00A0(g)" })] }) }), _jsx(TableBody, { children: rows.map((row) => (_jsx(Row, { row: row }, row.name))) })] }) }) }));
};
export default CollapsibleTable;

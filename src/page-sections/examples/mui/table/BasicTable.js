import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Paper, Table, styled, TableRow, TableBody, TableCell, TableHead, TableContainer, } from "@mui/material";
import { Scrollbar } from "@/components/scrollbar";
import { isDark } from "@/utils/constants";
// data
const rows = [
    { name: "Eclair", calories: 262, fat: 16.0, carbs: 24, protein: 6.0 },
    { name: "Cupcake", calories: 305, fat: 3.7, carbs: 67, protein: 4.3 },
    { name: "Gingerbread", calories: 356, fat: 16.0, carbs: 49, protein: 3.9 },
    { name: "Frozen yoghurt", calories: 159, fat: 6.0, carbs: 24, protein: 4.0 },
    {
        name: "Ice cream sandwich",
        calories: 237,
        fat: 9.0,
        carbs: 37,
        protein: 4.3,
    },
];
// styled components
const HeadTableCell = styled((props) => (_jsx(TableCell, { ...props, padding: "normal" })))(({ theme }) => ({
    fontWeight: 600,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.grey[isDark(theme) ? 700 : 100],
}));
const BasicTable = () => {
    return (_jsx(TableContainer, { component: Paper, sx: { borderRadius: 2, boxShadow: 2 }, children: _jsx(Scrollbar, { children: _jsxs(Table, { sx: { minWidth: 650 }, children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(HeadTableCell, { children: "Dessert (100g serving)" }), _jsx(HeadTableCell, { align: "right", children: "Calories" }), _jsx(HeadTableCell, { align: "right", children: "Fat\u00A0(g)" }), _jsx(HeadTableCell, { align: "right", children: "Carbs\u00A0(g)" }), _jsx(HeadTableCell, { align: "right", children: "Protein\u00A0(g)" })] }) }), _jsx(TableBody, { children: rows.map((row) => (_jsxs(TableRow, { children: [_jsx(TableCell, { padding: "normal", component: "th", scope: "row", children: row.name }), _jsx(TableCell, { padding: "normal", align: "right", children: row.calories }), _jsx(TableCell, { padding: "normal", align: "right", children: row.fat }), _jsx(TableCell, { padding: "normal", align: "right", children: row.carbs }), _jsx(TableCell, { padding: "normal", align: "right", children: row.protein })] }, row.name))) })] }) }) }));
};
export default BasicTable;

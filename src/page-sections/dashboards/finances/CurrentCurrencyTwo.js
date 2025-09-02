import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Grid, useTheme, Stack } from "@mui/material";
import { AttachMoney, CurrencyPound, Euro } from "@mui/icons-material";
import { nanoid } from "nanoid";
import merge from "lodash.merge";
import Chart from "react-apexcharts";
// CUSTOM COMPONENTS
import ListItem from "./shared/ListItem";
import { FlexBetween } from "@/components/flexbox";
import { Paragraph } from "@/components/typography";
// CUSTOM UTILS METHODS
import { baseChartOptions } from "@/utils/baseChartOptions";
// DUMMY DATA SET
const DATA = [
    { id: nanoid(), title: "USD", Icon: AttachMoney, value1: 94.65, value2: 2.5 },
    { id: nanoid(), title: "EURO", Icon: Euro, value1: 26.37, value2: -1.56 },
    {
        id: nanoid(),
        title: "GBP",
        Icon: CurrencyPound,
        value1: 55.24,
        value2: 3.23,
    },
];
const CurrentCurrencyTwo = () => {
    const theme = useTheme();
    // REACT CHART CATEGORIES LABEL
    const chartCategories = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
    // REACT CHART DATA SERIES
    const chartSeries = [{ name: "Tasks", data: [22, 30, 46, 50, 46, 30, 22] }];
    // REACT CHART OPTIONS
    const chartOptions = merge(baseChartOptions(theme), {
        stroke: { show: false },
        xaxis: { categories: chartCategories },
        colors: [theme.palette.divider, theme.palette.primary.main],
        plotOptions: {
            bar: {
                borderRadius: 5,
                distributed: true,
                columnWidth: "40%",
                borderRadiusApplication: "end",
            },
        },
        tooltip: {
            y: {
                formatter: (val, { dataPointIndex, w }) => {
                    return `${w.globals.labels[dataPointIndex]} : ${val}`;
                },
            },
        },
    });
    return (_jsx(Card, { sx: { p: 3, height: "100%" }, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsxs(Grid, { item: true, sm: 6, xs: 12, children: [_jsx(Paragraph, { mb: 2, fontSize: 18, fontWeight: 500, children: "Current Currency" }), _jsx(Stack, { spacing: 2, children: DATA.map(({ Icon, id, title, value1, value2 }) => (_jsxs(FlexBetween, { children: [_jsx(ListItem, { title: title, Icon: _jsx(Icon, { fontSize: "small", color: title === "EURO"
                                                ? "success"
                                                : title === "GBP"
                                                    ? "warning"
                                                    : "primary" }) }), _jsxs("div", { children: [_jsxs(Paragraph, { fontWeight: 500, children: [value1, "%"] }), _jsxs(Paragraph, { textAlign: "end", color: value2 > 0 ? "success.500" : "error.main", children: [value2 > 0 && "+", value2, "%"] })] })] }, id))) })] }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsx(Chart, { type: "bar", series: chartSeries, options: chartOptions, height: 180 }) })] }) }));
};
export default CurrentCurrencyTwo;

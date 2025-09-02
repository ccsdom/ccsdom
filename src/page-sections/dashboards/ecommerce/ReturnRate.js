import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, useTheme } from "@mui/material";
import merge from "lodash.merge";
import Chart from "react-apexcharts";
// CUSTOM COMPONENTS
import { FlexBetween } from "@/components/flexbox";
import { MoreButton } from "@/components/more-button";
import { H6, Paragraph, Span } from "@/components/typography";
// CUSTOM UTILS METHOD
import { baseChartOptions } from "@/utils/baseChartOptions";
const ReturnRate = () => {
    const theme = useTheme();
    // REACT CHART CATEGORIES LABEL
    const chartCategories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    // REACT CHART DATA SERIES
    const chartSeries = [
        { name: "Returning", data: [20, 150, 75, 150, 300, 400] },
        { name: "New", data: [0, 250, 100, 17, 122, 18] },
    ];
    // REACT CHART OPTIONS
    const chartOptions = merge(baseChartOptions(theme), {
        colors: [theme.palette.success.main, theme.palette.primary.main],
        markers: { strokeColors: theme.palette.success.main },
        grid: {
            show: true,
            strokeDashArray: 3,
            borderColor: theme.palette.divider,
        },
        xaxis: {
            categories: chartCategories,
            labels: {
                show: true,
                style: { colors: theme.palette.text.secondary },
            },
            crosshairs: {
                show: true,
                fill: { color: theme.palette.success.main },
                stroke: { color: theme.palette.success.main },
            },
        },
        legend: { show: true, position: "top" },
        yaxis: {
            min: 0,
            max: 500,
            show: true,
            tickAmount: 5,
            labels: {
                style: { colors: theme.palette.text.secondary, fontWeight: 500 },
            },
        },
    });
    return (_jsxs(Card, { sx: { height: "100%" }, children: [_jsxs(FlexBetween, { p: 3, children: [_jsxs("div", { children: [_jsxs(H6, { fontSize: 22, lineHeight: 1.3, display: "flex", alignItems: "center", children: ["50.56%", _jsx(Span, { pl: 1, fontSize: 14, color: "success.main", children: "+2.5%" })] }), _jsx(Paragraph, { color: "text.secondary", children: "Returning Rate" })] }), _jsx(MoreButton, { size: "small" })] }), _jsx(Box, { px: 1, children: _jsx(Chart, { type: "line", height: 280, options: chartOptions, series: chartSeries, width: "100%" }) })] }));
};
export default ReturnRate;

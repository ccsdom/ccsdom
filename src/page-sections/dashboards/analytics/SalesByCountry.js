import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Grid, styled, useTheme } from "@mui/material";
import merge from "lodash.merge";
import Chart from "react-apexcharts";
import { VectorMap } from "@south-paw/react-vector-maps";
// CUSTOM COMPONENTS
import { FlexBetween } from "@/components/flexbox";
import { Paragraph } from "@/components/typography";
import { MoreButton } from "@/components/more-button";
// WORLD MAP DATA
import worldMap from "@/__fakeData__/map/worldMap.json";
// CUSTOM UTILS METHOD
import { baseChartOptions } from "@/utils/baseChartOptions";
// STYLED COMPONENTS
const MapWrapper = styled("div")(({ theme }) => ({
    height: "100%",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    svg: {
        stroke: "#fff",
        path: {
            outline: "none",
            cursor: "pointer",
            fill: theme.palette.grey[200],
            ":hover": { fill: theme.palette.primary.main },
        },
    },
}));
// ==============================================================
const SalesByCountry = ({ chartHorizontal }) => {
    const theme = useTheme();
    // REACT CHART CATEGORIES LABEL
    const chartCategories = ["AUS", "USA", "RSA", "BRA", "JAP", "UAE", "THI"];
    // REACT CHART DATA SERIES
    const chartSeries = [
        {
            name: "Tasks",
            data: [60, 40, 80, 60, 90, 70, 80],
        },
    ];
    // REACT CHART OPTIONS
    const chartOptions = merge(baseChartOptions(theme), {
        stroke: { show: false },
        xaxis: { categories: chartCategories },
        colors: [theme.palette.divider, theme.palette.primary.main],
        legend: {
            show: true,
            markers: { width: 0 },
            itemMargin: { horizontal: 15, ...(chartHorizontal && { vertical: 14 }) },
            labels: { colors: theme.palette.grey[400] },
            ...(chartHorizontal && { position: "left" }),
        },
        plotOptions: {
            bar: {
                borderRadius: 7,
                distributed: true,
                ...(chartHorizontal
                    ? { horizontal: true, barHeight: "30%" }
                    : { columnWidth: "30%", barHeight: "100%" }),
            },
        },
        tooltip: {
            y: {
                formatter: function (val, { dataPointIndex, w }) {
                    return `${w.globals.labels[dataPointIndex]} : ${val}`;
                },
            },
        },
    });
    return (_jsxs(Card, { sx: { p: 3, height: "100%", pb: 0 }, children: [_jsxs(FlexBetween, { children: [_jsxs("div", { children: [_jsx(Paragraph, { fontSize: 18, fontWeight: 500, children: "Sales by Country" }), _jsx(Paragraph, { color: "text.secondary", children: "Top 7 Countries" })] }), _jsx(MoreButton, { size: "medium" })] }), _jsxs(Grid, { container: true, height: "100%", children: [_jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(Chart, { type: "bar", height: 370, series: chartSeries, options: chartOptions }) }), _jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(MapWrapper, { children: _jsx(VectorMap, { ...worldMap }) }) })] })] }));
};
export default SalesByCountry;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, useTheme } from "@mui/material";
import merge from "lodash.merge";
import Chart from "react-apexcharts";
// CUSTOM COMPONENTS
import { FlexBetween } from "@/components/flexbox";
import { Paragraph } from "@/components/typography";
import { MoreButton } from "@/components/more-button";
// CUSTOM UTILS METHOD
import { baseChartOptions } from "@/utils/baseChartOptions";
const AvgCallDuration = () => {
    const theme = useTheme();
    // REACT CHART CATEGORIES LABEL
    const chartCategories = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
    // REACT CHART DATA SERIES
    const chartSeries = [
        {
            name: "Tasks",
            data: [70, 60, 90, 80, 100, 70, 80],
        },
    ];
    // REACT CHART OPTIONS
    const chartOptions = merge(baseChartOptions(theme), {
        stroke: { show: true },
        colors: [theme.palette.primary.main, theme.palette.primary[100]],
        xaxis: { categories: chartCategories, crosshairs: { show: true } },
    });
    return (_jsxs(Card, { children: [_jsxs(Box, { p: 3, children: [_jsxs(FlexBetween, { pb: 3, children: [_jsx(Paragraph, { fontSize: 18, fontWeight: 500, children: "Avg. Call Duration" }), _jsx(MoreButton, { size: "small" })] }), _jsx(Paragraph, { lineHeight: 1.2, fontSize: 20, fontWeight: 500, color: "primary.main", children: "10m: 52s" }), _jsx(Paragraph, { color: "text.secondary", children: "Base on 100 calls" })] }), _jsx(Box, { sx: { "& > div": { minHeight: "0px !important" } }, children: _jsx(Chart, { type: "area", options: chartOptions, series: chartSeries, height: 150 }) })] }));
};
export default AvgCallDuration;

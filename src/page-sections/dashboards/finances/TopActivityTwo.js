import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, useTheme } from "@mui/material";
import merge from "lodash.merge";
import Chart from "react-apexcharts";
// CUSTOM COMPONENTS
import { FlexBetween } from "@/components/flexbox";
import { Paragraph } from "@/components/typography";
import { MoreButton } from "@/components/more-button";
// CUSTOM UTILS METHOD
import { baseChartOptions } from "@/utils/baseChartOptions";
const TopActivityTwo = () => {
    const theme = useTheme();
    // REACT CHART OPTIONS
    const chartOptions = merge(baseChartOptions(theme), {
        labels: ["Asia", "Europe", "Africa"],
        colors: [
            theme.palette.primary.main,
            theme.palette.grey[400],
            theme.palette.grey[300],
        ],
        stroke: { width: 0 },
        legend: {
            show: true,
            fontSize: "14px",
            position: "bottom",
            itemMargin: { horizontal: 10 },
            onItemClick: { toggleDataSeries: false },
            onItemHover: { highlightDataSeries: false },
        },
        tooltip: {
            style: { fontSize: "14px" },
            y: { title: (name) => name, formatter: (val) => `${val}` },
        },
    });
    return (_jsxs(Card, { sx: { p: 3, height: "100%" }, children: [_jsxs(FlexBetween, { mb: 4, children: [_jsx(Paragraph, { fontSize: 18, fontWeight: 500, children: "Top Activity" }), _jsx(MoreButton, { size: "small" })] }), _jsx("div", { children: _jsx(Chart, { type: "pie", series: [55, 45, 33], options: chartOptions }) })] }));
};
export default TopActivityTwo;

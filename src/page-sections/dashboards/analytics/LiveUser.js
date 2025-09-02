import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Card, useTheme } from "@mui/material";
import merge from "lodash.merge";
import Chart from "react-apexcharts";
import { useTranslation } from "react-i18next";
// CUSTOM COMPONENTS
import { FlexBetween } from "@/components/flexbox";
import { MoreButton } from "@/components/more-button";
import { H6, Paragraph, Span } from "@/components/typography";
// CUSTOM UTILS METHODS
import { baseChartOptions } from "@/utils/baseChartOptions";
const LiveUser = () => {
    const theme = useTheme();
    const { t } = useTranslation();
    // REACT CHART DATA SERIES
    const chartSeries = [
        {
            name: "Tasks",
            data: [22, 30, 46, 50, 46, 30, 22],
        },
    ];
    // REACT CHART CATEGORIES LABEL
    const chartCategories = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
    // REACT CHART OPTIONS
    const chartOptions = merge(baseChartOptions(theme), {
        stroke: { show: false },
        xaxis: { categories: chartCategories },
        colors: [theme.palette.divider, theme.palette.primary.main],
        plotOptions: {
            bar: { borderRadius: 7, columnWidth: "40%", distributed: true },
        },
        tooltip: {
            y: {
                formatter: (val, { dataPointIndex, w }) => {
                    return `${w.globals.labels[dataPointIndex]} : ${val}`;
                },
            },
        },
    });
    return (_jsxs(Card, { sx: { p: 3, height: "100%" }, children: [_jsxs(FlexBetween, { children: [_jsxs("div", { children: [_jsx(Paragraph, { color: "text.secondary", children: t("Live Online User") }), _jsx(H6, { children: "348" })] }), _jsx(MoreButton, { size: "small" })] }), _jsxs(Paragraph, { mt: 4, children: [t("Page views"), " ", _jsx(Span, { color: "text.secondary", children: "/ Second" })] }), _jsx(Chart, { type: "bar", options: chartOptions, series: chartSeries, height: 250 }), _jsx(Button, { color: "secondary", sx: { width: "100%" }, children: t("View Details") })] }));
};
export default LiveUser;

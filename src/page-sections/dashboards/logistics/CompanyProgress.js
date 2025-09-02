import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, useTheme } from "@mui/material";
import merge from "lodash.merge";
import Chart from "react-apexcharts";
// CUSTOM COMPONENTS
import { Paragraph } from "@/components/typography";
import { Percentage } from "@/components/percentage";
import { MoreButton } from "@/components/more-button";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// CUSTOM UTILS METHOD
import { baseChartOptions } from "@/utils/baseChartOptions";
const CompanyProgress = () => {
    const theme = useTheme();
    // REACT CHART DATA SERIES
    const chartSeries = [
        {
            name: "Sales",
            data: [8000, 4000, 4500, 17000, 18000, 40000, 18000, 10000, 6000, 20000],
        },
    ];
    // REACT CHART CATEGORIES LABEL
    const chartCategories = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    // REACT CHART OPTIONS
    const chartOptions = merge(baseChartOptions(theme), {
        grid: {
            show: true,
            strokeDashArray: 3,
            borderColor: theme.palette.divider,
        },
        colors: [
            theme.palette.primary.main,
            theme.palette.primary[300],
            theme.palette.primary[100],
        ],
        xaxis: {
            categories: chartCategories,
            crosshairs: { show: true },
            labels: { show: true, style: { colors: theme.palette.text.secondary } },
        },
        yaxis: {
            min: 0,
            show: true,
            max: 50000,
            tickAmount: 5,
            labels: {
                formatter: (value) => value / 1000 + "K",
                style: { colors: theme.palette.text.secondary },
            },
        },
    });
    return (_jsxs(Card, { sx: { pt: 3, px: 2, pb: 1 }, children: [_jsxs(FlexBetween, { px: 2, children: [_jsx(Paragraph, { fontSize: 18, fontWeight: 500, children: "Company Progress" }), _jsx(MoreButton, { size: "small" })] }), _jsxs(FlexBox, { p: 2, gap: 2, alignItems: "center", flexWrap: "wrap", children: [_jsxs("div", { children: [_jsxs(FlexBox, { alignItems: "center", gap: 1, children: [_jsx(Paragraph, { fontWeight: 600, fontSize: 22, color: "primary.main", children: "$18,469" }), _jsx(Percentage, { type: "error", children: "-2.37%" })] }), _jsx(Paragraph, { color: "text.secondary", children: "This month" })] }), _jsxs("div", { children: [_jsxs(FlexBox, { alignItems: "center", gap: 1, children: [_jsx(Paragraph, { fontWeight: 600, fontSize: 22, children: "$22,356" }), _jsx(Percentage, { children: "+4.67%" })] }), _jsx(Paragraph, { color: "text.secondary", children: "Last month" })] })] }), _jsx(Chart, { type: "area", height: 270, series: chartSeries, options: chartOptions })] }));
};
export default CompanyProgress;

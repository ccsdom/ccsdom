import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, Stack, styled, useTheme } from "@mui/material";
import merge from "lodash.merge";
import Chart from "react-apexcharts";
// CUSTOM COMPONENTS
import { Percentage } from "@/components/percentage";
import { MoreButton } from "@/components/more-button";
import { H6, Paragraph } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// CUSTOM UTILS METHODS
import { format } from "@/utils/currency";
import { baseChartOptions } from "@/utils/baseChartOptions";
// STYLED COMPONENTS
const ChartWrapper = styled("div")({
    paddingInline: 8,
    "& .apexcharts-tooltip-text-y-value": { marginLeft: 0 },
    "& .apexcharts-xaxistooltip": { display: "none !important" },
});
const TopContentWrapper = styled(FlexBetween)(({ theme }) => ({
    [theme.breakpoints.down(730)]: {
        flexDirection: "column",
        "& .list-item": { flex: 1 },
        "& .list": { width: "100%" },
        "& > button": { display: "none" },
    },
}));
const BoxWrapper = styled("div", {
    shouldForwardProp: (prop) => prop !== "active",
})(({ theme, active }) => ({
    padding: "1.5rem",
    cursor: "pointer",
    borderRadius: "0 0 12px 12px",
    ...(active && { backgroundColor: theme.palette.action.selected }),
}));
const ChartFilters = () => {
    const LIST = ["E-mail", "Social", "TV", "Google Ads", "Courses", "Holiday"];
    const theme = useTheme();
    const [selectedItem, setSelectedItem] = useState(LIST[0]);
    const handleChange = (id) => () => setSelectedItem(id);
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
            crosshairs: { show: true },
            categories: chartCategories,
            labels: { show: true, style: { colors: theme.palette.text.secondary } },
        },
        yaxis: {
            min: 0,
            show: true,
            max: 50000,
            tickAmount: 5,
            labels: {
                formatter: (value) => format(value),
                style: { colors: theme.palette.text.secondary },
            },
        },
        tooltip: {
            y: {
                formatter: function (val, { dataPointIndex, w }) {
                    return `${w.globals.categoryLabels[dataPointIndex]} : $${format(val)}`;
                },
            },
        },
    });
    return (_jsxs(Card, { children: [_jsxs(TopContentWrapper, { gap: 4, children: [_jsx(Stack, { className: "list", gap: 1, direction: { sm: "row", xs: "column" }, children: LIST.map((item) => (_jsx(BoxWrapper, { className: "list-item", onClick: handleChange(item), active: selectedItem === item ? 1 : 0, children: _jsx(Paragraph, { ellipsis: true, fontWeight: 500, color: "text.secondary", children: item }) }, item))) }), _jsx(MoreButton, { size: "small", sx: { mr: 3 } })] }), _jsxs(FlexBox, { columnGap: 6, rowGap: 2, alignItems: "center", flexWrap: "wrap", px: 3, pt: 3, pb: 1, children: [_jsxs("div", { children: [_jsxs(FlexBox, { alignItems: "center", gap: 1, children: [_jsxs(H6, { fontSize: 24, lineHeight: 1, children: ["$", format(10000)] }), _jsx(Percentage, { type: "error", children: "-3.25%" })] }), _jsx(Paragraph, { color: "text.secondary", children: "Last Month Social Campaign" })] }), _jsxs("div", { children: [_jsxs(FlexBox, { alignItems: "center", gap: 1, children: [_jsxs(H6, { fontSize: 24, lineHeight: 1, children: ["$", format(18000)] }), _jsx(Percentage, { type: "success", children: "+4.67%" })] }), _jsx(Paragraph, { color: "text.secondary", children: "This Month Social Campaign" })] })] }), _jsx(ChartWrapper, { children: _jsx(Chart, { type: "area", height: 290, series: chartSeries, options: chartOptions }) })] }));
};
export default ChartFilters;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, useTheme } from "@mui/material";
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
const YoutubeCampaign = () => {
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
                borderRadius: 10,
                distributed: true,
                columnWidth: "50%",
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
    return (_jsxs(Card, { children: [_jsxs(FlexBetween, { p: 3, children: [_jsxs("div", { children: [_jsx(Paragraph, { ellipsis: true, lineHeight: 1.3, fontSize: 18, fontWeight: 500, children: "YouTube Campaign" }), _jsx(Paragraph, { color: "text.secondary", children: "Active Campaign" })] }), _jsx(MoreButton, { size: "small" })] }), _jsxs(FlexBetween, { flexWrap: "wrap", px: 3, pt: 2, pb: 1, children: [_jsxs("div", { children: [_jsxs(FlexBox, { alignItems: "center", gap: 1, children: [_jsx(H6, { fontSize: 22, lineHeight: 1, children: format(500000) }), _jsx(Percentage, { type: "error", children: "-10.25%" })] }), _jsx(Paragraph, { color: "text.secondary", children: "Subscribers" })] }), _jsxs("div", { children: [_jsxs(FlexBox, { alignItems: "center", gap: 1, children: [_jsx(H6, { fontSize: 22, lineHeight: 1, children: format(1000000) }), _jsx(Percentage, { type: "success", children: "+4.67%" })] }), _jsx(Paragraph, { color: "text.secondary", children: "Subscribers Goal" })] })] }), _jsx(Chart, { type: "bar", series: chartSeries, options: chartOptions, height: 230 })] }));
};
export default YoutubeCampaign;

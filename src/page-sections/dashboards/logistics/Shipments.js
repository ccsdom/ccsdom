import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, Grid, styled, Avatar, useTheme, AvatarGroup, LinearProgress, } from "@mui/material";
import merge from "lodash.merge";
import Chart from "react-apexcharts";
// CUSTOM COMPONENTS
import { Percentage } from "@/components/percentage";
import { MoreButton } from "@/components/more-button";
import { H6, Paragraph } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// CUSTOM UTILS METHODS
import { format } from "@/utils/currency";
import { isDark } from "@/utils/constants";
import { baseChartOptions } from "@/utils/baseChartOptions";
// STYLED COMPONENTS
const CardWrapper = styled(Card)(({ theme }) => ({
    padding: 24,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    boxShadow: theme.shadows[0],
    justifyContent: "space-between",
    backgroundColor: theme.palette.grey[isDark(theme) ? 900 : 50],
}));
const Shipments = () => {
    const theme = useTheme();
    // REACT CHART CATEGORIES LABEL
    const chartCategories = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
    // REACT CHART DATA SERIES
    const chartSeries = [{ name: "Sales", data: [6, 15, 10, 17, 12, 19, 10] }];
    // REACT CHART OPTIONS
    const chartOptions = merge(baseChartOptions(theme), {
        colors: [theme.palette.common.white],
        markers: { strokeColors: theme.palette.common.white },
        grid: {
            show: true,
            strokeDashArray: 3,
            borderColor: theme.palette.primary[400],
        },
        xaxis: {
            categories: chartCategories,
            labels: { show: false },
            crosshairs: {
                show: true,
                fill: { color: theme.palette.common.white },
                stroke: { color: theme.palette.common.white },
            },
        },
        yaxis: {
            min: 0,
            max: 20,
            show: true,
            tickAmount: 2,
            labels: {
                style: { colors: theme.palette.common.white, fontWeight: 500 },
            },
        },
    });
    // TOTAL SHIPMENTS REACT CHART OPTIONS
    const totalShipmentChartOptions = merge(baseChartOptions(theme), {
        stroke: { show: false },
        xaxis: { categories: chartCategories },
        colors: [theme.palette.divider, theme.palette.primary.main],
        plotOptions: {
            bar: {
                borderRadius: 5,
                distributed: true,
                columnWidth: "70%",
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
    return (_jsxs(Card, { sx: { height: "100%" }, children: [_jsxs(Box, { bgcolor: "primary.main", p: 3, pb: 8, children: [_jsxs(FlexBetween, { children: [_jsx(Paragraph, { color: "white", ellipsis: true, fontSize: 18, fontWeight: 500, children: "Last Month Shipment" }), _jsx(MoreButton, { size: "small" })] }), _jsx(Chart, { type: "line", height: 130, options: chartOptions, series: chartSeries, width: "100%" })] }), _jsx(Box, { p: 3, mt: -11, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsxs(CardWrapper, { children: [_jsx(Heading, { percentage: "+4.67%", title: `$${format(50000)}`, subtitle: "Total Online Sales" }), _jsxs(Box, { mt: 4, children: [_jsxs(FlexBetween, { mb: 1, children: [_jsx(Paragraph, { fontSize: 12, fontWeight: 600, children: "$100K to Goal" }), _jsx(Paragraph, { fontSize: 12, color: "text.secondary", children: "75%" })] }), _jsx(LinearProgress, { value: 60, color: "primary", variant: "determinate", sx: { height: 8 } })] })] }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsxs(CardWrapper, { children: [_jsx(Heading, { percentage: "+2.19%", subtitle: "Total Shipments", title: `$${format(12650, "0a.00")}` }), _jsx(Box, { mb: -3, mx: -1, children: _jsx(Chart, { type: "bar", height: 100, series: chartSeries, options: totalShipmentChartOptions }) })] }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsxs(CardWrapper, { children: [_jsx(Heading, { percentage: "+3.33%", subtitle: "Monthly Earning", title: `$${format(5000)}` }), _jsx(Box, { mb: -3, mx: -1, children: _jsx(Chart, { type: "bar", height: 100, series: chartSeries, options: totalShipmentChartOptions }) })] }) }), _jsx(Grid, { item: true, sm: 6, xs: 12, children: _jsxs(CardWrapper, { children: [_jsx(Heading, { percentage: "-1.9%", percentageType: "error", subtitle: "New Customer", title: `$${format(568)}` }), _jsxs(Box, { mt: 4, children: [_jsx(Paragraph, { mb: 0.5, fontWeight: 500, children: "Top Customers" }), _jsxs(AvatarGroup, { max: 4, children: [_jsx(Avatar, { alt: "Remy Sharp", src: "/static/user/user-11.png" }), _jsx(Avatar, { alt: "Travis Howard", src: "/static/user/user-10.png" }), _jsx(Avatar, { alt: "Cindy Baker", src: "/static/user/user-13.png" }), _jsx(Avatar, { alt: "Agnes Walker", src: "/static/user/user-14.png" }), _jsx(Avatar, { alt: "Trevor Henderson", src: "/static/user/user-15.png" })] })] })] }) })] }) })] }));
};
const Heading = ({ title, percentage, subtitle, percentageType = "success", }) => {
    return (_jsxs("div", { children: [_jsxs(FlexBox, { alignItems: "center", gap: 1, children: [_jsx(H6, { fontSize: 24, lineHeight: 1, children: title }), _jsx(Percentage, { type: percentageType, children: percentage })] }), _jsx(Paragraph, { color: "text.secondary", children: subtitle })] }));
};
export default Shipments;

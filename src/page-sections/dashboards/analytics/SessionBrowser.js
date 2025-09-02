import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, Box, Card, styled, useTheme } from "@mui/material";
import { nanoid } from "nanoid";
import merge from "lodash.merge";
import Chart from "react-apexcharts";
import { useTranslation } from "react-i18next";
// CUSTOM COMPONENTS
import { Paragraph } from "@/components/typography";
import { MoreButton } from "@/components/more-button";
import { FlexBetween, FlexBox, FlexRowAlign } from "@/components/flexbox";
// CUSTOM UTILS METHOD
import { baseChartOptions } from "@/utils/baseChartOptions";
// STYLED COMPONENT
const StyledChart = styled(Chart)({ marginBottom: 24 });
// CUSTOM DUMMY DATA
const DATA = [
    {
        id: nanoid(),
        value: 3.19,
        percentage: 60,
        title: "Chrome",
        color: "primary.main",
        image: "/static/browser/chrome.svg",
    },
    {
        id: nanoid(),
        value: -1.98,
        percentage: 10,
        title: "Opera Mini",
        color: "success.500",
        image: "/static/browser/opera.svg",
    },
    {
        id: nanoid(),
        value: 2.23,
        percentage: 30,
        title: "Mozilla",
        color: "grey.400",
        image: "/static/browser/mozilla.svg",
    },
];
const SessionBrowser = () => {
    const theme = useTheme();
    const { t } = useTranslation();
    // REACT CHART OPTIONS
    const chartOptions = merge(baseChartOptions(theme), {
        stroke: { show: false },
        labels: ["Chrome", "Opera Mini", "Firefox", "Yahoo!"],
        plotOptions: { pie: { donut: { size: "75%" }, expandOnClick: false } },
        tooltip: {
            y: {
                formatter: (val) => String(val),
                title: { formatter: (series) => series },
            },
        },
        colors: [
            theme.palette.grey[500],
            theme.palette.primary.main,
            theme.palette.success[500],
            theme.palette.success.main,
        ],
    });
    return (_jsxs(Card, { sx: { height: "100%" }, children: [_jsxs(FlexBetween, { p: 3, children: [_jsx(Paragraph, { fontSize: 18, fontWeight: 500, children: t("Session by browser") }), _jsx(MoreButton, { size: "small" })] }), _jsx(StyledChart, { height: 172, type: "donut", options: chartOptions, series: [50, 30, 20, 40] }), DATA.map((item) => (_jsxs(FlexBox, { px: 3, py: 2, alignItems: "center", borderTop: "1px dashed", borderColor: "divider", children: [_jsxs(FlexBox, { alignItems: "center", gap: 1, minWidth: 120, children: [_jsx(Avatar, { variant: "square", src: item.image, sx: { width: 30, height: 30 } }), _jsx(Paragraph, { fontWeight: 500, children: item.title })] }), _jsxs(FlexRowAlign, { gap: 1, flexGrow: 1, children: [_jsx(Box, { width: 8, height: 8, borderRadius: "50%", bgcolor: item.color }), _jsxs(Paragraph, { color: "text.secondary", fontWeight: 500, children: [item.percentage, "%"] })] }), _jsxs(Paragraph, { color: item.value > 0 ? "success.main" : "error.main", children: [item.value, "%"] })] }, item.id)))] }));
};
export default SessionBrowser;

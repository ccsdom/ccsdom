import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, Stack, useTheme } from "@mui/material";
import merge from "lodash.merge";
import Chart from "react-apexcharts";
// CUSTOM COMPONENTS
import { FlexBetween } from "@/components/flexbox";
import { Paragraph } from "@/components/typography";
import { MoreButton } from "@/components/more-button";
// CUSTOM UTILS METHODS
import { baseChartOptions } from "@/utils/baseChartOptions";
import { isDark } from "@/utils/constants";
const WalletSummery = () => {
    const theme = useTheme();
    // REACT CHART OPTIONS
    const chartOptions = (base, track) => {
        return merge(baseChartOptions(theme), {
            labels: ["Audits"],
            colors: [base],
            plotOptions: {
                radialBar: {
                    track: { background: track },
                    dataLabels: {
                        name: { show: false },
                        value: { color: base, fontWeight: 500, offsetY: 6 },
                    },
                    hollow: {
                        size: "40%",
                        dropShadow: { enabled: true, opacity: 0.2 },
                    },
                },
            },
        });
    };
    return (_jsxs(Card, { sx: { p: 3, height: "100%" }, children: [_jsxs(FlexBetween, { mb: 4, children: [_jsxs("div", { children: [_jsx(Paragraph, { fontSize: 18, fontWeight: 500, children: "Wallet Summery" }), _jsx(Paragraph, { color: "text.secondary", children: "Last 7 days reports" })] }), _jsx(MoreButton, { size: "small" })] }), _jsxs(Stack, { spacing: 3, children: [_jsxs(FlexBetween, { sx: {
                            borderRadius: 3,
                            backgroundColor: isDark(theme) ? "grey.700" : "primary.25",
                        }, children: [_jsxs(Box, { pl: 3, children: [_jsx(Paragraph, { fontSize: 16, fontWeight: 600, children: "$2,160.36" }), _jsx(Paragraph, { color: "text.secondary", fontWeight: 500, children: "Income" })] }), _jsx(Chart, { width: 130, height: 140, series: [70], type: "radialBar", options: chartOptions(theme.palette.primary.main, theme.palette.primary[100]) })] }), _jsxs(FlexBetween, { sx: {
                            borderRadius: 3,
                            backgroundColor: isDark(theme) ? "grey.700" : "primary.25",
                        }, children: [_jsxs(Box, { pl: 3, children: [_jsx(Paragraph, { fontSize: 16, fontWeight: 600, children: "$850.65" }), _jsx(Paragraph, { color: "text.secondary", fontWeight: 500, children: "Outcome" })] }), _jsx(Chart, { width: 130, height: 140, series: [30], type: "radialBar", options: chartOptions(theme.palette.grey[500], theme.palette.grey[200]) })] })] })] }));
};
export default WalletSummery;

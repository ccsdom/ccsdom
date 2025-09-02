import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, Stack, Table, styled, Button, Divider, useTheme, TableRow, TableBody, TableHead, Select, MenuItem, } from "@mui/material";
// CUSTOM COMPONENTS
import { Scrollbar } from "@/components/scrollbar";
import { FlexBetween } from "@/components/flexbox";
import { H6, Paragraph, Span } from "@/components/typography";
// CUSTOM ICON COMPONENTS
import ChartIcon from "@/icons/ChartIcon";
import DownloadTo from "@/icons/DownloadTo";
import ReceiptOutlined from "@/icons/ReceiptOutlined";
import ChartDonut from "@/icons/sidebar/ChartDonutIcon";
// COMMON STYLED COMPONENTS
import { BodyTableCellV2, BodyTableRow, HeadTableCell } from "./common/styles";
// CUSTOM UTILS METHOD
import { format } from "@/utils/currency";
// STYLED COMPONENTS
const EarningBoxWrapper = styled(FlexBetween)(({ theme }) => ({
    [theme.breakpoints.down(555)]: {
        flexDirection: "column",
        "& > .MuiButton-root": { width: "100%" },
    },
    [theme.breakpoints.down(706)]: {
        "& > .MuiButton-root": { marginTop: 16 },
    },
}));
const StyledStack = styled(Stack)(({ theme }) => ({
    [theme.breakpoints.down(555)]: {
        width: "100%",
        flexDirection: "column",
        "& > .MuiBox-root": { marginLeft: 0, width: "100%", marginBottom: 16 },
    },
}));
const EarningBox = styled("div")(({ theme }) => ({
    width: 130,
    paddingTop: 8,
    paddingBottom: 8,
    textAlign: "center",
    borderRadius: "8px",
    border: `1px solid ${theme.palette.grey[200]}`,
}));
const BodyTableCell = styled(BodyTableCellV2)(() => ({
    "&:first-of-type": { fontWeight: 500 },
    "&:last-of-type": { maxWidth: 100 },
}));
const StyledHeadTableCell = styled(HeadTableCell)({
    "&:last-of-type": { maxWidth: 100 },
});
const Statements = () => {
    const theme = useTheme();
    // CUSTOM DUMMY DATA SET
    const EARNING_LIST = [
        {
            id: 1,
            amount: 4550,
            Icon: ChartIcon,
            name: "Net Earnings",
            iconColor: theme.palette.primary.main,
        },
        {
            id: 2,
            amount: 80,
            name: "Change",
            Icon: ChartDonut,
            iconColor: theme.palette.warning.main,
        },
        {
            id: 3,
            amount: 2800,
            name: "Fees",
            Icon: ReceiptOutlined,
            iconColor: theme.palette.info.main,
        },
    ];
    return (_jsxs(Card, { sx: { pb: 2 }, children: [_jsx(H6, { fontSize: 14, padding: 3, children: "Earnings" }), _jsx(Divider, {}), _jsxs(Box, { padding: 3, children: [_jsxs(Paragraph, { color: "grey.500", children: ["Last ", _jsx(Span, { color: "primary.main", children: "15" }), " day earnings calculated"] }), _jsxs(EarningBoxWrapper, { flexWrap: "wrap", pt: 2, children: [_jsx(StyledStack, { direction: "row", flexWrap: "wrap", spacing: 2, children: EARNING_LIST.map(({ id, Icon, amount, iconColor, name }) => (_jsxs(EarningBox, { children: [_jsx(Icon, { sx: { color: iconColor } }), _jsxs(H6, { fontSize: 14, my: 0.5, children: ["$", format(amount, "0,0")] }), _jsx(Paragraph, { color: "text.secondary", children: name })] }, id))) }), _jsx(Button, { variant: "contained", children: "Withdraw $4,550" })] })] }), _jsxs(FlexBetween, { px: 3, py: 2, children: [_jsx(H6, { fontSize: 14, children: "Statement" }), _jsxs(Select, { defaultValue: 2022, size: "small", children: [_jsx(MenuItem, { value: 2022, children: "2022" }), _jsx(MenuItem, { value: 2021, children: "2021" }), _jsx(MenuItem, { value: 2020, children: "2020" })] })] }), _jsx(Scrollbar, { autoHide: false, children: _jsxs(Table, { sx: { minWidth: 800 }, children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(StyledHeadTableCell, { children: "Date" }), _jsx(StyledHeadTableCell, { children: "Order ID" }), _jsx(StyledHeadTableCell, { children: "Order Details" }), _jsx(StyledHeadTableCell, { children: "Amount" }), _jsx(StyledHeadTableCell, { children: "Invoice" })] }) }), _jsx(TableBody, { children: [1, 2, 3, 4, 5, 6].map((item) => (_jsxs(BodyTableRow, { children: [_jsx(BodyTableCell, { children: "Nov 12, 2021" }), _jsx(BodyTableCell, { children: "202745788" }), _jsx(BodyTableCell, { children: "The Icon of full icon set" }), _jsx(BodyTableCell, { children: "$650" }), _jsx(BodyTableCell, { children: _jsx(Button, { size: "small", variant: "contained", disabled: item === 1, startIcon: _jsx(DownloadTo, {}), children: "Download" }) })] }, item))) })] }) })] }));
};
export default Statements;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, Grid, Table, Alert, styled, Button, Select, Divider, useTheme, MenuItem, TableRow, InputBase, TableBody, TableHead, AlertTitle, IconButton, } from "@mui/material";
import { useState } from "react";
import { ContentCopy, Info } from "@mui/icons-material";
import { CopyToClipboard } from "react-copy-to-clipboard";
// CUSTOM COMPONENTS
import { FlexBetween } from "@/components/flexbox";
import { Scrollbar } from "@/components/scrollbar";
import { H5, H6, Paragraph } from "@/components/typography";
// CUSTOM ICON COMPONENTS
import SignIn from "@/icons/SignIn";
import ChartIcon from "@/icons/ChartIcon";
import DollarOutlined from "@/icons/DollarOutlined";
import CheckMarkCircleOutlined from "@/icons/CheckMarkCircleOutlined";
// COMMON STYLED COMPONENTS
import { BodyTableCellV2, BodyTableRow, HeadTableCell } from "./common/styles";
// CUSTOM UTILS METHOD
import { format } from "@/utils/currency";
// STYLED COMPONENT
const EarningBox = styled("div")(({ theme }) => ({
    paddingBlock: 12,
    textAlign: "center",
    borderRadius: "8px",
    border: `1px solid ${theme.palette.divider}`,
}));
// CUSTOM DUMMY DATA SET
const REFER_LIST = [
    {
        orderId: "678935899",
        user: "Marcus Harris",
        date: "Nov 12, 2021",
        bonus: 15,
        profit: 1200,
    },
    {
        orderId: "678935900",
        user: "Robert Smith",
        date: "Nov 14, 2021",
        bonus: 53,
        profit: 2400,
    },
    {
        orderId: "678935901",
        user: "Williams Brown",
        date: "Nov 15, 2021",
        bonus: 76,
        profit: 1200,
    },
    {
        orderId: "678935902",
        user: "Robert Smith",
        date: "Nov 14, 2021",
        bonus: 53,
        profit: 2400,
    },
];
const Referrals = () => {
    const theme = useTheme();
    const [referLink] = useState("https://Example.com/reffer/?refid=345re66787k8");
    // CUSTOM DUMMY DATA SET
    const EARNING_LIST = [
        {
            id: 1,
            amount: 85460,
            Icon: ChartIcon,
            name: "Net Earnings",
            iconColor: theme.palette.primary.main,
        },
        {
            id: 2,
            amount: 44550,
            Icon: DollarOutlined,
            name: "Balance",
            iconColor: theme.palette.success.main,
        },
        {
            id: 3,
            amount: 4550,
            Icon: CheckMarkCircleOutlined,
            name: "Avg Deal Size",
            iconColor: theme.palette.error.main,
        },
        {
            id: 4,
            amount: 4550,
            Icon: SignIn,
            name: "Referral Signup",
            iconColor: theme.palette.info.main,
        },
    ];
    return (_jsxs(Card, { sx: { pb: 2 }, children: [_jsx(H6, { fontSize: 14, padding: 3, children: "Referrals" }), _jsx(Divider, {}), _jsxs(Box, { padding: 3, children: [_jsx(Grid, { container: true, spacing: 3, mb: 3, children: EARNING_LIST.map((item) => (_jsx(Grid, { item: true, md: 3, sm: 6, xs: 12, children: _jsxs(EarningBox, { children: [_jsx(item.Icon, { sx: { color: item.iconColor } }), _jsxs(H5, { fontSize: 14, my: 0.5, children: ["$", format(item.amount, "0,0")] }), _jsx(Paragraph, { color: "text.secondary", children: item.name })] }, item.id) }, item.id))) }), _jsxs(Alert, { severity: "info", variant: "outlined", icon: _jsx(Info, {}), action: _jsx(Button, { children: "Withdraw $44,550" }), children: [_jsx(AlertTitle, { children: "We Need Your Attention" }), "Writing headlines for blog posts is as much an art as it is a science, and warrants its own post, but for now, all I\u2019d advise is experimenting what works for your audience, especially if it\u2019s not resonating with your audience"] }), _jsx(Box, { py: 3, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsxs(Grid, { item: true, md: 6, xs: 12, children: [_jsx(H5, { fontSize: 14, mb: 0.5, children: "Your Referral Link" }), _jsx(Paragraph, { children: "Plan your blog post by choosing a topic, creating an outline conduct research, and checking facts" })] }), _jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(InputBase, { fullWidth: true, value: referLink, disabled: true, sx: {
                                            fontSize: 12,
                                            fontWeight: 500,
                                            borderRadius: 4,
                                            padding: ".5rem 1rem",
                                            backgroundColor: "grey.100",
                                            ".MuiInputBase-input.Mui-disabled": {
                                                WebkitTextFillColor: theme.palette.grey[500],
                                            },
                                        }, endAdornment: _jsx(CopyToClipboard, { text: referLink, onCopy: () => true, children: _jsx(IconButton, { children: _jsx(ContentCopy, { fontSize: "small" }) }) }) }) })] }) })] }), _jsxs(FlexBetween, { px: 3, pb: 2, children: [_jsx(H5, { fontSize: 14, children: "Referred Users" }), _jsxs(Select, { defaultValue: 2022, size: "small", children: [_jsx(MenuItem, { value: 2022, children: "2022" }), _jsx(MenuItem, { value: 2021, children: "2021" }), _jsx(MenuItem, { value: 2020, children: "2020" })] })] }), _jsx(Scrollbar, { autoHide: false, children: _jsxs(Table, { sx: { minWidth: 800 }, children: [_jsx(TableHead, { sx: { backgroundColor: "divider" }, children: _jsxs(TableRow, { children: [_jsx(HeadTableCell, { children: "Order ID" }), _jsx(HeadTableCell, { children: "User" }), _jsx(HeadTableCell, { children: "Date" }), _jsx(HeadTableCell, { children: "Bonus" }), _jsx(HeadTableCell, { children: "Profit" })] }) }), _jsx(TableBody, { children: REFER_LIST.map((item) => (_jsxs(BodyTableRow, { children: [_jsx(BodyTableCellV2, { children: item.orderId }), _jsx(BodyTableCellV2, { children: item.user }), _jsx(BodyTableCellV2, { children: item.date }), _jsxs(BodyTableCellV2, { children: [item.bonus, "%"] }), _jsxs(BodyTableCellV2, { sx: { color: "success.main" }, children: ["$", format(item.profit, "0,0.00")] })] }, item.orderId))) })] }) })] }));
};
export default Referrals;

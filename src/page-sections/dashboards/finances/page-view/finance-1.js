import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Grid, Stack } from "@mui/material";
// CUSTOM PAGE SECTION COMPONENTS
import Audits from "../Audits";
import Reports from "../Reports";
import Balance from "../Balance";
import Footer from "../../_common/Footer";
import DebitCard from "../DebitCard";
import MySavings from "../MySavings";
import Investment from "../Investment";
import Installment from "../Installment";
import TopActivity from "../TopActivity";
import Transactions from "../Transactions";
import QuickTransfer from "../QuickTransfer";
import CurrentCurrency from "../CurrentCurrency";
import CustomerTransaction from "../CustomerTransaction";
const Finance1PageView = () => {
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(Balance, {}) }), _jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(CurrentCurrency, {}) }), _jsx(Grid, { item: true, md: 8, xs: 12, children: _jsx(Transactions, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(DebitCard, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsxs(Stack, { spacing: 3, children: [_jsx(QuickTransfer, {}), _jsx(Installment, {})] }) }), _jsx(Grid, { item: true, md: 8, xs: 12, children: _jsx(CustomerTransaction, {}) }), _jsx(Grid, { item: true, md: 8, xs: 12, children: _jsx(Investment, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(TopActivity, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(MySavings, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(Audits, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(Reports, {}) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Footer, {}) })] }) }));
};
export default Finance1PageView;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Grid } from "@mui/material";
// CUSTOM PAGE SECTION COMPONENTS
import Balance from "../Balance";
import Footer from "../../_common/Footer";
import DebitCard from "../DebitCard";
import MySavings from "../MySavings";
import Transactions from "../Transactions";
import WalletSummery from "../WalletSummery";
import InvestmentTwo from "../InvestmentTwo";
import TopActivityTwo from "../TopActivityTwo";
import ExpenseHistory from "../ExpenseHistory";
import CurrentCurrencyTwo from "../CurrentCurrencyTwo";
import CustomerTransaction from "../CustomerTransaction";
const Finance2PageView = () => {
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(Balance, {}) }), _jsx(Grid, { item: true, md: 6, xs: 12, children: _jsx(CurrentCurrencyTwo, {}) }), _jsx(Grid, { item: true, md: 8, xs: 12, children: _jsx(Transactions, { type: "line" }) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(DebitCard, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(WalletSummery, {}) }), _jsx(Grid, { item: true, md: 8, xs: 12, children: _jsx(CustomerTransaction, {}) }), _jsx(Grid, { item: true, md: 8, xs: 12, children: _jsx(InvestmentTwo, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(TopActivityTwo, {}) }), _jsx(Grid, { item: true, md: 4, xs: 12, children: _jsx(MySavings, {}) }), _jsx(Grid, { item: true, md: 8, xs: 12, children: _jsx(ExpenseHistory, {}) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Footer, {}) })] }) }));
};
export default Finance2PageView;

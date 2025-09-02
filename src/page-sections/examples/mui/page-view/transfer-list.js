import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Grid, List, Paper, Stack, Button, ListItem, Checkbox, ListItemIcon, ListItemText, } from "@mui/material";
// CUSTOM COMPONENTS
import { Block } from "@/components/block";
import { Scrollbar } from "@/components/scrollbar";
import ComponentPageLayout from "../../ComponentPageLayout";
function not(a, b) {
    return a.filter((value) => b.indexOf(value) === -1);
}
function intersection(a, b) {
    return a.filter((value) => b.indexOf(value) !== -1);
}
const MuiTransferListPageView = () => {
    const [checked, setChecked] = useState([]);
    const [left, setLeft] = useState([0, 1, 2, 3]);
    const [right, setRight] = useState([4, 5, 6, 7]);
    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);
    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];
        if (currentIndex === -1)
            newChecked.push(value);
        else
            newChecked.splice(currentIndex, 1);
        setChecked(newChecked);
    };
    const handleAllRight = () => {
        setRight(right.concat(left));
        setLeft([]);
    };
    const handleCheckedRight = () => {
        setRight(right.concat(leftChecked));
        setLeft(not(left, leftChecked));
        setChecked(not(checked, leftChecked));
    };
    const handleCheckedLeft = () => {
        setLeft(left.concat(rightChecked));
        setRight(not(right, rightChecked));
        setChecked(not(checked, rightChecked));
    };
    const handleAllLeft = () => {
        setLeft(left.concat(right));
        setRight([]);
    };
    const customList = (items) => (_jsx(Paper, { autoHide: false, component: Scrollbar, sx: { width: 200, height: 230, overflow: "auto", borderRadius: 3 }, children: _jsx(List, { dense: true, component: "div", role: "list", children: items.map((value) => {
                const labelId = `transfer-list-item-${value}-label`;
                return (_jsxs(ListItem, { role: "listitem", onClick: handleToggle(value), children: [_jsx(ListItemIcon, { children: _jsx(Checkbox, { tabIndex: -1, disableRipple: true, checked: checked.indexOf(value) !== -1 }) }), _jsx(ListItemText, { id: labelId, primary: `List item ${value + 1}` })] }, value));
            }) }) }));
    return (_jsx(ComponentPageLayout, { title: "Transfer List", fullLink: "https://mui.com/components/transfer-list", children: _jsx(Block, { title: "Basic", children: _jsxs(Grid, { container: true, spacing: 2, justifyContent: "center", alignItems: "center", children: [_jsx(Grid, { item: true, children: customList(left) }), _jsx(Grid, { item: true, children: _jsxs(Stack, { spacing: 2, children: [_jsx(Button, { size: "small", variant: "outlined", onClick: handleAllRight, disabled: left.length === 0, "aria-label": "move all right", children: "\u226B" }), _jsx(Button, { size: "small", variant: "outlined", onClick: handleCheckedRight, disabled: leftChecked.length === 0, "aria-label": "move selected right", children: ">" }), _jsx(Button, { size: "small", variant: "outlined", onClick: handleCheckedLeft, disabled: rightChecked.length === 0, "aria-label": "move selected left", children: "<" }), _jsx(Button, { size: "small", variant: "outlined", onClick: handleAllLeft, disabled: right.length === 0, "aria-label": "move all left", children: "\u226A" })] }) }), _jsx(Grid, { item: true, children: customList(right) })] }) }) }));
};
export default MuiTransferListPageView;

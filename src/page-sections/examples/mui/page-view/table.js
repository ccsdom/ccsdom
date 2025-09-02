import { jsx as _jsx } from "react/jsx-runtime";
import { Block } from "@/components/block";
import ComponentPageLayout from "../../ComponentPageLayout";
import BasicTable from "../../mui/table/BasicTable";
import CollapsibleTable from "../../mui/table/CollapsibleTable";
import SortSelectedTable from "../../mui/table/SortSelectedTable";
import StickyHeaderTable from "../../mui/table/StickyHeaderTable";
const components = [
    { id: 1, Component: BasicTable, title: "Basic" },
    { id: 2, Component: SortSelectedTable, title: "Sorting & selecting" },
    { id: 3, Component: StickyHeaderTable, title: "Sticky Header" },
    { id: 4, Component: CollapsibleTable, title: "Collapsible" },
];
const MuiTablePageView = () => {
    return (_jsx(ComponentPageLayout, { title: "Table", children: components.map(({ Component, title, id }) => (_jsx(Block, { title: title, children: _jsx(Component, {}) }, id))) }));
};
export default MuiTablePageView;

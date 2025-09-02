import { jsx as _jsx } from "react/jsx-runtime";
// CUSTOM COMPONENT
import { Block } from "@/components/block";
import BasicAlert from "../alert/BasicAlert";
import ActionAlert from "../alert/ActionAlert";
import FilledAlert from "../alert/FilledAlert";
import OutlinedAlert from "../alert/OutlinedAlert";
import DescriptionAlert from "../alert/DescriptionAlert";
import ComponentPageLayout from "../../ComponentPageLayout";
const components = [
    { id: 1, title: "Basic Alert", Component: BasicAlert },
    { id: 2, title: "Outlined Alert", Component: OutlinedAlert },
    { id: 3, title: "Filled Alert", Component: FilledAlert },
    { id: 4, title: "Description Alert", Component: DescriptionAlert },
    { id: 5, title: "Actions Alert", Component: ActionAlert },
];
const MuiAlertPageView = () => {
    return (_jsx(ComponentPageLayout, { title: "Alert", children: components.map(({ Component, title, id }) => (_jsx(Block, { title: title, bgTransparent: true, children: _jsx(Component, {}) }, id))) }));
};
export default MuiAlertPageView;

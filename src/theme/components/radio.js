import { jsx as _jsx } from "react/jsx-runtime";
import RadioButtonIcon from "@/icons/RadioButtonIcon";
import RadioButtonChecked from "@/icons/RadioButtonChecked";
// ==============================================================
const Radio = () => ({
    defaultProps: {
        icon: _jsx(RadioButtonIcon, {}),
        checkedIcon: _jsx(RadioButtonChecked, {}),
    },
    styleOverrides: {
        root: { padding: 6 },
    },
    variants: [
        {
            props: { size: "large" },
            style: { ".MuiSvgIcon-root": { fontSize: "1.75rem" } },
        },
    ],
});
export default Radio;

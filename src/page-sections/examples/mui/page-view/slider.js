import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Grid, Stack, Slider } from "@mui/material";
import { VolumeDown, VolumeUp } from "@mui/icons-material";
// CUSTOM COMPONENTS
import ComponentPageLayout from "../../ComponentPageLayout";
import { Block } from "@/components/block";
const marks = [
    { value: 0, label: "0°C" },
    { value: 20, label: "20°C" },
    { value: 37, label: "37°C" },
    { value: 100, label: "100°C" },
];
const valueText = (value) => `${value}°C`;
const valueLabelFormat = (value) => marks.findIndex((mark) => mark.value === value) + 1;
const MuiSliderPageView = () => {
    const [value, setValue] = useState(30);
    const handleChange = (_, newValue) => setValue(newValue);
    const [range, setRange] = useState([100, 470]);
    const handleRangeChange = (_, newValue) => {
        setRange(newValue);
    };
    return (_jsx(ComponentPageLayout, { title: "Slider", children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, lg: 4, md: 6, xs: 12, children: _jsx(Block, { title: "Continuous", children: _jsxs(Stack, { spacing: 2, direction: "row", sx: { mb: 1 }, alignItems: "center", children: [_jsx(VolumeDown, {}), _jsx(Slider, { "aria-label": "Volume", value: value, onChange: handleChange }), _jsx(VolumeUp, {})] }) }) }), _jsx(Grid, { item: true, lg: 4, md: 6, xs: 12, children: _jsx(Block, { title: "Disabled", children: _jsx(Slider, { "aria-label": "disabled", defaultValue: 30, disabled: true }) }) }), _jsx(Grid, { item: true, lg: 4, md: 6, xs: 12, children: _jsx(Block, { title: "Discrete", children: _jsx(Slider, { marks: true, min: 10, step: 10, max: 110, defaultValue: 30, "aria-label": "Temperature", valueLabelDisplay: "auto" }) }) }), _jsx(Grid, { item: true, lg: 4, md: 6, xs: 12, children: _jsx(Block, { title: "Restricted Values", children: _jsx(Slider, { step: null, marks: marks, defaultValue: 20, valueLabelDisplay: "auto", getAriaValueText: valueText, "aria-label": "Restricted values", valueLabelFormat: valueLabelFormat }) }) }), _jsx(Grid, { item: true, lg: 4, md: 6, xs: 12, children: _jsx(Block, { title: "Range", children: _jsx(Slider, { max: 999, value: range, valueLabelDisplay: "on", onChange: handleRangeChange, getAriaLabel: () => "Temperature range", valueLabelFormat: (value) => `$${value}` }) }) }), _jsx(Grid, { item: true, lg: 4, md: 6, xs: 12, children: _jsx(Block, { title: "Sizes", children: _jsxs(Stack, { spacing: 2, children: [_jsx(Slider, { size: "medium", value: value, onChange: handleChange }), _jsx(Slider, { size: "small", value: value, onChange: handleChange })] }) }) })] }) }));
};
export default MuiSliderPageView;

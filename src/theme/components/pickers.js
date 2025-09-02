import { jsx as _jsx } from "react/jsx-runtime";
import { KeyboardArrowDown, KeyboardArrowLeft, KeyboardArrowRight, CalendarMonthOutlined, } from "@mui/icons-material";
// ==============================================================
// DATE PICKER
// ==============================================================
export const DatePicker = () => ({
    defaultProps: {
        components: {
            OpenPickerIcon: CalendarMonthOutlined,
            SwitchViewIcon: (props) => (_jsx(KeyboardArrowDown, { ...props, fontSize: "small" })),
            LeftArrowIcon: (props) => (_jsx(KeyboardArrowLeft, { ...props, fontSize: "small" })),
            RightArrowIcon: (props) => (_jsx(KeyboardArrowRight, { ...props, fontSize: "small" })),
        },
    },
});
export const DesktopDatePicker = () => ({
    defaultProps: {
        PaperProps: { sx: { borderRadius: 2, boxShadow: 4 } },
        components: DatePicker()?.defaultProps?.components,
    },
});
export const MobileDatePicker = () => ({
    defaultProps: DatePicker()?.defaultProps,
});
export const StaticDatePicker = () => ({
    defaultProps: DatePicker()?.defaultProps,
});
// ==============================================================
// TIME PICKER
// ==============================================================
export const TimePicker = () => ({
    defaultProps: {
        PaperProps: {
            sx: {
                padding: 2,
                boxShadow: 4,
                borderRadius: 2,
                ".MuiPickersArrowSwitcher-spacer": { width: 10 },
                ".MuiClock-pmButton .MuiTypography-caption": { fontWeight: 600 },
                ".MuiClock-amButton .MuiTypography-caption": { fontWeight: 600 },
            },
        },
        components: {
            LeftArrowIcon: (props) => (_jsx(KeyboardArrowLeft, { ...props, fontSize: "small" })),
            RightArrowIcon: (props) => (_jsx(KeyboardArrowRight, { ...props, fontSize: "small" })),
        },
    },
});
export const DesktopTimePicker = () => ({
    defaultProps: TimePicker()?.defaultProps,
});
// ==============================================================
// DATE TIME PICKER
// ==============================================================
export const DateTimePicker = () => ({
    defaultProps: {
        PaperProps: { sx: { borderRadius: 2, boxShadow: 4 } },
        components: DatePicker()?.defaultProps?.components,
    },
});
export const DesktopDateTimePicker = () => ({
    defaultProps: {
        PaperProps: { sx: { borderRadius: 2, boxShadow: 4 } },
        components: DatePicker()?.defaultProps?.components,
    },
});

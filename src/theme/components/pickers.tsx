import { Components } from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  CalendarMonthOutlined,
} from "@mui/icons-material";

// ==============================================================
// DATE PICKER
// ==============================================================
export const DatePicker = (): Components["MuiDatePicker"] => ({
  defaultProps: {
    components: {
      OpenPickerIcon: CalendarMonthOutlined,
      SwitchViewIcon: (props) => (
        <KeyboardArrowDown {...props} fontSize="small" />
      ),
      LeftArrowIcon: (props) => (
        <KeyboardArrowLeft {...props} fontSize="small" />
      ),
      RightArrowIcon: (props) => (
        <KeyboardArrowRight {...props} fontSize="small" />
      ),
    },
  },
});

export const DesktopDatePicker = (): Components["MuiDesktopDatePicker"] => ({
  defaultProps: {
    PaperProps: { sx: { borderRadius: 2, boxShadow: 4 } },
    components: DatePicker()?.defaultProps?.components,
  },
});

export const MobileDatePicker = (): Components["MuiMobileDatePicker"] => ({
  defaultProps: DatePicker()?.defaultProps,
});

export const StaticDatePicker = (): Components["MuiStaticDatePicker"] => ({
  defaultProps: DatePicker()?.defaultProps,
});

// ==============================================================
// TIME PICKER
// ==============================================================
export const TimePicker = (): Components["MuiTimePicker"] => ({
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
      LeftArrowIcon: (props) => (
        <KeyboardArrowLeft {...props} fontSize="small" />
      ),
      RightArrowIcon: (props) => (
        <KeyboardArrowRight {...props} fontSize="small" />
      ),
    },
  },
});

export const DesktopTimePicker = (): Components["MuiDesktopTimePicker"] => ({
  defaultProps: TimePicker()?.defaultProps,
});

// ==============================================================
// DATE TIME PICKER
// ==============================================================
export const DateTimePicker = (): Components["MuiDateTimePicker"] => ({
  defaultProps: {
    PaperProps: { sx: { borderRadius: 2, boxShadow: 4 } },
    components: DatePicker()?.defaultProps?.components,
  },
});

export const DesktopDateTimePicker =
  (): Components["MuiDesktopDateTimePicker"] => ({
    defaultProps: {
      PaperProps: { sx: { borderRadius: 2, boxShadow: 4 } },
      components: DatePicker()?.defaultProps?.components,
    },
  });

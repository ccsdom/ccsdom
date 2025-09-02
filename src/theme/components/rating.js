import { jsx as _jsx } from "react/jsx-runtime";
import Star from "@/icons/Star";
import StarOutlined from "@/icons/StarOutlined";
// ==============================================================
const Rating = (theme) => ({
    styleOverrides: {
        root: { color: theme.palette.warning.main },
        iconEmpty: { color: theme.palette.grey[300] },
    },
    defaultProps: {
        icon: _jsx(Star, { fontSize: "inherit" }),
        emptyIcon: _jsx(StarOutlined, { fontSize: "inherit" }),
    },
});
export default Rating;

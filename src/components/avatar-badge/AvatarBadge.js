import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from "react";
import Badge from "@mui/material/Badge";
import { styled } from "@mui/material/styles";
// STYLED COMPONENT
const StyledBadge = styled(Badge, {
    shouldForwardProp: (prop) => prop !== "width" && prop !== "height",
})(({ theme, width, height }) => ({
    "& .MuiBadge-badge": {
        width: width,
        height: height,
        borderRadius: "50%",
        backgroundColor: theme.palette.primary.main,
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    },
    "& .MuiBadge-colorSuccess.MuiBadge-badge": {
        backgroundColor: theme.palette.success.main,
        boxShadow: `0 0 0 1px ${theme.palette.background.paper}`,
    },
}));
// ===================================================================
const AvatarBadge = forwardRef((props, ref) => {
    const { children, width = 25, height = 25, ...others } = props;
    return (_jsx(StyledBadge, { ref: ref, width: width, height: height, overlap: "circular", anchorOrigin: { vertical: "bottom", horizontal: "right" }, ...others, children: children }));
});
export default AvatarBadge;

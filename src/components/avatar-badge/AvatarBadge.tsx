import { FC, forwardRef } from "react";
import Badge, { BadgeProps } from "@mui/material/Badge";
import { styled } from "@mui/material/styles";

// STYLED COMPONENT
const StyledBadge = styled(Badge, {
  shouldForwardProp: (prop) => prop !== "width" && prop !== "height",
})<Props>(({ theme, width, height }) => ({
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
interface Props extends BadgeProps {
  width?: number;
  height?: number;
}
// ===================================================================

const AvatarBadge: FC<Props> = forwardRef((props, ref) => {
  const { children, width = 25, height = 25, ...others } = props;

  return (
    <StyledBadge
      ref={ref}
      width={width}
      height={height}
      overlap="circular"
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      {...others}
    >
      {children}
    </StyledBadge>
  );
});

export default AvatarBadge;

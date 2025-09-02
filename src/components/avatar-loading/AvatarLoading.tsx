import { FC, forwardRef } from "react";
import { AvatarProps } from "@mui/material/Avatar";
// STYLED COMPONENT
import { StyledAvatar } from "./styles";

// ==============================================================
interface Props extends AvatarProps {
  percentage: number;
  borderSize?: number;
}
// ==============================================================

const AvatarLoading: FC<Props> = forwardRef((props, ref) => {
  const {
    percentage,
    alt = "user",
    borderSize = 1,
    src = "/static/user/user-11.png",
    ...others
  } = props;

  const DEG = Math.round((percentage / 100) * 360);

  return (
    <StyledAvatar
      ref={ref}
      alt={alt}
      src={src}
      deg={DEG}
      borderSize={borderSize}
      {...others}
    />
  );
});

export default AvatarLoading;

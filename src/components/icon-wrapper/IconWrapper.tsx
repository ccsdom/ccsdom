import { FC, forwardRef } from "react";
import { BoxProps, styled } from "@mui/material";
// CUSTOM COMPONENT
import { FlexRowAlign } from "../flexbox";

// STYLED COMPONENT
const Wrapper = styled(FlexRowAlign)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: "5px",
  marginRight: "0.5rem",
  backgroundColor: theme.palette.primary[100],
}));

const IconWrapper: FC<BoxProps> = forwardRef(({ children, ...props }, ref) => (
  <Wrapper ref={ref} {...props}>
    {children}
  </Wrapper>
));

export default IconWrapper;

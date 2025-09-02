import { FC, forwardRef } from "react";
import Box, { BoxProps } from "@mui/material/Box";

const FlexBetween: FC<BoxProps> = forwardRef(({ children, ...props }, ref) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    ref={ref}
    {...props}
  >
    {children}
  </Box>
));

export default FlexBetween;

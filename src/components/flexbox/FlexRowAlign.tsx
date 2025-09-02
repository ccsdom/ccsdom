import { FC, forwardRef } from "react";
import Box, { BoxProps } from "@mui/material/Box";

const FlexRowAlign: FC<BoxProps> = forwardRef(({ children, ...props }, ref) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="center"
    ref={ref}
    {...props}
  >
    {children}
  </Box>
));

export default FlexRowAlign;

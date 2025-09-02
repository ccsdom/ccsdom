import { FC, PropsWithChildren, forwardRef } from "react";
import { CardProps } from "@mui/material/Card";
// CUSTOM COMPONENT
import { Paragraph } from "../typography";
// STYLED COMPONENT
import { StyledCard } from "./styles";

// ==============================================================
interface Props extends PropsWithChildren, CardProps {
  title: string;
  bgTransparent?: boolean;
}
// ==============================================================

const Block: FC<Props> = forwardRef(
  ({ title, children, bgTransparent = false, ...props }, ref) => (
    <StyledCard ref={ref} bg={bgTransparent ? 1 : 0} {...props}>
      <Paragraph mb={3} fontSize={18} fontWeight={600}>
        {title}
      </Paragraph>

      {children}
    </StyledCard>
  ),
);

export default Block;

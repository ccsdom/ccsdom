import { FC } from "react";
// CUSTOM COMPONENTS
import { FlexBox } from "@/components/flexbox";
import { Paragraph } from "@/components/typography";
import CheckCircleOutline from "@/icons/CheckCircleOutline";

// ==============================================================
interface Props {
  title: string;
}
// ==============================================================

const FeatureListItem: FC<Props> = ({ title }) => {
  return (
    <FlexBox alignItems="center" gap={1}>
      <CheckCircleOutline color="success" />
      <Paragraph fontSize={16}>{title}</Paragraph>
    </FlexBox>
  );
};

export default FeatureListItem;

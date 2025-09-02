import { FC } from "react";
import { Avatar, Button, Card, Stack, SvgIconProps } from "@mui/material";
import Add from "@mui/icons-material/Add";
// CUSTOM COMPONENTS
import { H6, Small } from "@/components/typography";
import FlexBetween from "@/components/flexbox/FlexBetween";
// CUSTOM ICON COMPONENTS
import ChartBar4 from "@/icons/ChartBar4";
import DollarOutlined from "@/icons/DollarOutlined";
import { numberFormat } from "@/utils/numberFormat";

// ====================================================================
type ConnectionCardProps = {
  img: string;
  name: string;
  position: string;
  connected: boolean;
};
// ====================================================================

const ConnectionCard: FC<ConnectionCardProps> = ({
  img,
  name,
  position,
  connected,
}) => {
  return (
    <Card
      sx={{
        padding: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Avatar src={img} />

      <H6 fontSize={14} mt={1.5}>
        {name}
      </H6>

      <Small color="text.secondary">{position}</Small>

      <Stack width="100%" maxWidth="80%">
        <FlexBetween mb={3}>
          <AmountCard Icon={DollarOutlined} title="Avg Income" amount={14500} />
          <AmountCard Icon={ChartBar4} title="Avg Income" amount={26500} />
        </FlexBetween>

        <Button
          fullWidth
          color={connected ? "primary" : "secondary"}
          variant={connected ? "contained" : "outlined"}
          startIcon={<Add />}
        >
          {connected ? "Connected" : "Connect"}
        </Button>
      </Stack>
    </Card>
  );
};

export default ConnectionCard;

// =====================================================================
type AmountCardProps = {
  title: string;
  amount: number;
  Icon: (props: SvgIconProps) => JSX.Element;
};
// =====================================================================

function AmountCard({ Icon, amount, title }: AmountCardProps) {
  return (
    <Stack
      mt={2}
      alignItems="center"
      sx={{
        padding: 2,
        width: "47%",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Icon sx={{ color: "text.secondary" }} />

      <H6 fontSize={14} mt={0.5}>
        ${numberFormat(amount)}
      </H6>

      <Small color="grey.500">{title}</Small>
    </Stack>
  );
}

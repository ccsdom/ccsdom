import { Fragment, useRef, useState } from "react";
import { Avatar, Badge, Box, IconButton } from "@mui/material";
// CUSTOM COMPONENTS
import PopoverLayout from "./PopoverLayout";
import { FlexBox } from "@/components/flexbox";
import { Paragraph, Small } from "@/components/typography";
// Icônes MUI parlantes
import BusinessIcon from '@mui/icons-material/Business';       // Création d’entreprise
import EditIcon from '@mui/icons-material/Edit';               // Modification d’entreprise
import HighlightOffIcon from '@mui/icons-material/HighlightOff'; // Liquidation d’entreprise
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; // Comptabilité
import PaymentIcon from '@mui/icons-material/Payment';         // Gestion de paie
import Apps from "@/icons/duotone/Apps";

const SERVICES = [
  {
    id: 1,
    title: "Création d'entreprises",
    body: "Accompagnement complet pour la création de votre société",
    icon: BusinessIcon,
  },
  {
    id: 2,
    title: "Modification d'entreprises",
    body: "Gestion des modifications statutaires et administratives",
    icon: EditIcon,
  },
  {
    id: 3,
    title: "Liquidation d'entreprises",
    body: "Processus simplifié pour la liquidation et clôture",
    icon: HighlightOffIcon,
  },
  {
    id: 4,
    title: "Comptabilité",
    body: "Tenue et suivi comptable rigoureux pour votre entreprise",
    icon: ReceiptLongIcon,
  },
  {
    id: 5,
    title: "Gestion de paie",
    body: "Gestion complète des bulletins de paie et déclarations sociales",
    icon: PaymentIcon,
  },
];

const ServicePopover = () => {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  return (
    <Fragment>
      <IconButton ref={anchorRef} onClick={() => setOpen(true)} aria-label="Afficher les services">
        <Badge color="error" badgeContent={0}>
          <Apps sx={{ color: "grey.400", fontSize: 18 }} />
        </Badge>
      </IconButton>

      <PopoverLayout
        hiddenViewButton
        popoverOpen={open}
        anchorRef={anchorRef}
        title="Services"
        popoverClose={() => setOpen(false)}
      >
        {SERVICES.map(({ id, title, body, icon: Icon }) => (
          <ListItem
            key={id}
            title={title}
            body={body}
            Icon={Icon}
          />
        ))}
      </PopoverLayout>
    </Fragment>
  );
};

function ListItem({
  title,
  body,
  Icon,
}: {
  title: string;
  body: string;
  Icon: React.ElementType;
}) {
  return (
    <FlexBox
      p={2}
      gap={2}
      alignItems="center"
      sx={{ cursor: "pointer", "&:hover": { backgroundColor: "action.hover" } }}
    >
      <Icon sx={{ fontSize: 30, color: 'primary.main' }} />

      <div>
        <Paragraph fontWeight={500}>{title}</Paragraph>
        <Small display="block" color="text.secondary">
          {body}
        </Small>
      </div>
    </FlexBox>
  );
}

export default ServicePopover;

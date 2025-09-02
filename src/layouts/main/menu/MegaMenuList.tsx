import { FC } from "react";
import { styled } from "@mui/material/styles";
// CUSTOM COMPONENTS
import { Link } from "@/components/link";
import { H6 } from "@/components/typography";
import { FlexBox } from "@/components/flexbox";
// CUSTOM DEFINED HOOK
import useLocation from "@/hooks/useLocation";

// styled component
const MenuList = styled(FlexBox)(({ theme }) => ({
  alignItems: "start",
  flexDirection: "column",
  "& > a": {
    fontSize: 14,
    fontWeight: 400,
    transition: "all 300ms",
    color: theme.palette.grey[500],
    ":hover": { color: theme.palette.grey[300] },
    "&.active": { color: theme.palette.primary.main },
  },
}));

// ==============================================================
type Props = {
  title: string;
  child: { title: string; id: number; href: string }[];
};
// ==============================================================

const MegaMenuList: FC<Props> = ({ title, child }) => {
  const { pathname } = useLocation();

  return (
    <>
      <H6 fontSize={14}>{title}</H6>

      <MenuList mt={2} gap={2}>
        {child.map((item) => (
          <Link
            className={pathname === item.href ? "active" : ""}
            href={item.href}
            key={item.id}
          >
            {item.title}
          </Link>
        ))}
      </MenuList>
    </>
  );
};

export default MegaMenuList;

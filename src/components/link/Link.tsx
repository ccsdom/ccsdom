import { forwardRef } from "react";
import { Link as RouterLink, LinkProps } from "react-router-dom";

// ==============================================================
type OmittedLinkProps = Omit<LinkProps, "to">;

interface Props extends OmittedLinkProps {
  href: string;
}
// ==============================================================

const Link = forwardRef<HTMLAnchorElement, Props>(
  ({ href, ...others }, ref) => {
    return <RouterLink ref={ref} to={href} {...others} />;
  },
);

export default Link;

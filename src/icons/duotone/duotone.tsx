import React from "react";
import {
  Home as HomeIcon,
  Description as FileLinesIcon,
  Inbox as InboxIcon,
  Receipt as InvoiceIcon,
  Person as UserProfileIcon,
  Logout as RightFromBracketIcon,
  HelpOutline as FileCircleQuestionIcon,
  School as PersonChalkboardIcon,
  WarningAmber as WarningIcon,
  ErrorOutline as ErrorOutlineIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

import { SvgIconProps } from "@mui/material";

const duotone = {
  Home: (props: SvgIconProps) => <HomeIcon {...props} />,
  FileLines: (props: SvgIconProps) => <FileLinesIcon {...props} />,
  Inbox: (props: SvgIconProps) => <InboxIcon {...props} />,
  Invoice: (props: SvgIconProps) => <InvoiceIcon {...props} />,
  UserProfile: (props: SvgIconProps) => <UserProfileIcon {...props} />,
  RightFromBracket: (props: SvgIconProps) => <RightFromBracketIcon {...props} />,
  FileCircleQuestion: (props: SvgIconProps) => <FileCircleQuestionIcon {...props} />,
  PersonChalkboard: (props: SvgIconProps) => <PersonChalkboardIcon {...props} />,
  
  Warning: (props: SvgIconProps) => <WarningIcon {...props} />,
  ExclamationCircle: (props: SvgIconProps) => <ErrorOutlineIcon {...props} />,
  CheckCircle: (props: SvgIconProps) => <CheckCircleIcon {...props} />,
};

export default duotone;

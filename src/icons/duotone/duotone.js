import { jsx as _jsx } from "react/jsx-runtime";
import { Home as HomeIcon, Description as FileLinesIcon, Inbox as InboxIcon, Receipt as InvoiceIcon, Person as UserProfileIcon, Logout as RightFromBracketIcon, HelpOutline as FileCircleQuestionIcon, School as PersonChalkboardIcon, WarningAmber as WarningIcon, ErrorOutline as ErrorOutlineIcon, CheckCircle as CheckCircleIcon, } from "@mui/icons-material";
const duotone = {
    Home: (props) => _jsx(HomeIcon, { ...props }),
    FileLines: (props) => _jsx(FileLinesIcon, { ...props }),
    Inbox: (props) => _jsx(InboxIcon, { ...props }),
    Invoice: (props) => _jsx(InvoiceIcon, { ...props }),
    UserProfile: (props) => _jsx(UserProfileIcon, { ...props }),
    RightFromBracket: (props) => _jsx(RightFromBracketIcon, { ...props }),
    FileCircleQuestion: (props) => _jsx(FileCircleQuestionIcon, { ...props }),
    PersonChalkboard: (props) => _jsx(PersonChalkboardIcon, { ...props }),
    Warning: (props) => _jsx(WarningIcon, { ...props }),
    ExclamationCircle: (props) => _jsx(ErrorOutlineIcon, { ...props }),
    CheckCircle: (props) => _jsx(CheckCircleIcon, { ...props }),
};
export default duotone;

import { jsx as _jsx } from "react/jsx-runtime";
import Layout from "../Layout";
import { FlexRowAlign } from "@/components/flexbox";
const MailSentPageView = () => {
    return (_jsx(Layout, { children: _jsx(FlexRowAlign, { mt: 8, children: "There is no conversation" }) }));
};
export default MailSentPageView;

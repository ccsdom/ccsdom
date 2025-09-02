import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Table, Avatar, TableRow, TableBody, TableHead, AvatarGroup, } from "@mui/material";
import { nanoid } from "nanoid";
// CUSTOM COMPONENTS
import { Scrollbar } from "@/components/scrollbar";
import { MoreButton } from "@/components/more-button";
import { StatusBadge } from "@/components/status-badge";
import { Paragraph, Small } from "@/components/typography";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// COMMON DASHBOARD RELATED COMPONENTS
import { BodyTableCell, HeadTableCell } from "../_common";
// CUSTOM DUMMY DATA SET
const DATA = [
    {
        id: nanoid(),
        status: "Live Now",
        status_type: "success",
        title: "Valentine Day",
        createdAt: "14th February, 2022",
        duration: "14 Feb - 21 Feb, 2022",
        image: "/static/thumbnail/6.png",
    },
    {
        id: nanoid(),
        status: "Reviewing",
        status_type: "primary",
        title: "Mother’s Day",
        createdAt: "2nd April, 2022",
        duration: "2 Apr - 5 Apr, 2022",
        image: "/static/thumbnail/5.png",
    },
    {
        id: nanoid(),
        status: "Paused",
        status_type: "warning",
        title: "Cyber Monday",
        createdAt: "17th January, 2022",
        duration: "17 Jan - 21 Jan, 2022",
        image: "/static/thumbnail/4.png",
    },
    {
        id: nanoid(),
        status: "Live Now",
        status_type: "success",
        title: "Valentine Day",
        createdAt: "14th February, 2022",
        duration: "14 Feb - 21 Feb, 2022",
        image: "/static/thumbnail/6.png",
    },
];
const AllCampaigns = () => {
    return (_jsxs(Card, { sx: { height: "100%" }, children: [_jsxs(FlexBetween, { p: 3, children: [_jsxs("div", { children: [_jsx(Paragraph, { lineHeight: 1, fontSize: 18, fontWeight: 500, children: "All Campaigns" }), _jsx(Paragraph, { mt: 0.3, color: "text.secondary", children: "20+ Active Campaign" })] }), _jsx(MoreButton, { size: "small" })] }), _jsx(Scrollbar, { children: _jsxs(Table, { sx: { minWidth: 600, mt: 1 }, children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(HeadTableCell, { children: "NAME" }), _jsx(HeadTableCell, { children: "TEAM MEMBER" }), _jsx(HeadTableCell, { align: "center", children: "STATUS" }), _jsx(HeadTableCell, { align: "center", children: "DURATION" })] }) }), _jsx(TableBody, { children: DATA.map((item, index) => (_jsxs(TableRow, { children: [_jsx(BodyTableCell, { children: _jsxs(FlexBox, { gap: 2, children: [_jsx(Avatar, { variant: "rounded", src: item.image, alt: item.title }), _jsxs("div", { children: [_jsx(Paragraph, { color: "text.primary", fontWeight: 500, children: item.title }), _jsx(Small, { children: item.createdAt })] })] }) }), _jsx(BodyTableCell, { children: _jsxs(AvatarGroup, { max: 4, sx: { "& .MuiAvatar-root": { width: 30, height: 30 } }, children: [_jsx(Avatar, { alt: "Remy Sharp", src: "/static/user/user-11.png" }), _jsx(Avatar, { alt: "Travis Howard", src: "/static/user/user-10.png" }), _jsx(Avatar, { alt: "Cindy Baker", src: "/static/user/user-13.png" }), _jsx(Avatar, { alt: "Agnes Walker", src: "/static/user/user-14.png" }), _jsx(Avatar, { alt: "Trevor Henderson", src: "/static/user/user-15.png" })] }) }), _jsx(BodyTableCell, { align: "center", children: _jsx(StatusBadge, { type: item.status_type, children: item.status }) }), _jsx(BodyTableCell, { align: "center", children: item.duration })] }, index))) })] }) })] }));
};
export default AllCampaigns;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Card, Grid, Stack, Avatar, Checkbox, IconButton, Pagination, } from "@mui/material";
// CUSTOM COMPONENTS
import { FlexBetween } from "@/components/flexbox";
import { Paragraph, Small } from "@/components/typography";
// CUSTOM PAGE SECTION COMPONENTS
import SearchArea from "../SearchArea";
import HeadingArea from "../HeadingArea";
// CUSTOM ICON COMPONENTS
import Chat from "@/icons/Chat";
import Email from "@/icons/Email";
import UserBigIcon from "@/icons/UserBigIcon";
import MoreHorizontal from "@/icons/MoreHorizontal";
// CUSTOM UTILS METHOD
import { paginate } from "@/utils/paginate";
// CUSTOM DUMMY DATA
import { USER_LIST } from "@/__fakeData__/users";
const UserGrid1PageView = () => {
    const [userPerPage] = useState(8);
    const [page, setPage] = useState(1);
    const [users] = useState([...USER_LIST]);
    const [userFilter, setUserFilter] = useState({ role: "", search: "" });
    const handleChangeFilter = (key, value) => {
        setUserFilter((state) => ({ ...state, [key]: value }));
    };
    // handle change for tab list
    const changeTab = (_, newValue) => {
        handleChangeFilter("role", newValue);
    };
    const filteredUsers = users.filter((item) => {
        if (userFilter.role)
            return item.role.toLowerCase() === userFilter.role;
        else if (userFilter.search)
            return item.name.toLowerCase().includes(userFilter.search.toLowerCase());
        else
            return true;
    });
    const iconStyle = { color: "grey.500", fontSize: 18 };
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsxs(Card, { sx: { px: 3, py: 2 }, children: [_jsx(HeadingArea, { value: userFilter.role, changeTab: changeTab }), _jsx(SearchArea, { value: userFilter.search, onChange: (e) => handleChangeFilter("search", e.target.value), gridRoute: "/dashboard/user-grid", listRoute: "/dashboard/user-list" }), _jsxs(Grid, { container: true, spacing: 3, children: [paginate(page, userPerPage, filteredUsers).map((item, index) => (_jsx(Grid, { item: true, lg: 3, md: 4, sm: 6, xs: 12, children: _jsxs(Box, { sx: {
                                    p: 3,
                                    borderRadius: 2,
                                    border: "1px solid",
                                    borderColor: "divider",
                                }, children: [_jsxs(FlexBetween, { mx: -1, mt: -1, children: [_jsx(Checkbox, { size: "small" }), _jsx(IconButton, { children: _jsx(MoreHorizontal, { sx: iconStyle }) })] }), _jsxs(Stack, { direction: "row", alignItems: "center", py: 2, spacing: 2, children: [_jsx(Avatar, { src: item.avatar, sx: { borderRadius: "20%" } }), _jsxs("div", { children: [_jsx(Paragraph, { fontWeight: 500, children: item.name }), _jsx(Small, { color: "grey.500", children: item.username })] })] }), _jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(Email, { sx: iconStyle }), _jsx(Small, { color: "grey.500", children: item.email })] }), _jsxs(Stack, { direction: "row", alignItems: "center", mt: 1, spacing: 1, children: [_jsx(UserBigIcon, { sx: iconStyle }), _jsxs(Small, { color: "grey.500", children: ["Status: ", item.role] })] }), _jsxs(Stack, { direction: "row", alignItems: "center", mt: 1, spacing: 1, children: [_jsx(Chat, { sx: iconStyle }), _jsx(Small, { color: "grey.500", children: "Posts: 12" })] })] }) }, index))), _jsx(Grid, { item: true, xs: 12, children: _jsx(Stack, { alignItems: "center", py: 2, children: _jsx(Pagination, { shape: "rounded", count: Math.ceil(filteredUsers.length / userPerPage), onChange: (_, newPage) => {
                                        setPage(newPage);
                                    } }) }) })] })] }) }));
};
export default UserGrid1PageView;

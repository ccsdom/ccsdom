import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Avatar, Box, Card, Grid, IconButton, Pagination, Stack, } from "@mui/material";
// CUSTOM COMPONENTS
import FlexBetween from "@/components/flexbox/FlexBetween";
import { H6, Paragraph } from "@/components/typography";
// CUSTOM PAGE SECTION COMPONENTS
import SearchArea from "../SearchArea";
import UserDetails from "../UserDetails";
// CUSTOM ICON COMPONENT
import MoreVertical from "@/icons/MoreVertical";
// CUSTOM UTILS METHOD
import { paginate } from "@/utils/paginate";
// CUSTOM DUMMY DATA
import { USER_LIST } from "@/__fakeData__/users";
const UserGrid2PageView = () => {
    const [userPerPage] = useState(21);
    const [page, setPage] = useState(1);
    const [users] = useState([...USER_LIST]);
    const [searchValue, setSearchValue] = useState("");
    const [selectedItem, setSelectedItem] = useState(USER_LIST[1]);
    // handle select
    const handleSelectItem = (id) => setSelectedItem(USER_LIST[id]);
    // active select item
    const activeItem = (id) => selectedItem.id === id;
    const filteredUsers = users.filter((item) => {
        if (searchValue)
            return item.name.toLowerCase().includes(searchValue.toLowerCase());
        else
            return true;
    });
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsxs(Grid, { container: true, children: [_jsx(Grid, { item: true, lg: 9, md: 8, xs: 12, children: _jsxs(Card, { sx: {
                            px: 3,
                            height: "100%",
                            borderTopRightRadius: 0,
                            borderBottomRightRadius: 0,
                        }, children: [_jsx(SearchArea, { value: searchValue, onChange: (e) => setSearchValue(e.target.value), gridRoute: "/dashboard/user-grid-2", listRoute: "/dashboard/user-list-2" }), _jsxs(Grid, { container: true, spacing: 3, children: [paginate(page, userPerPage, filteredUsers).map((item, index) => (_jsx(Grid, { item: true, lg: 4, sm: 6, xs: 12, children: _jsx(Box, { onClick: () => handleSelectItem(index), sx: {
                                                padding: 2,
                                                borderRadius: 2,
                                                cursor: "pointer",
                                                border: "1px solid",
                                                borderColor: "divider",
                                                transition: "all 0.4s",
                                                backgroundColor: activeItem(item.id)
                                                    ? "primary.main"
                                                    : "transparent",
                                            }, children: _jsxs(FlexBetween, { children: [_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(Avatar, { src: item.avatar, sx: { borderRadius: "20%" } }), _jsxs("div", { children: [_jsx(H6, { fontSize: 14, color: activeItem(item.id) ? "white" : "text.primary", children: item.name }), _jsx(Paragraph, { color: activeItem(item.id) ? "white" : "text.secondary", children: item.position })] })] }), _jsx(IconButton, { sx: { padding: 0 }, children: _jsx(MoreVertical, { fontSize: "small", sx: {
                                                                color: activeItem(item.id)
                                                                    ? "white"
                                                                    : "text.secondary",
                                                            } }) })] }) }) }, index))), _jsx(Grid, { item: true, xs: 12, children: _jsx(Stack, { alignItems: "center", marginY: 2, children: _jsx(Pagination, { shape: "rounded", count: Math.ceil(filteredUsers.length / userPerPage), onChange: (_, newPage) => {
                                                    setPage(newPage);
                                                } }) }) })] })] }) }), _jsx(Grid, { item: true, lg: 3, md: 4, xs: 12, children: _jsx(UserDetails, { data: selectedItem }) })] }) }));
};
export default UserGrid2PageView;

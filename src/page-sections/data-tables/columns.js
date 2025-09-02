import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, Checkbox } from "@mui/material";
// CUSTOM COMPONENTS
import FlexBox from "@/components/flexbox/FlexBox";
import { Paragraph, Small } from "@/components/typography";
// common cell component
const CommonCell = ({ title, body }) => (_jsxs("div", { children: [_jsx(Paragraph, { fontWeight: 500, color: "text.primary", children: title }), _jsx(Small, { color: "text.secondary", children: body })] }));
// ===============================
export const columns = [
    {
        id: "select",
        maxSize: 50,
        header: ({ table }) => (_jsx(Checkbox, { checked: table.getIsAllRowsSelected(),
            indeterminate: table.getIsSomeRowsSelected(),
            onChange: table.getToggleAllRowsSelectedHandler() })),
        cell: ({ row }) => (_jsx(Checkbox, { checked: row.getIsSelected(),
            disabled: !row.getCanSelect(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedHandler() })),
    },
    {
        header: "Name",
        minSize: 200,
        accessorKey: "name",
        cell: ({ row }) => {
            const { avatar, name, id } = row.original;
            return (_jsxs(FlexBox, { alignItems: "center", gap: 1.5, children: [_jsx(Avatar, { alt: name, src: avatar, variant: "rounded", sx: { backgroundColor: "action.selected", p: 0.5, pb: 0 } }), _jsx(CommonCell, { title: name, body: id })] }));
        },
    },
    {
        header: "Position",
        accessorKey: "position",
        cell: ({ row }) => (_jsx(CommonCell, { title: row.original.position, body: row.original.experience })),
    },
    {
        maxSize: 80,
        header: "Team",
        accessorKey: "team",
    },
    {
        header: "Birth Date",
        accessorKey: "dateOfBirth",
    },
    {
        header: "Email",
        accessorKey: "email",
        cell: ({ row }) => (_jsx(CommonCell, { title: row.original.email, body: row.original.phone })),
    },
    {
        header: "Address",
        accessorKey: "address",
    },
    {
        header: "Status",
        accessorKey: "status",
    },
];

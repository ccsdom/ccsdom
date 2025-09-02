import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import { Box, Card, Chip, Avatar, IconButton, AvatarGroup, LinearProgress, } from "@mui/material";
import { Draggable } from "react-beautiful-dnd";
// CUSTOM COMPONENTS
import { FlexBetween, FlexBox } from "@/components/flexbox";
import { H6, Paragraph } from "@/components/typography";
// ==============================================================
const TodoCard = ({ id, date, index, title, author, description, statusColor, }) => {
    return (_jsx(Draggable, { draggableId: id, index: index, children: (provided) => {
            return (_jsxs(Card, { ref: provided.innerRef, ...provided.draggableProps, ...provided.dragHandleProps, sx: { ...provided.draggableProps.style, p: 2, mb: 3 }, children: [_jsxs(FlexBetween, { children: [_jsx(Paragraph, { fontWeight: 600, children: "July 2, 2020" }), _jsx(IconButton, { sx: { backgroundColor: "action.selected" }, children: _jsx(MoreHoriz, { fontSize: "small" }) })] }), _jsxs(Box, { sx: { textAlign: "center", pt: 6, pb: 4 }, children: [_jsx(H6, { fontSize: 18, children: "Web Designing" }), _jsx(Paragraph, { mt: 0.5, children: "Prototyping" })] }), _jsxs(FlexBetween, { py: 1, children: [_jsx(Paragraph, { fontWeight: 600, children: "Project Progress" }), _jsx(Paragraph, { fontWeight: 600, children: "32%" })] }), _jsx(LinearProgress, { value: 32, variant: "determinate", sx: {
                            "& .MuiLinearProgress-bar": { backgroundColor: statusColor },
                        } }), _jsxs(FlexBetween, { pt: "1.5rem", children: [_jsx(FlexBox, { alignItems: "center", gap: 1, children: _jsxs(AvatarGroup, { max: 3, children: [_jsx(Avatar, { alt: "Remy", src: "/static/user/user-11.png" }), _jsx(Avatar, { alt: "Travis", src: "/static/user/user-11.png" }), _jsx(Avatar, { alt: "Travis", src: "/static/user/user-11.png" }), _jsx(Avatar, { alt: "Travis", src: "/static/user/user-11.png" })] }) }), _jsx(Chip, { label: "3 Weeks Left", color: "secondary" })] })] }));
        } }, id));
};
export default TodoCard;

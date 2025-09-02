import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, Checkbox, LinearProgress, MenuItem, Stack, styled, } from "@mui/material";
import { nanoid } from "nanoid";
// CUSTOM COMPONENTS
import { Paragraph } from "@/components/typography";
import { MoreButton } from "@/components/more-button";
import { FlexBetween, FlexBox } from "@/components/flexbox";
// STYLED COMPONENT
const TodoItem = styled(FlexBetween, {
    shouldForwardProp: (prop) => prop !== "active",
})(({ theme, active }) => ({
    ...(active && {
        backgroundColor: theme.palette.action.selected,
        "& .title": { color: theme.palette.primary.main },
    }),
}));
const TodoList = () => {
    const [todos, setTodos] = useState([
        { id: nanoid(), title: "Design a poster for a company", complete: true },
        { id: nanoid(), title: "Analyze Data", complete: false },
        { id: nanoid(), title: "YouTube campaign", complete: false },
        { id: nanoid(), title: "Assaign employee", complete: false },
    ]);
    const handleCompleteTodo = (id) => () => {
        setTodos((state) => {
            return state.map((item) => item.id === id ? { ...item, complete: !item.complete } : item);
        });
    };
    const handleDeleteTodo = (id) => {
        setTodos((state) => state.filter((item) => item.id !== id));
    };
    const totalCompletedTodo = todos.filter((item) => item.complete).length;
    const percentageValue = Math.round((totalCompletedTodo * 100) / todos.length);
    return (_jsxs(Card, { children: [_jsxs(FlexBetween, { p: 3, children: [_jsx(Paragraph, { fontSize: 18, fontWeight: 500, children: "To-do list" }), _jsx(MoreButton, { size: "small" })] }), _jsxs(FlexBox, { px: 3, alignItems: "center", gap: 1, children: [_jsxs(Paragraph, { fontWeight: 500, color: "primary.main", children: [percentageValue, "%"] }), _jsx(LinearProgress, { value: percentageValue, color: "primary", variant: "determinate", sx: { height: 8 } })] }), _jsx(Stack, { spacing: 1, py: 2, children: todos.map(({ id, title, complete }) => (_jsxs(TodoItem, { px: 2, active: complete ? 1 : 0, children: [_jsxs(FlexBox, { alignItems: "center", children: [_jsx(Checkbox, { onChange: handleCompleteTodo(id), checked: complete }), _jsx(Paragraph, { fontWeight: 500, className: "title", color: "grey.500", children: title })] }), _jsx(MoreButton, { size: "medium", renderOptions: (handleClose) => (_jsx(MenuItem, { onClick: () => {
                                    handleClose();
                                    handleDeleteTodo(id);
                                }, children: "Delete" })) })] }, id))) })] }));
};
export default TodoList;

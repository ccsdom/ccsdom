import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
// MUI COMPONENTS
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
// CUSTOM COMPONENTS
import TodoCard from "./TodoCard";
import TodoForm from "./TodoForm";
import { H6 } from "@/components/typography";
// COMMON STYLED COMPONENT
import { DroppableWrapper } from "./styles";
// DUMMY CUSTOM DATA
const TODOS = [
    {
        id: "01",
        title: "Create Minimal Logo",
        date: "9/17/2021",
        description: "Hey, Pixy can we get on a quick call? i need to show you something. You need to do some work for me ASAP. And you need to do it before Aug 25. Thanks get back to me.",
        author: { name: "Tom Cruise", image: "/static/avatar/001-man.svg" },
        statusColor: "primary.main",
    },
    {
        id: "02",
        title: "Therapy Session",
        date: "9/17/2021",
        description: "Hey, Pixy can we get on a quick call? i need to show you something. You need to do some work for me ASAP. And you need to do it before Aug 25. Thanks get back to me.",
        author: { name: "Tom Cruise", image: "/static/avatar/002-girl.svg" },
        statusColor: "primary.red",
    },
    {
        id: "03",
        title: "Create Minimal Logo",
        date: "9/17/2021",
        description: "Hey, Pixy can we get on a quick call? i need to show you something. You need to do some work for me ASAP. And you need to do it before Aug 25. Thanks get back to me.",
        author: { name: "Tom Cruise", image: "/static/avatar/005-man-1.svg" },
        statusColor: "primary.main",
    },
    {
        id: "04",
        title: "Website UI Design",
        date: "9/17/2021",
        description: "Hey, Pixy can we get on a quick call? i need to show you something. You need to do some work for me ASAP. And you need to do it before Aug 25. Thanks get back to me.",
        author: { name: "Tom Cruise", image: "/static/avatar/011-man-2.svg" },
        statusColor: "primary.yellow",
    },
];
const VIEW_COLUMNS = {
    todo: { name: "To do", todos: TODOS.slice(0, 2) },
    progress: { name: "In Progress", todos: [TODOS[2]] },
    done: { name: "Done", todos: [TODOS[3]] },
};
const TodoListView = () => {
    const [boardList, setBoardList] = useState(VIEW_COLUMNS);
    const [showAddTodoForm, setShowAddTodoForm] = useState(false);
    const onDragEnd = (result, columns, setColumns) => {
        if (!result.destination)
            return;
        const { source, destination } = result;
        if (source.droppableId !== destination.droppableId) {
            const sourceColumn = columns[source.droppableId];
            const destColumn = columns[destination.droppableId];
            const sourceItems = [...sourceColumn.todos];
            const destItems = [...destColumn.todos];
            const [removed] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [source.droppableId]: { ...sourceColumn, todos: sourceItems },
                [destination.droppableId]: { ...destColumn, todos: destItems },
            });
        }
        else {
            const column = columns[source.droppableId];
            const copiedItems = [...column.todos];
            const [removed] = copiedItems.splice(source.index, 1);
            copiedItems.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [source.droppableId]: { ...column, todos: copiedItems },
            });
        }
    };
    return (_jsx(Box, { pt: 2, pb: 4, children: _jsx(Grid, { container: true, spacing: 3, children: _jsx(DragDropContext, { onDragEnd: (result) => onDragEnd(result, boardList, setBoardList), children: Object.entries(boardList).map(([columnId, column]) => {
                    return (_jsx(Grid, { item: true, xs: 12, sm: 6, lg: 4, children: _jsxs(Card, { sx: { height: "100%", maxHeight: 750 }, children: [columnId === "todo" ? (_jsx(TodoForm, { title: column.name, show: showAddTodoForm, handleOpen: () => setShowAddTodoForm(true), handleClose: () => setShowAddTodoForm(false) })) : (_jsx(H6, { fontSize: 18, p: 2, children: column.name })), _jsx(Droppable, { droppableId: columnId, children: (provided) => {
                                        return (_jsxs(DroppableWrapper, { ref: provided.innerRef, ...provided.droppableProps, children: [column.todos.map((todo, index) => (_jsx(TodoCard, { index: index, ...todo }, todo.id))), provided.placeholder] }));
                                    } }, columnId)] }) }, columnId));
                }) }) }) }));
};
export default TodoListView;

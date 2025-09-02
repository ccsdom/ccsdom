import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Container, TextField, styled } from "@mui/material";
import Search from "@mui/icons-material/Search";
// CUSTOM COMPONENT
import { H1 } from "@/components/typography";
// STYLED COMPONENTS
const SearchWrapper = styled("div")({
    paddingBlock: "3rem",
    backgroundImage: "linear-gradient(270.02deg, #0E1421 55.41%, #270B63 100.36%)",
});
const StyledTextField = styled(TextField)({
    maxWidth: 450,
    width: "100%",
    ".MuiOutlinedInput-root": {
        borderRadius: 8,
        backgroundColor: "white",
    },
});
const ContentWrapper = styled("div")(({ theme }) => ({
    gap: 16,
    display: "grid",
    alignItems: "center",
    gridTemplateColumns: "1fr 1fr",
    [theme.breakpoints.down("md")]: {
        gap: 32,
        gridTemplateColumns: "1fr",
        "& .content": { textAlign: "center" },
    },
}));
const Section1 = () => {
    return (_jsx(SearchWrapper, { children: _jsx(Container, { maxWidth: "lg", children: _jsxs(ContentWrapper, { children: [_jsxs(Box, { className: "content", children: [_jsx(H1, { mb: 3, color: "white", fontSize: { sm: 52, xs: 42 }, children: "Find Your Dream Job!" }), _jsx(StyledTextField, { placeholder: "Search Job", InputProps: { startAdornment: _jsx(Search, {}) } })] }), _jsx(Box, { textAlign: "center", children: _jsx("img", { src: "/static/pages/career.svg", alt: "career" }) })] }) }) }));
};
export default Section1;

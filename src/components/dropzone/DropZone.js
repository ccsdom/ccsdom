import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { styled } from "@mui/material/styles";
import { useDropzone, } from "react-dropzone";
// CUSTOM COMPONENTS
import { H6, Paragraph } from "@/components/typography";
// CUSTOM ICON COMPONENT
import UploadOnCloud from "@/icons/UploadOnCloud";
// STYLED COMPONENT
const RootStyle = styled("div")(({ theme }) => ({
    padding: 32,
    borderRadius: 16,
    cursor: "pointer",
    textAlign: "center",
    border: `1px dashed ${theme.palette.grey[400]}`,
}));
// =======================================================================
const DropZone = ({ onDrop }) => {
    const { getRootProps, getInputProps } = useDropzone({
        accept: { "image/*": [".png", ".gif", ".jpeg", ".jpg"] },
        onDrop,
    });
    return (_jsxs(RootStyle, { ...getRootProps({ className: "dropzone" }), children: [_jsx(UploadOnCloud, { sx: { fontSize: 38, color: "text.secondary" } }), _jsx(Paragraph, { color: "text.secondary", children: "Drop your images here or" }), _jsx(H6, { fontSize: 16, color: "primary.main", children: "Select click to browse" }), _jsx("input", { ...getInputProps(), placeholder: "Select click to browse" })] }));
};
export default DropZone;

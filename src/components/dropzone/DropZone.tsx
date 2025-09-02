import { FC } from "react";
import { styled } from "@mui/material/styles";
import {
  DropEvent,
  DropzoneOptions,
  FileRejection,
  useDropzone,
} from "react-dropzone";
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
interface DropZoneProps extends DropzoneOptions {
  onDrop: <T extends File>(
    acceptedFiles: T[],
    fileRejections: FileRejection[],
    event: DropEvent,
  ) => void;
}
// =======================================================================

const DropZone: FC<DropZoneProps> = ({ onDrop }) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [".png", ".gif", ".jpeg", ".jpg"] },
    onDrop,
  });

  return (
    <RootStyle {...getRootProps({ className: "dropzone" })}>
      <UploadOnCloud sx={{ fontSize: 38, color: "text.secondary" }} />
      <Paragraph color="text.secondary">Drop your images here or</Paragraph>
      <H6 fontSize={16} color="primary.main">
        Select click to browse
      </H6>

      <input {...getInputProps()} placeholder="Select click to browse" />
    </RootStyle>
  );
};

export default DropZone;

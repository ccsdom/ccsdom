import React, { useState } from "react";
import { Box, Button, Typography, List, ListItem, Collapse } from "@mui/material";
import { Folder, InsertDriveFile } from "@mui/icons-material";

type FileNode = {
  name: string;
  type: "folder" | "file";
  children?: FileNode[];
};

const exampleFileTree: FileNode[] = [
  {
    name: "Contrats",
    type: "folder",
    children: [
      { name: "Contrat_2023.pdf", type: "file" },
      { name: "Contrat_2024.pdf", type: "file" },
    ],
  },
  {
    name: "Factures",
    type: "folder",
    children: [
      { name: "Facture_001.pdf", type: "file" },
      { name: "Facture_002.pdf", type: "file" },
    ],
  },
  { name: "Résumé_client.docx", type: "file" },
];

const FileTreeView: React.FC<{ nodes: FileNode[] }> = ({ nodes }) => {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (folderName: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  return (
    <List>
      {nodes.map((node) =>
        node.type === "folder" ? (
          <Box key={node.name} sx={{ pl: 2 }}>
            <ListItem button onClick={() => toggleFolder(node.name)}>
              <Folder />
              <Typography sx={{ ml: 1 }}>{node.name}</Typography>
            </ListItem>
            <Collapse in={openFolders[node.name]} timeout="auto" unmountOnExit>
              <FileTreeView nodes={node.children || []} />
            </Collapse>
          </Box>
        ) : (
          <ListItem key={node.name} sx={{ pl: 4 }}>
            <InsertDriveFile />
            <Typography sx={{ ml: 1 }}>{node.name}</Typography>
          </ListItem>
        )
      )}
    </List>
  );
};

export default FileTreeView;

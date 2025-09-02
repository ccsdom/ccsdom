import React from "react";
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Description } from "@mui/icons-material";

type Folder = {
  name: string;
  files: string[];
};

type Props = {
  folders: Folder[];
};

const ClientFoldersColumns: React.FC<Props> = ({ folders }) => {
  return (
    <Box display="flex" gap={2} mt={3}>
      {folders.map((folder) => (
        <Paper
          key={folder.name}
          sx={{ p: 2, flex: 1, maxHeight: 300, overflowY: "auto", minWidth: 150 }}
          elevation={3}
        >
          <Typography variant="subtitle1" gutterBottom>
            {folder.name}
          </Typography>
          <List dense>
            {folder.files.length > 0 ? (
              folder.files.map((fileName, idx) => (
                <ListItem key={idx}>
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  <ListItemText primary={fileName} />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ pl: 2 }}>
                Aucun fichier
              </Typography>
            )}
          </List>
        </Paper>
      ))}
    </Box>
  );
};

export default ClientFoldersColumns;

import React from 'react';
import {
  Group,
  Text,
  Button,
  TextInput,
  Menu,
  Box
} from "@mantine/core";
import {
  Database,
  Search,
  Save,
  FolderOpen,
  FilePlus,
  FileText
} from "lucide-react";

interface HeaderProps {
  onNewFile: () => void;
  onOpenFile: () => void;
  onSaveFile?: () => void;
}

export const HeaderContent: React.FC<HeaderProps> = ({ 
  onNewFile, 
  onOpenFile,
  onSaveFile 
}) => (
  <Group h="100%" px="md" justify="space-between" style={{ borderBottom: "1px solid var(--mantine-color-dark-6)" }} data-tauri-drag-region>
    <Group data-tauri-drag-region>
      <Group gap={6} mr="lg" style={{ userSelect: 'none' }}>
        <Database size={18} color="#339af0" />
        <Text fw={700} size="sm" c="gray.3">DataTex <Text span size="xs" c="dimmed">v2.0</Text></Text>
      </Group>
      <Group gap={0} visibleFrom="sm">
        {["File", "Edit", "View", "Go", "Help"].map((label) => (
          <Menu key={label} shadow="md" width={200}>
            <Menu.Target>
                <Button variant="subtle" color="gray" size="compact-xs" radius="sm" fw={400} style={{ fontSize: 12 }}>{label}</Button>
            </Menu.Target>
            <Menu.Dropdown>
              {label === 'File' && (
                <>
                  <Menu.Item leftSection={<FilePlus size={14}/>} onClick={onNewFile}>New File</Menu.Item>
                  <Menu.Item leftSection={<FolderOpen size={14}/>} onClick={onOpenFile}>Open Folder</Menu.Item>
                  <Menu.Item leftSection={<Save size={14}/>} onClick={onSaveFile}>Save</Menu.Item>
                  <Menu.Divider />
                  <Menu.Item leftSection={<FileText size={14}/>}>Export to PDF</Menu.Item>
                </>
              )}
              {label === 'Edit' && (
                  <>
                    <Menu.Item>Undo</Menu.Item>
                    <Menu.Item>Redo</Menu.Item>
                    <Menu.Divider />
                    <Menu.Item>Cut</Menu.Item>
                    <Menu.Item>Copy</Menu.Item>
                    <Menu.Item>Paste</Menu.Item>
                  </>
              )}
              {label !== 'File' && label !== 'Edit' && (
                  <Menu.Item>Placeholder Action</Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        ))}
      </Group>
    </Group>
    <Box style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: '30%' }}>
      <TextInput 
        placeholder="DataTex Search (Ctrl+P)" 
        leftSection={<Search size={12} />} 
        size="xs" 
        radius="md" 
        styles={{ 
            input: { 
                height: 24, 
                minHeight: 24, 
                backgroundColor: "var(--mantine-color-dark-6)", 
                borderColor: "transparent", 
                color: "#fff", 
                textAlign: 'center' 
            } 
        }} 
      />
    </Box>
    <Box w={100} /> 
  </Group>
);
import { useState, useRef, useEffect, useCallback } from "react";
import {
  AppShell,
  Group,
  Stack,
  Text,
  ActionIcon,
  Tooltip,
  Button,
  ScrollArea,
  TextInput,
  Badge,
  MantineProvider,
  createTheme,
  Box,
} from "@mantine/core";

// Editor Import
import Editor, { OnMount } from "@monaco-editor/react";

// Wizard Imports
import { PreambleWizard } from "./components/wizards/PreambleWizard";
import { TableWizard } from "./components/wizards/TableWizard";
import { TikzWizard } from "./components/wizards/TikzWizard";

import { latexLanguage, latexConfiguration } from "./languages/latex";
import { dataTexDarkTheme } from "./themes/monaco-theme";

import {
  Files,
  Database,
  Search,
  Settings,
  Wand2,
  Play,
  FileCode,
  Table2,
  Columns,
  X,
  ChevronDown,
  TerminalSquare,
  Maximize2,
  MoreVertical,
  ChevronRight,
  ArrowLeft,
  GripVertical 
} from "lucide-react";

// --- Theme Configuration ---
const theme = createTheme({
  primaryColor: "blue",
  defaultRadius: "sm",
  fontFamily: "Inter, sans-serif",
  colors: {
    dark: [
      "#C1C2C5",
      "#A6A7AB",
      "#909296",
      "#5c5f66",
      "#373A40",
      "#2C2E33",
      "#25262b",
      "#1A1B1E",
      "#141517",
      "#101113",
    ],
  },
});

// --- Types ---
type SidebarSection = "files" | "search" | "database" | "wizards";
type ViewType = "editor" | "wizard-preamble" | "wizard-table" | "wizard-tikz";

interface EditorFile {
  id: string;
  name: string;
  content: string;
  language: string;
  isDirty?: boolean;
}

// --- Initial Data ---
const INITIAL_CODE = `\\documentclass{article}
\\usepackage{amsmath}
\\usepackage{tikz}

% Welcome to DataTex v2
\\begin{document}

  \\section{Εισαγωγή}
  Ξεκινήστε γράφοντας κώδικα ή χρησιμοποιήστε τους Wizards από την πλαϊνή μπάρα.
  
  \\begin{equation}
     E = mc^2
  \\end{equation}

\\end{document}`;

const MOCK_TABLES = [
  { name: "exercises_algebra", count: 150 },
  { name: "geometry_theorems", count: 45 },
  { name: "physics_problems", count: 89 },
];

// --- Helper Component: Resizer Handle ---
const ResizerHandle = ({ onMouseDown, isResizing }: { onMouseDown: (e: React.MouseEvent) => void, isResizing: boolean }) => (
  <Box
    onMouseDown={onMouseDown}
    w={6}
    h="100%"
    bg={isResizing ? "blue.6" : "transparent"}
    style={{
      cursor: "col-resize",
      transition: "background-color 0.2s",
      zIndex: 50,
      position: 'relative',
      userSelect: 'none',
      ":hover": {
        backgroundColor: "var(--mantine-color-blue-6)",
      }
    }}
  />
);

// --- Components ---

// 1. Activity Bar
const ActivityBar = ({
  active,
  setActive,
}: {
  active: SidebarSection;
  setActive: (v: SidebarSection) => void;
}) => {
  const items = [
    { icon: Files, label: "Αρχεία", id: "files" },
    { icon: Search, label: "Αναζήτηση", id: "search" },
    { icon: Database, label: "Βάση Δεδομένων", id: "database" },
    { icon: Wand2, label: "Wizards", id: "wizards" },
  ];

  return (
    <Stack
      w={50}
      h="100%"
      align="center"
      gap="md"
      py="md"
      bg="dark.8"
      style={{ borderRight: "1px solid var(--mantine-color-dark-6)", flexShrink: 0 }}
    >
      {items.map((item) => (
        <Tooltip
          label={item.label}
          key={item.id}
          position="right"
          withArrow
          transitionProps={{ duration: 0 }}
        >
          <ActionIcon
            variant={active === item.id ? "filled" : "subtle"}
            color={active === item.id ? "blue" : "gray"}
            size="lg"
            onClick={() => setActive(item.id as SidebarSection)}
            radius="md"
          >
            <item.icon size={22} strokeWidth={1.5} />
          </ActionIcon>
        </Tooltip>
      ))}

      <Box style={{ marginTop: "auto" }}>
        <Tooltip label="Ρυθμίσεις" position="right" withArrow>
          <ActionIcon variant="subtle" color="gray" size="lg">
            <Settings size={22} strokeWidth={1.5} />
          </ActionIcon>
        </Tooltip>
      </Box>
    </Stack>
  );
};

// 2. Sidebar Content
const SidebarContent = ({
  activeSection,
  onNavigate,
  files,
  activeFileId,
  onFileSelect,
}: {
  activeSection: SidebarSection;
  onNavigate: (view: ViewType) => void;
  files: EditorFile[];
  activeFileId: string;
  onFileSelect: (id: string) => void;
}) => {
  return (
    <Stack gap={0} h="100%" bg="dark.7">
      <Group
        justify="space-between"
        px="xs"
        h={36}
        style={{ borderBottom: "1px solid var(--mantine-color-dark-6)" }}
      >
        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
          {activeSection === "files" && "Explorer"}
          {activeSection === "database" && "DataTex DB"}
          {activeSection === "wizards" && "Wizards"}
          {activeSection === "search" && "Αναζήτηση"}
        </Text>
        <ActionIcon variant="subtle" size="xs" color="gray">
          <MoreVertical size={14} />
        </ActionIcon>
      </Group>

      <ScrollArea style={{ flex: 1 }}>
        {activeSection === "files" && (
          <Stack gap={2} p="xs">
            <Group gap={4} py={4} px={6} bg="dark.6" style={{ borderRadius: 4 }}>
              <ChevronDown size={14} />
              <Text size="xs" fw={700}>
                OPEN EDITORS
              </Text>
            </Group>
            {files.map((f) => (
              <Group
                key={f.id}
                gap={8}
                pl={24}
                py={4}
                style={{ 
                  cursor: "pointer", 
                  borderRadius: 4,
                  backgroundColor: f.id === activeFileId ? 'var(--mantine-color-blue-9)' : 'transparent'
                }}
                onClick={() => onFileSelect(f.id)}
              >
                <FileCode size={14} color="#4dabf7" />
                <Text size="sm" c={f.id === activeFileId ? "white" : "gray.3"}>
                  {f.name}
                </Text>
              </Group>
            ))}
          </Stack>
        )}

        {activeSection === "wizards" && (
          <Stack gap="xs" p="xs">
            <Button
              variant="light"
              color="violet"
              justify="start"
              leftSection={<FileCode size={16} />}
              onClick={() => onNavigate("wizard-preamble")}
            >
              New Project / Preamble
            </Button>
            <Button
              variant="light"
              color="green"
              justify="start"
              leftSection={<Table2 size={16} />}
              onClick={() => onNavigate("wizard-table")}
            >
              Table Generator
            </Button>
            <Button
              variant="light"
              color="orange"
              justify="start"
              leftSection={<Wand2 size={16} />}
              onClick={() => onNavigate("wizard-tikz")}
            >
              TikZ / Plot Builder
            </Button>
          </Stack>
        )}

        {activeSection === "database" && (
          <Stack gap="md" p="xs">
            <Button
              size="xs"
              leftSection={<Database size={14} />}
              fullWidth
              variant="light"
            >
              Σύνδεση DB
            </Button>
            <Box>
              <Text size="xs" fw={700} c="dimmed" mb="xs">
                TABLES
              </Text>
              {MOCK_TABLES.map((t) => (
                <Group
                  key={t.name}
                  justify="space-between"
                  mb={4}
                  p={4}
                  style={{ cursor: "pointer", borderRadius: 4 }}
                >
                  <Group gap={6}>
                    <Table2 size={14} color="#69db7c" />
                    <Text size="sm" truncate>
                      {t.name}
                    </Text>
                  </Group>
                  <Badge size="xs" variant="outline" color="gray">
                    {t.count}
                  </Badge>
                </Group>
              ))}
            </Box>
          </Stack>
        )}
      </ScrollArea>
    </Stack>
  );
};

// 3. Main Editor Area
const EditorArea = ({ 
  files, 
  activeFileId, 
  onFileSelect, 
  onFileClose,
  onContentChange,
  onMount 
}: { 
  files: EditorFile[], 
  activeFileId: string, 
  onFileSelect: (id: string) => void,
  onFileClose: (id: string, e: React.MouseEvent) => void,
  onContentChange: (id: string, content: string) => void,
  onMount: OnMount 
}) => {
  
  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  return (
    <Stack gap={0} h="100%" w="100%">
      {/* Tabs */}
      <ScrollArea type="hover" scrollbarSize={6} bg="dark.8" style={{ borderBottom: "1px solid var(--mantine-color-dark-6)", whiteSpace: 'nowrap' }}>
        <Group gap={1} pt={4} px={4} wrap="nowrap">
          {files.map(file => (
            <Box
              key={file.id}
              py={6}
              px={12}
              bg={file.id === activeFileId ? "dark.7" : "transparent"}
              style={{
                borderTop: file.id === activeFileId ? "2px solid #339af0" : "2px solid transparent",
                borderRight: "1px solid var(--mantine-color-dark-6)",
                borderTopRightRadius: 4,
                borderTopLeftRadius: 4,
                cursor: "pointer",
                minWidth: 120,
              }}
              onClick={() => onFileSelect(file.id)}
            >
              <Group gap={8} wrap="nowrap">
                <FileCode size={14} color={file.id === activeFileId ? "#4dabf7" : "#666"} />
                <Text size="xs" c={file.id === activeFileId ? "white" : "dimmed"}>
                  {file.name}
                </Text>
                <ActionIcon 
                  size="xs" 
                  variant="transparent" 
                  color="gray" 
                  className="close-tab"
                  onClick={(e) => onFileClose(file.id, e)}
                  style={{ opacity: file.id === activeFileId ? 1 : 0.5 }}
                >
                  <X size={12} />
                </ActionIcon>
              </Group>
            </Box>
          ))}
        </Group>
      </ScrollArea>

      {/* Toolbar */}
      <Group
        h={32}
        px="md"
        bg="dark.7"
        justify="space-between"
        style={{ borderBottom: "1px solid var(--mantine-color-dark-6)" }}
      >
        <Group gap={4}>
          <Text size="xs" c="dimmed">DataTex</Text>
          <ChevronRight size={12} color="gray" />
          <Text size="xs" c="white">{activeFile?.name}</Text>
        </Group>
        <Group gap="xs">
          <Tooltip label="Compile">
            <ActionIcon size="sm" variant="subtle" color="green">
              <Play size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* Split View */}
      <Group
        gap={0}
        style={{ flex: 1, overflow: "hidden", alignItems: "stretch" }}
      >
        <Box style={{ flex: 1, position: "relative" }}>
          {activeFile ? (
            <Editor
              path={activeFile.id} 
              height="100%"
              defaultLanguage="my-latex"
              defaultValue={activeFile.content}
              onMount={onMount}
              onChange={(value) => onContentChange(activeFile.id, value || '')}
              options={{
                minimap: { enabled: true, scale: 0.75 },
                fontSize: 14,
                fontFamily: "Consolas, monospace",
                scrollBeyondLastLine: false,
                automaticLayout: true, // This can be heavy, but RAF helps smooth it out
                theme: "data-tex-dark",
              }}
            />
          ) : (
             <Box h="100%" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Text c="dimmed">No open files</Text>
             </Box>
          )}
        </Box>

        {/* PDF Preview Area */}
        <Box
          w="50%"
          h="100%"
          bg="dark.6"
          style={{
            borderLeft: "1px solid var(--mantine-color-dark-5)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Group
            justify="space-between"
            px="xs"
            py={4}
            bg="dark.7"
            style={{ borderBottom: "1px solid var(--mantine-color-dark-5)" }}
          >
            <Text size="xs" fw={700} c="dimmed">
              PDF PREVIEW
            </Text>
            <ActionIcon size="xs" variant="transparent">
              <Maximize2 size={12} />
            </ActionIcon>
          </Group>
          <Box
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            bg="gray.7"
          >
            <Box
              w="80%"
              h="90%"
              bg="white"
              p="xl"
              style={{
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                color: "black",
                overflowY: "auto",
              }}
            >
              <Text size="xl" fw={700} mb="md">1 Εισαγωγή</Text>
              <Text size="sm">Preview for: {activeFile?.name}</Text>
            </Box>
          </Box>
        </Box>
      </Group>
    </Stack>
  );
};

// 4. Status Bar
const StatusBar = ({ activeFile }: { activeFile?: EditorFile }) => (
  <Group
    h={24}
    px="xs"
    justify="space-between"
    bg="blue.8"
    c="white"
    style={{ fontSize: "11px", userSelect: "none" }}
  >
    <Group gap="lg">
      <Group gap={4}>
        <TerminalSquare size={12} />
        <Text size="xs" inherit>Ready</Text>
      </Group>
    </Group>
    <Group gap="lg">
      <Text size="xs" inherit>{activeFile?.language || 'Plain Text'}</Text>
      <Text size="xs" inherit>UTF-8</Text>
      <Group gap={4}>
        <Database size={10} />
        <Text size="xs" inherit>DataTex DB: Connected</Text>
      </Group>
    </Group>
  </Group>
);

// --- Main App ---

export default function App() {
  const [activeActivity, setActiveActivity] = useState<SidebarSection>("files");
  const [activeView, setActiveView] = useState<ViewType>("editor");
  
  // --- Resizing State ---
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [wizardWidth, setWizardWidth] = useState(450);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingWizard, setIsResizingWizard] = useState(false);

  // Use Ref for Animation Frame to throttle resize events
  const rafRef = useRef<number | null>(null);

  // --- File Management State ---
  const [files, setFiles] = useState<EditorFile[]>([
    { id: '1', name: 'document.tex', content: INITIAL_CODE, language: 'latex' }
  ]);
  const [activeFileId, setActiveFileId] = useState<string>('1');

  const editorRef = useRef<any>(null);

  // --- RESIZE LOGIC ---
  const startResizingSidebar = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); 
    setIsResizingSidebar(true);
  }, []);

  const startResizingWizard = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); 
    setIsResizingWizard(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Prevent running this on every pixel move if previous frame hasn't rendered
      if (rafRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        if (isResizingSidebar) {
          const newWidth = e.clientX - 50; 
          if (newWidth > 150 && newWidth < 600) setSidebarWidth(newWidth);
        }
        if (isResizingWizard) {
          const newWidth = window.innerWidth - e.clientX;
          if (newWidth > 300 && newWidth < 900) setWizardWidth(newWidth);
        }
        rafRef.current = null;
      });
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      setIsResizingWizard(false);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    if (isResizingSidebar || isResizingWizard) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.cursor = 'default';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isResizingSidebar, isResizingWizard]);


  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    if (!monaco.languages.getLanguages().some((l: any) => l.id === "my-latex")) {
      monaco.languages.register({ id: "my-latex" });
      monaco.languages.setMonarchTokensProvider("my-latex", latexLanguage);
      monaco.languages.setLanguageConfiguration("my-latex", latexConfiguration);
      monaco.editor.defineTheme("data-tex-dark", dataTexDarkTheme);
    }
    monaco.editor.setTheme("data-tex-dark");
  };

  // --- ACTIONS ---

  const handleCreateDocument = (code: string) => {
    const newId = Date.now().toString();
    const newCount = files.length + 1;
    const newFile: EditorFile = {
      id: newId,
      name: `document_${newCount}.tex`,
      content: code,
      language: 'latex',
      isDirty: true
    };
    
    setFiles([...files, newFile]);
    setActiveFileId(newId);
    setActiveView("editor"); 
  };

  const handleInsertSnippet = (code: string) => {
    if (files.length === 0) {
      handleCreateDocument(code);
      return;
    }

    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      const range = selection || {
          startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1
      };
      
      const op = {
        range: range,
        text: code,
        forceMoveMarkers: true,
      };
      
      editorRef.current.executeEdits("wizard-insert", [op]);
      editorRef.current.focus();
    }
  };

  const handleFileClose = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFiles = files.filter(f => f.id !== id);
    setFiles(newFiles);
    if (activeFileId === id && newFiles.length > 0) {
      setActiveFileId(newFiles[newFiles.length - 1].id);
    }
  };

  const handleContentChange = (id: string, newContent: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, content: newContent, isDirty: true } : f));
  };

  // Wrapper for Side Panel Wizards
  const WizardWrapper = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
    <Stack gap={0} h="100%" bg="dark.8" style={{ borderLeft: "1px solid var(--mantine-color-dark-6)" }}>
      <Group h={40} px="md" bg="dark.7" justify="space-between" style={{ borderBottom: "1px solid var(--mantine-color-dark-6)" }}>
        <Text size="sm" fw={700}>{title}</Text>
        <ActionIcon variant="subtle" size="sm" onClick={onClose} aria-label="Close Wizard">
           <X size={16} />
        </ActionIcon>
      </Group>
      <Box style={{ flex: 1, overflow: "hidden" }}>{children}</Box>
    </Stack>
  );

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <AppShell
        header={{ height: 35 }}
        navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: true } }}
        footer={{ height: 24 }}
        padding={0}
      >
        <AppShell.Header withBorder={false} bg="dark.9">
          <Group h="100%" px="md" justify="space-between" style={{ borderBottom: "1px solid var(--mantine-color-dark-6)" }}>
            <Group>
              <Group gap={6}>
                <Database size={18} color="#339af0" />
                <Text fw={700} size="sm" c="gray.3">
                  DataTex <Text span size="xs" c="dimmed" fw={400}>v2.0</Text>
                </Text>
              </Group>
            </Group>
            <Group>
              <TextInput
                placeholder="Search..."
                leftSection={<Search size={12} />}
                size="xs"
                styles={{ input: { height: 24, minHeight: 24, backgroundColor: "var(--mantine-color-dark-8)", borderColor: "var(--mantine-color-dark-5)" } }}
              />
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Main bg="dark.9" style={{ display: "flex", flexDirection: "column", height: "100vh", paddingTop: 35, paddingBottom: 24 }}>
          
          {/* SMOOTH DRAG OVERLAY - COVERS EVERYTHING */}
          {(isResizingSidebar || isResizingWizard) && (
            <Box 
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 9999,
                cursor: 'col-resize',
                userSelect: 'none' // Critical for blocking selection
              }}
            />
          )}

          <Group gap={0} h="100%" align="stretch" style={{ flex: 1, overflow: "hidden" }}>
            <ActivityBar active={activeActivity} setActive={setActiveActivity} />
            
            {/* SIDEBAR AREA (Resizable) */}
            <Box w={sidebarWidth} h="100%" style={{ borderRight: "1px solid var(--mantine-color-dark-6)", flexShrink: 0 }}>
              <SidebarContent 
                activeSection={activeActivity} 
                onNavigate={setActiveView} 
                files={files}
                activeFileId={activeFileId}
                onFileSelect={setActiveFileId}
              />
            </Box>

            {/* SIDEBAR RESIZER HANDLE */}
            <ResizerHandle onMouseDown={startResizingSidebar} isResizing={isResizingSidebar} />
            
            {/* MAIN CONTENT AREA - FLEX ROW */}
            <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
              
              {/* EDITOR COLUMN - Always Rendered */}
              <Box style={{ flex: 1, minWidth: 200, height: '100%' }}>
                <EditorArea 
                  files={files}
                  activeFileId={activeFileId}
                  onFileSelect={setActiveFileId}
                  onFileClose={handleFileClose}
                  onContentChange={handleContentChange}
                  onMount={handleEditorDidMount}
                />
              </Box>
              
              {/* WIZARD COLUMN (Resizable) */}
              {activeView !== "editor" && (
                <>
                  {/* WIZARD RESIZER HANDLE */}
                  <ResizerHandle onMouseDown={startResizingWizard} isResizing={isResizingWizard} />

                  <Box w={wizardWidth} h="100%" style={{ flexShrink: 0 }}>
                    {activeView === "wizard-preamble" && (
                      <WizardWrapper title="Preamble Wizard" onClose={() => setActiveView("editor")}>
                        <PreambleWizard onInsert={handleCreateDocument} />
                      </WizardWrapper>
                    )}
                    
                    {activeView === "wizard-table" && (
                      <WizardWrapper title="Table Wizard" onClose={() => setActiveView("editor")}>
                        <TableWizard onInsert={handleInsertSnippet} />
                      </WizardWrapper>
                    )}
                    
                    {activeView === "wizard-tikz" && (
                      <WizardWrapper title="TikZ Wizard" onClose={() => setActiveView("editor")}>
                        <TikzWizard onInsert={handleInsertSnippet} />
                      </WizardWrapper>
                    )}
                  </Box>
                </>
              )}
            </Box>
          </Group>
        </AppShell.Main>

        <AppShell.Footer withBorder={false} p={0}>
          <StatusBar activeFile={files.find(f => f.id === activeFileId)} />
        </AppShell.Footer>
      </AppShell>
    </MantineProvider>
  );
}
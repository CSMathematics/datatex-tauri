import { useEffect, useMemo, useCallback, useState } from "react";
import {
  Stack,
  Text,
  Loader,
  Box,
  Checkbox,
  UnstyledButton,
  Modal,
  Button,
  Group,
  ActionIcon,
  ScrollArea,
  Divider,
  TextInput,
  Menu,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSync,
  faDatabase,
  faTrash,
  faFolder,
  faWandMagicSparkles,
  faTable,
  faPenNib,
  faEllipsisVertical, // New Icon
} from "@fortawesome/free-solid-svg-icons";
import { useDatabaseStore } from "../../stores/databaseStore";
import { useProjectStore } from "../../stores/projectStore";
import { open } from "@tauri-apps/plugin-dialog";

// Import shared tree components
import {
  TreeNode,
  TreeItemConfig,
  TreeItemCallbacks,
  UnifiedTreeItem,
  TreeToolbar,
  TreeSearchInput,
  useTreeState,
  ToolbarAction,
} from "../shared/tree";
import { FileSystemNode } from "../layout/Sidebar";

// Allowed file extensions for the file tree view
const ALLOWED_EXTENSIONS = [
  "tex",
  "pdf",
  "bib",
  "sty",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "svg",
  "webp",
];

// View types for the sidebar
type SidebarViewType = "collections" | "projects";

// Props for project folder operations
interface DatabaseSidebarProps {
  // Project folder operations (passed from App.tsx)
  onOpenFolder?: () => void;
  onRemoveFolder?: (path: string) => void;
  onOpenFileNode?: (node: FileSystemNode) => void;
  onCreateItem?: (
    name: string,
    type: "file" | "folder",
    parentPath: string
  ) => void;
  onRenameItem?: (node: FileSystemNode, newName: string) => void;
  onDeleteItem?: (node: FileSystemNode) => void;
  // Navigation to wizards
  onNavigate?: (view: string) => void;
}

/**
 * Database Sidebar component.
 * Shows Collections, DB File Tree, or Project Folders (3-way toggle).
 * Now uses shared UnifiedTreeItem component for file trees.
 */
export const DatabaseSidebar = ({
  onOpenFolder,
  onRemoveFolder,
  onOpenFileNode,
  onCreateItem,
  onRenameItem,
  onDeleteItem,
  onNavigate,
}: DatabaseSidebarProps) => {
  const {
    collections,
    fetchCollections,
    loadedCollections,
    toggleCollectionLoaded,
    isLoading,
    importFolder,
    deleteCollection,
    allLoadedResources,
    selectResource,
    activeResourceId,
    createCollection,
    addFolderToCollection,
  } = useDatabaseStore();

  // Project folder state from store
  const { projectData } = useProjectStore();

  // Use shared tree state hook
  const {
    expandAllSignal,
    collapseAllSignal,
    isToggleExpanded,
    searchQuery,
    setSearchQuery,
    toggleExpandState,
  } = useTreeState<TreeNode>();

  // Local state - 3-way view toggle
  const [activeView, setActiveView] = useState<SidebarViewType>("collections");
  const [projectSearch, setProjectSearch] = useState("");
  const [hoveredCollection, setHoveredCollection] = useState<string | null>(
    null
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(
    null
  );
  const [creatingItem, setCreatingItem] = useState<{
    type: "file" | "folder";
    parentId: string;
  } | null>(null);
  const [selectedProjectNode] = useState<FileSystemNode | null>(null);

  // NEW State for Create Collection Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  // Handler for creating new collection
  const handleCreateCollection = useCallback(async () => {
    if (!newCollectionName.trim()) return;
    await createCollection(newCollectionName);
    setNewCollectionName("");
    setCreateModalOpen(false);
  }, [newCollectionName, createCollection]);

  // Handler for adding folder to existing collection
  const handleAddFolderToCollection = useCallback(
    async (collectionName: string) => {
      try {
        const selected = await open({
          directory: true,
          title: `Add Folder to ${collectionName}`,
        });
        if (selected && typeof selected === "string") {
          await addFolderToCollection(collectionName, selected);
        }
      } catch (e) {
        console.error("Add folder failed", e);
      }
    },
    [addFolderToCollection]
  );

  // Fetch collections on mount
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // --- Handlers ---
  const handleImport = useCallback(async () => {
    try {
      const selected = await open({
        directory: true,
        title: "Select Folder to Import",
      });
      if (selected && typeof selected === "string") {
        const separator = selected.includes("\\") ? "\\" : "/";
        const name = selected.split(separator).pop() || "Imported";
        // Default to importing as a new collection if adding folder logic isn't used here.
        // But wait, the user wants "Import Folder" to be "Add Folder to Collection" contextually?
        // The previous "Import Folder" button creates a new collection.
        // We will keep createCollection logic separate.
        // For now, this global import creates a new collection.
        await importFolder(selected, name);
      }
    } catch (e) {
      console.error("Import failed", e);
    }
  }, [importFolder]);

  const handleToggleCollection = useCallback(
    (name: string) => {
      toggleCollectionLoaded(name);
    },
    [toggleCollectionLoaded]
  );

  const handleDeleteClick = useCallback((name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollectionToDelete(name);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (collectionToDelete) {
      await deleteCollection(collectionToDelete);
      setDeleteModalOpen(false);
      setCollectionToDelete(null);
    }
  }, [collectionToDelete, deleteCollection]);

  const cancelDelete = useCallback(() => {
    setDeleteModalOpen(false);
    setCollectionToDelete(null);
  }, []);

  // --- Collections filtering ---
  const filteredCollections = useMemo(() => {
    if (!searchQuery) return collections;
    return collections.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [collections, searchQuery]);

  // --- Build file tree from resources ---
  const fileTree = useMemo((): TreeNode[] => {
    // Filter resources by allowed extensions and exclude hidden files
    let filteredResources = allLoadedResources.filter((r) => {
      // Exclude hidden files/folders (starting with dot)
      if (r.path.includes("/.") || r.path.includes("\\.")) return false;
      const ext = r.path.split(".").pop()?.toLowerCase() || "";
      return ALLOWED_EXTENSIONS.includes(ext);
    });

    if (filteredResources.length === 0) return [];

    // Group resources by collection
    const byCollection = new Map<string, typeof filteredResources>();
    filteredResources.forEach((r) => {
      const existing = byCollection.get(r.collection) || [];
      existing.push(r);
      byCollection.set(r.collection, existing);
    });

    const collectionTrees: TreeNode[] = [];

    // Build tree for each collection
    byCollection.forEach((resources, collectionName) => {
      const paths = resources.map((r) => r.path);
      const separator = paths[0]?.includes("\\") ? "\\" : "/";

      // Find common prefix
      const allParts = paths.map((p) => p.split(separator));
      let commonPrefix: string[] = [];
      if (allParts.length > 0) {
        commonPrefix = [...allParts[0]];
        for (let i = 1; i < allParts.length; i++) {
          let j = 0;
          while (
            j < commonPrefix.length &&
            j < allParts[i].length &&
            commonPrefix[j] === allParts[i][j]
          ) {
            j++;
          }
          commonPrefix = commonPrefix.slice(0, j);
        }
      }
      const commonRoot = commonPrefix.join(separator);

      // Build tree structure - collection as root
      const rootNode: TreeNode = {
        id: collectionName,
        name: collectionName,
        type: "folder",
        path: commonRoot,
        children: [],
        isRoot: true,
        metadata: { collectionName },
      };

      // Add files to tree
      resources.forEach((r) => {
        const relativePath = r.path
          .substring(commonRoot.length)
          .replace(/^[/\\]/, "");
        const parts = relativePath.split(/[/\\]/).filter(Boolean);

        let currentNode = rootNode;

        // Navigate/create folder structure
        for (let i = 0; i < parts.length - 1; i++) {
          const folderName = parts[i];
          let folderNode = currentNode.children?.find(
            (c) => c.name === folderName && c.type === "folder"
          );

          if (!folderNode) {
            folderNode = {
              id: `${currentNode.id}/${folderName}`,
              name: folderName,
              type: "folder",
              path: `${currentNode.path}${separator}${folderName}`,
              children: [],
            };
            currentNode.children = currentNode.children || [];
            currentNode.children.push(folderNode);
          }
          currentNode = folderNode;
        }

        // Add file node
        const fileName =
          parts[parts.length - 1] || r.path.split(/[/\\]/).pop() || "unknown";
        currentNode.children = currentNode.children || [];
        currentNode.children.push({
          id: r.id,
          name: fileName,
          type: "file",
          path: r.path,
        });
      });

      // Sort children: folders first, then files, alphabetically
      const sortChildren = (node: TreeNode) => {
        if (node.children) {
          node.children.sort((a, b) => {
            if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
            return a.name.localeCompare(b.name);
          });
          node.children.forEach((child) => {
            if (child.type === "folder") sortChildren(child);
          });
        }
      };
      sortChildren(rootNode);

      // Simplify tree: flatten single-child directory chains at the root
      // This fixes the issue where the tree shows many levels of parent directories.
      // We recursively peel off "wrapper" folders (folders that contain only one subfolder).
      // We STOP when we hit a folder that contains files or multiple folders (the "Content Root").
      let currentChildren = rootNode.children || [];
      while (
        currentChildren.length === 1 &&
        currentChildren[0].type === "folder"
      ) {
        const child = currentChildren[0];
        const grandChildren = child.children || [];
        // Check if the child is just a wrapper for another single folder
        // If so, we peel it. If it contains files or multiple folders, we keep it.
        const isWrapper =
          grandChildren.length === 1 && grandChildren[0].type === "folder";

        if (isWrapper) {
          currentChildren = grandChildren;
        } else {
          break;
        }
      }
      rootNode.children = currentChildren;

      collectionTrees.push(rootNode);
    });

    return collectionTrees;
  }, [allLoadedResources]);

  // --- File click handler ---
  const handleFileClick = useCallback(
    (node: TreeNode) => {
      const resource = allLoadedResources.find((r) => r.path === node.path);
      if (resource) {
        selectResource(resource.id);
      }
    },
    [allLoadedResources, selectResource]
  );

  // --- Selected path for highlighting ---
  const selectedPath = useMemo(() => {
    const activeResource = allLoadedResources.find(
      (r) => r.id === activeResourceId
    );
    return activeResource?.path || null;
  }, [allLoadedResources, activeResourceId]);

  // --- Tree item config (enables context menu for file operations) ---
  const treeConfig: TreeItemConfig = useMemo(
    () => ({
      enableDragDrop: false, // Will enable in Phase 4
      enableContextMenu: true, // NEW: Context menu for Database tree
      enableRename: false, // Database files aren't renamed through this UI
      enableCheckbox: false,
    }),
    []
  );

  // --- Tree item callbacks ---
  const treeCallbacks: TreeItemCallbacks = useMemo(
    () => ({
      onFileClick: handleFileClick,
      onFolderToggle: undefined,
      onContextMenu: undefined, // Use default context menu from UnifiedTreeItem
      onRename: undefined,
      onDelete: undefined,
      onCreate: undefined,
      onDrop: undefined,
    }),
    [handleFileClick]
  );

  // --- Toolbar actions ---

  const collectionsToolbarActions: ToolbarAction[] = useMemo(
    () => [
      {
        icon: faSync,
        tooltip: "Refresh",
        onClick: () => fetchCollections(),
      },
      {
        icon: faPlus,
        tooltip: "Create Collection", // Changed from "Import Folder" to "Create Collection" (Import is now adding folder)
        // Wait, user still wants "Import Folder" as quick access?
        // Plan said: "Create Empty Collection" button will be added.
        // "Import Folder" button will continue to function...
        onClick: () => setCreateModalOpen(true), // New button for Empty Collection
      },
      {
        icon: faFolder, // Using Folder icon for "Import Folder" legacy action?
        // Or maybe separate "New Collection" (faDatabase + plus) vs "Import Folder" (faFolder + plus)
        tooltip: "Import Folder as Collection",
        onClick: handleImport,
      },

      {
        icon: faFolder,
        tooltip: "Project Folders",
        onClick: () => setActiveView("projects"),
        variant: "subtle" as const,
        color: "orange",
      },
    ],
    [fetchCollections, handleImport, loadedCollections.length]
  );

  // Get current view title and actions
  const currentTitle =
    activeView === "collections" ? "COLLECTIONS" : "PROJECT FOLDERS";
  const currentActions =
    activeView === "collections" ? collectionsToolbarActions : [];
  const showExpandToggle = activeView !== "collections";

  return (
    <Stack p="xs" gap="xs" h="100%" style={{ overflow: "hidden" }}>
      {/* Header Toolbar */}
      <TreeToolbar
        title={currentTitle}
        actions={currentActions}
        showExpandToggle={showExpandToggle}
        isExpanded={isToggleExpanded}
        onToggleExpand={toggleExpandState}
      />

      {/* Search box */}
      <Box px={4}>
        <TreeSearchInput
          value={activeView === "projects" ? projectSearch : searchQuery}
          onChange={
            activeView === "projects" ? setProjectSearch : setSearchQuery
          }
          onClear={() =>
            activeView === "projects"
              ? setProjectSearch("")
              : setSearchQuery("")
          }
          placeholder={
            activeView === "projects"
              ? "Filter files..."
              : "Search collections..."
          }
        />
      </Box>

      {/* Loading state */}
      {isLoading && collections.length === 0 && <Loader size="xs" mx="auto" />}

      {/* LOADING STATE - no change needed, handled above */}

      {/* PROJECT FOLDERS VIEW */}
      {activeView === "projects" ? (
        <ScrollArea style={{ flex: 1 }}>
          {/* Quick Tools */}
          <Box p="xs">
            <Text size="xs" fw={700} c="dimmed" mb={4}>
              QUICK TOOLS
            </Text>
            <Group gap={4}>
              {onNavigate && (
                <>
                  <ActionIcon
                    variant="light"
                    size="sm"
                    color="violet"
                    onClick={() => onNavigate("wizard-preamble")}
                  >
                    <FontAwesomeIcon
                      icon={faWandMagicSparkles}
                      style={{ width: 14, height: 14 }}
                    />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    size="sm"
                    color="green"
                    onClick={() => onNavigate("wizard-table")}
                  >
                    <FontAwesomeIcon
                      icon={faTable}
                      style={{ width: 14, height: 14 }}
                    />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    size="sm"
                    color="orange"
                    onClick={() => onNavigate("wizard-tikz")}
                  >
                    <FontAwesomeIcon
                      icon={faPenNib}
                      style={{ width: 14, height: 14 }}
                    />
                  </ActionIcon>
                </>
              )}
            </Group>
          </Box>
          <Divider my={4} color="default-border" />

          {/* Project Folders Tree */}
          {projectData.length === 0 ? (
            <Box p="md" ta="center">
              <Text size="xs" c="dimmed" mb="xs">
                No folder opened
              </Text>
              {onOpenFolder && (
                <Group justify="center">
                  <Button size="xs" variant="default" onClick={onOpenFolder}>
                    Open Folder
                  </Button>
                </Group>
              )}
            </Box>
          ) : (
            <Box>
              {projectData.map((node) => {
                const treeNode: TreeNode = {
                  ...node,
                  isRoot: true,
                  children: node.children as TreeNode[] | undefined,
                };

                const projectConfig: TreeItemConfig = {
                  enableDragDrop: true,
                  enableContextMenu: true,
                  enableRename: true,
                };

                const projectCallbacks: TreeItemCallbacks = {
                  onFileClick: (n) =>
                    onOpenFileNode && onOpenFileNode(n as FileSystemNode),
                  onRename: onRenameItem
                    ? (n, newName) => onRenameItem(n as FileSystemNode, newName)
                    : undefined,
                  onDelete: onDeleteItem
                    ? (n) => onDeleteItem(n as FileSystemNode)
                    : undefined,
                  onCreate: (type, parentNode) => {
                    setCreatingItem({ type, parentId: parentNode.id });
                  },
                  onRemoveFolder: onRemoveFolder
                    ? (n) => onRemoveFolder(n.path)
                    : undefined,
                };

                return (
                  <UnifiedTreeItem
                    key={node.id}
                    node={treeNode}
                    level={0}
                    config={projectConfig}
                    callbacks={projectCallbacks}
                    selectedPath={selectedProjectNode?.path || null}
                    expandSignal={expandAllSignal}
                    collapseSignal={collapseAllSignal}
                    creatingState={creatingItem}
                    onCommitCreation={(name, type, parentPath) => {
                      if (onCreateItem) onCreateItem(name, type, parentPath);
                      setCreatingItem(null);
                    }}
                    onCancelCreation={() => setCreatingItem(null)}
                  />
                );
              })}
            </Box>
          )}
        </ScrollArea>
      ) : (
        /* COLLECTIONS VIEW */
        <>
          {collections.length === 0 && !isLoading && (
            <Text size="xs" c="dimmed" ta="center">
              No collections found.
            </Text>
          )}

          <Box style={{ flex: 1, overflowY: "auto" }} px={4}>
            <Stack gap={4}>
              {filteredCollections.map((col) => {
                const isLoaded = loadedCollections.includes(col.name);
                return (
                  <>
                    <Group
                      key={col.name}
                      gap={0}
                      wrap="nowrap"
                      onMouseEnter={() => setHoveredCollection(col.name)}
                      onMouseLeave={() => setHoveredCollection(null)}
                      style={{
                        borderRadius: 4,
                        backgroundColor: isLoaded
                          ? "rgba(64, 192, 87, 0.1)"
                          : "transparent",
                        transition: "background-color 0.15s ease",
                        paddingRight: 4,
                      }}
                    >
                      <UnstyledButton
                        onClick={() => handleToggleCollection(col.name)}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 8px",
                        }}
                      >
                        <Checkbox
                          checked={isLoaded}
                          onChange={() => {}}
                          size="xs"
                          styles={{
                            input: { cursor: "pointer" },
                          }}
                          tabIndex={-1}
                        />
                        <FontAwesomeIcon
                          icon={faDatabase}
                          style={{
                            width: 14,
                            height: 14,
                            color: isLoaded ? "#40c057" : "#868e96",
                            transition: "color 0.15s ease",
                          }}
                        />
                        <Text
                          size="sm"
                          truncate
                          style={{
                            color: isLoaded ? "#c9c9c9" : "#868e96",
                          }}
                        >
                          {col.name}
                        </Text>
                      </UnstyledButton>

                      <Menu shadow="md" width={200} position="bottom-end">
                        <Menu.Target>
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="gray"
                            style={{
                              opacity: hoveredCollection === col.name ? 1 : 0,
                              transition: "opacity 0.2s",
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faEllipsisVertical}
                              style={{ width: 14, height: 14 }}
                            />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          <Menu.Label>Collection Options</Menu.Label>
                          <Menu.Item
                            leftSection={
                              <FontAwesomeIcon
                                icon={faPlus}
                                style={{ width: 14 }}
                              />
                            }
                            onClick={() =>
                              handleAddFolderToCollection(col.name)
                            }
                          >
                            Add Folder...
                          </Menu.Item>
                          <Divider my={4} />
                          <Menu.Item
                            color="red"
                            leftSection={
                              <FontAwesomeIcon
                                icon={faTrash}
                                style={{ width: 14 }}
                              />
                            }
                            onClick={(e) =>
                              handleDeleteClick(col.name, e as any)
                            }
                          >
                            Delete Collection
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>

                    {/* Render Nested File Tree if Loaded */}
                    {isLoaded && (
                      <Box pl={0}>
                        {(() => {
                          // Find the root node for this collection in the pre-built fileTree
                          const collectionNode = fileTree.find(
                            (n) => n.name === col.name
                          ); // Usually name matches id or we matched them in generation
                          if (
                            !collectionNode ||
                            !collectionNode.children ||
                            collectionNode.children.length === 0
                          ) {
                            return (
                              <Text
                                size="xs"
                                c="dimmed"
                                fs="italic"
                                pl="lg"
                                py={4}
                              >
                                Empty
                              </Text>
                            );
                          }
                          return collectionNode.children.map((childNode) => (
                            <UnifiedTreeItem
                              key={childNode.id}
                              node={childNode}
                              level={1} // Indent level 1
                              config={treeConfig}
                              callbacks={treeCallbacks}
                              selectedPath={selectedPath}
                              expandSignal={expandAllSignal}
                              collapseSignal={collapseAllSignal}
                            />
                          ));
                        })()}
                      </Box>
                    )}
                  </>
                );
              })}
            </Stack>
          </Box>
          {loadedCollections.length > 0 && (
            <Box
              px={4}
              py={4}
              style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
            >
              <Text size="xs" c="dimmed">
                {loadedCollections.length} collection
                {loadedCollections.length > 1 ? "s" : ""} loaded
              </Text>
            </Box>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={cancelDelete}
        title="Διαγραφή Συλλογής"
        centered
        size="md"
      >
        <Stack gap="md">
          <Text>
            Είστε σίγουροι ότι θέλετε να διαγράψετε τη συλλογή{" "}
            <Text component="span" fw={700}>
              "{collectionToDelete}"
            </Text>
            ;
          </Text>
          <Text size="sm" c="dimmed">
            ⚠️ Προσοχή: Αυτή η ενέργεια θα διαγράψει τη συλλογή και όλα τα
            resources της από τη βάση δεδομένων, αλλά{" "}
            <Text component="span" fw={700}>
              ΔΕΝ θα διαγράψει
            </Text>{" "}
            τα αρχεία από το σύστημα αρχείων σας.
          </Text>
          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={cancelDelete}>
              Ακύρωση
            </Button>
            <Button color="red" onClick={confirmDelete}>
              Διαγραφή
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Create Collection Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="New Collection"
        centered
        size="sm"
      >
        <Stack>
          <TextInput
            label="Collection Name"
            placeholder="e.g., Mathematics, Physics"
            data-autofocus
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateCollection();
            }}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCollection}>Create</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

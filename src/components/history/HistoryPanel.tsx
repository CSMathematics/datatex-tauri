import React, { useState, useEffect, useCallback } from "react";
import {
  Stack,
  Text,
  Group,
  ScrollArea,
  ActionIcon,
  Button,
  Tooltip,
  Badge,
  Box,
  Loader,
  Paper,
  Code,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHistory,
  faUndo,
  faTrash,
  faClock,
  faFileAlt,
  faPlus,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import { invoke } from "@tauri-apps/api/core";

// Types from Rust backend
interface HistoryEntry {
  id: string;
  file_path: string;
  content_hash: string;
  created_at: string;
  summary: string | null;
  is_manual_snapshot: boolean;
}

interface DiffChange {
  tag: string; // "equal", "delete", "insert"
  old_start: number | null;
  old_end: number | null;
  new_start: number | null;
  new_end: number | null;
  content: string;
}

interface DiffStats {
  additions: number;
  deletions: number;
  unchanged: number;
}

interface DiffResult {
  old_content: string;
  new_content: string;
  changes: DiffChange[];
  stats: DiffStats;
}

interface HistoryPanelProps {
  activeFilePath: string | null;
  currentContent: string;
  onRestoreContent: (content: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  activeFilePath,
  currentContent,
  onRestoreContent,
}) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);

  // Load history when file changes
  const loadHistory = useCallback(async () => {
    if (!activeFilePath) {
      setHistory([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const entries = await invoke<HistoryEntry[]>("get_file_history_cmd", {
        filePath: activeFilePath,
        limit: 50,
      });
      setHistory(entries);
    } catch (err) {
      console.error("Failed to load history:", err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [activeFilePath]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Load diff when entry is selected
  const loadDiff = useCallback(
    async (entry: HistoryEntry) => {
      setDiffLoading(true);
      try {
        const snapshotContent = await invoke<string>(
          "get_snapshot_content_cmd",
          {
            snapshotId: entry.id,
          },
        );

        const diff = await invoke<DiffResult>("diff_with_current_cmd", {
          snapshotContent,
          currentContent,
        });

        setDiffResult(diff);
      } catch (err) {
        console.error("Failed to load diff:", err);
      } finally {
        setDiffLoading(false);
      }
    },
    [currentContent],
  );

  const handleEntryClick = (entry: HistoryEntry) => {
    setSelectedEntry(entry);
    loadDiff(entry);
  };

  const handleRestore = async () => {
    if (!selectedEntry) return;

    if (
      !window.confirm(
        "Are you sure you want to restore this version? Current changes will be replaced.",
      )
    ) {
      return;
    }

    try {
      const [_filePath, content] = await invoke<[string, string]>(
        "restore_snapshot_cmd",
        {
          snapshotId: selectedEntry.id,
        },
      );
      onRestoreContent(content);
      setSelectedEntry(null);
      setDiffResult(null);
    } catch (err) {
      console.error("Failed to restore:", err);
      setError(String(err));
    }
  };

  const handleDeleteSnapshot = async (
    entry: HistoryEntry,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();

    if (!window.confirm("Delete this snapshot?")) return;

    try {
      await invoke("delete_snapshot_cmd", { snapshotId: entry.id });
      loadHistory();
      if (selectedEntry?.id === entry.id) {
        setSelectedEntry(null);
        setDiffResult(null);
      }
    } catch (err) {
      console.error("Failed to delete snapshot:", err);
    }
  };

  const handleSaveManualSnapshot = async () => {
    if (!activeFilePath) return;

    try {
      await invoke("save_history_snapshot_cmd", {
        filePath: activeFilePath,
        content: currentContent,
        summary: "Manual snapshot",
        isManual: true,
      });
      loadHistory();
    } catch (err) {
      console.error("Failed to save snapshot:", err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (!activeFilePath) {
    return (
      <Stack align="center" justify="center" h="100%" gap="sm">
        <FontAwesomeIcon icon={faHistory} size="2x" style={{ opacity: 0.3 }} />
        <Text size="sm" c="dimmed">
          No file selected
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="sm" p="sm" h="100%" style={{ overflow: "hidden" }}>
      {/* Header */}
      <Group justify="space-between" wrap="nowrap">
        <Group gap="xs">
          <FontAwesomeIcon icon={faHistory} />
          <Text size="sm" fw={500}>
            Local History
          </Text>
        </Group>
        <Tooltip label="Save snapshot">
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={handleSaveManualSnapshot}
          >
            <FontAwesomeIcon icon={faClock} />
          </ActionIcon>
        </Tooltip>
      </Group>

      {/* File name */}
      <Text size="xs" c="dimmed" lineClamp={1}>
        <FontAwesomeIcon
          icon={faFileAlt}
          size="sm"
          style={{ marginRight: 4 }}
        />
        {activeFilePath.split("/").pop()}
      </Text>

      {/* Error */}
      {error && (
        <Text size="xs" c="red">
          {error}
        </Text>
      )}

      {/* History List */}
      <ScrollArea style={{ flex: selectedEntry ? 0.4 : 1 }}>
        {loading ? (
          <Stack align="center" py="md">
            <Loader size="sm" />
          </Stack>
        ) : history.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="md">
            No history yet
          </Text>
        ) : (
          <Stack gap={4}>
            {history.map((entry) => (
              <Paper
                key={entry.id}
                p="xs"
                withBorder
                style={{
                  cursor: "pointer",
                  backgroundColor:
                    selectedEntry?.id === entry.id
                      ? "var(--mantine-color-blue-light)"
                      : undefined,
                }}
                onClick={() => handleEntryClick(entry)}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Box>
                    <Group gap={4}>
                      <Text size="xs" fw={500}>
                        {formatDate(entry.created_at)}
                      </Text>
                      {entry.is_manual_snapshot && (
                        <Badge size="xs" variant="light" color="blue">
                          Manual
                        </Badge>
                      )}
                    </Group>
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {entry.summary || entry.content_hash.slice(0, 8)}
                    </Text>
                  </Box>
                  <ActionIcon
                    variant="subtle"
                    size="xs"
                    color="red"
                    onClick={(e) => handleDeleteSnapshot(entry, e)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </ActionIcon>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </ScrollArea>

      {/* Diff View */}
      {selectedEntry && (
        <>
          <Group justify="space-between" wrap="nowrap">
            <Text size="xs" fw={500}>
              Changes from {formatDate(selectedEntry.created_at)}
            </Text>
            <Group gap="xs">
              <Button
                size="xs"
                variant="light"
                leftSection={<FontAwesomeIcon icon={faUndo} />}
                onClick={handleRestore}
              >
                Restore
              </Button>
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => {
                  setSelectedEntry(null);
                  setDiffResult(null);
                }}
              >
                ×
              </ActionIcon>
            </Group>
          </Group>

          {diffLoading ? (
            <Stack align="center" py="md">
              <Loader size="sm" />
            </Stack>
          ) : diffResult ? (
            <>
              {/* Stats */}
              <Group gap="xs">
                <Badge
                  size="xs"
                  color="green"
                  leftSection={<FontAwesomeIcon icon={faPlus} />}
                >
                  {diffResult.stats.additions}
                </Badge>
                <Badge
                  size="xs"
                  color="red"
                  leftSection={<FontAwesomeIcon icon={faMinus} />}
                >
                  {diffResult.stats.deletions}
                </Badge>
              </Group>

              {/* Diff lines */}
              <ScrollArea style={{ flex: 0.6 }}>
                <Code block style={{ fontSize: 11, whiteSpace: "pre-wrap" }}>
                  {diffResult.changes
                    .filter((c) => c.tag !== "equal")
                    .slice(0, 100)
                    .map((change, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor:
                            change.tag === "insert"
                              ? "rgba(0, 255, 0, 0.1)"
                              : change.tag === "delete"
                                ? "rgba(255, 0, 0, 0.1)"
                                : undefined,
                          color:
                            change.tag === "insert"
                              ? "green"
                              : change.tag === "delete"
                                ? "red"
                                : undefined,
                        }}
                      >
                        {change.tag === "insert"
                          ? "+ "
                          : change.tag === "delete"
                            ? "- "
                            : "  "}
                        {change.content}
                      </div>
                    ))}
                </Code>
              </ScrollArea>
            </>
          ) : null}
        </>
      )}
    </Stack>
  );
};

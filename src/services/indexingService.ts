import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useDatabaseStore } from "../stores/databaseStore";
import { useAIStore } from "../stores/aiStore";
import { notifications } from "@mantine/notifications";

export const indexingService = {
  isIndexing: false,
  progress: 0,
  total: 0,
  stopRequested: false,

  async buildIndex(
    onProgress: (current: number, total: number) => void,
  ): Promise<void> {
    if (this.isIndexing) return;
    this.isIndexing = true;
    this.stopRequested = false;
    this.progress = 0;

    // Listen for progress events from Rust
    const unlisten = await listen("indexing-progress", (event: any) => {
      const payload = event.payload as { current: number; total: number };
      this.progress = payload.current;
      this.total = payload.total;
      onProgress(this.progress, this.total);
    });

    try {
      // 1. Fetch all relevant files
      const collections = useDatabaseStore.getState().collections;
      const collectionNames = collections.map((c) => c.name);

      // Use the batch command to get all resources
      const resources: any[] = await invoke(
        "get_resources_by_collections_cmd",
        {
          collections: collectionNames,
        },
      );

      // Filter for text-based files
      const textFiles = resources.filter((r) => {
        const ext = r.path.split(".").pop()?.toLowerCase();
        return ["tex", "bib", "txt", "md", "sty", "cls"].includes(ext || "");
      });

      const filePaths = textFiles.map((f) => f.path);
      this.total = filePaths.length;
      onProgress(0, this.total);

      if (filePaths.length === 0) {
        notifications.show({
          title: "Indexing Skipped",
          message: "No text files found to index.",
          color: "yellow",
        });
        return;
      }

      // 2. Prepare Config
      const aiState = useAIStore.getState();
      const config = {
        provider: aiState.provider,
        api_key:
          aiState.provider === "openai"
            ? aiState.openaiKey
            : aiState.provider === "gemini"
              ? aiState.geminiKey
              : undefined,
        model:
          aiState.provider === "openai"
            ? aiState.openaiModel
            : aiState.provider === "gemini"
              ? aiState.geminiModel
              : aiState.provider === "ollama"
                ? aiState.ollamaModel
                : undefined,
        url: aiState.provider === "ollama" ? aiState.ollamaUrl : undefined,
      };

      // 3. Invoke Rust Command
      // Note: passing the WHOLE file list might be large, but usually fine for a few thousand files.
      // If project is huge, might need to chunk the file list itself, but Rust handles Vec<String> fine.
      await invoke("build_index_cmd", {
        files: filePaths,
        config: config,
      });

      notifications.show({
        title: "Indexing Complete",
        message: `Successfully indexed ${this.total} files via Rust backend.`,
        color: "green",
      });
    } catch (e: any) {
      console.error("Indexing failed", e);
      notifications.show({
        title: "Indexing Failed",
        message: e.message || "Unknown error",
        color: "red",
      });
    } finally {
      unlisten();
      this.isIndexing = false;
    }
  },

  stop() {
    this.stopRequested = true;
    // TODO: Send stop command to Rust if implemented
  },
};

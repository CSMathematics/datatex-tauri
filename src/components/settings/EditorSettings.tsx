import React, { useEffect, useState } from "react";
import { Stack, Title, Text, Select, NumberInput, Switch } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { EditorSettings as IEditorSettings } from "../../hooks/useSettings";

interface EditorSettingsProps {
  settings: IEditorSettings;
  onUpdate: <K extends keyof IEditorSettings>(
    key: K,
    value: IEditorSettings[K]
  ) => void;
}

export const EditorSettings: React.FC<EditorSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const [systemFonts, setSystemFonts] = useState<string[]>([]);

  useEffect(() => {
    invoke<string[]>("get_system_fonts")
      .then((fonts) => {
        setSystemFonts(fonts);
      })
      .catch((err) => console.error("Failed to load fonts", err));
  }, []);

  return (
    <Stack gap="md" maw={600}>
      <Title order={4}>{t("settings.editor.title")}</Title>
      <Text size="sm" c="dimmed">
        {t("settings.editor.description")}
      </Text>

      <NumberInput
        label={t("settings.editor.fontSize.label")}
        description={t("settings.editor.fontSize.description")}
        value={settings.fontSize}
        onChange={(val) => onUpdate("fontSize", Number(val))}
        min={8}
        max={32}
      />

      <Select
        label={t("settings.editor.fontFamily.label")}
        description={t("settings.editor.fontFamily.description")}
        data={systemFonts}
        value={settings.fontFamily}
        onChange={(val) => onUpdate("fontFamily", val || "Consolas")}
        searchable
        nothingFoundMessage={t("settings.editor.fontFamily.notFound")}
        checkIconPosition="right"
      />

      <Select
        label={t("settings.editor.wordWrap.label")}
        description={t("settings.editor.wordWrap.description")}
        data={[
          { value: "on", label: t("settings.common.on") },
          { value: "off", label: t("settings.common.off") },
        ]}
        value={settings.wordWrap}
        onChange={(val) => onUpdate("wordWrap", val as "on" | "off")}
      />

      <Select
        label={t("settings.editor.theme.label")}
        description={t("settings.editor.theme.description")}
        data={[
          { value: "data-tex-dark", label: "DataTeX Dark (Default)" },
          { value: "data-tex-light", label: "DataTeX Light" },
          { value: "data-tex-monokai", label: "Monokai Vivid" },
          { value: "data-tex-nord", label: "Nordic Cool" },
          { value: "data-tex-hc", label: "High Contrast" },
        ]}
        value={settings.theme}
        onChange={(val) => onUpdate("theme", val || "data-tex-dark")}
      />

      <Select
        label={t("settings.editor.lineNumbers.label")}
        description={t("settings.editor.lineNumbers.description")}
        data={[
          { value: "on", label: t("settings.common.on") },
          { value: "off", label: t("settings.common.off") },
          {
            value: "relative",
            label: t("settings.editor.lineNumbers.relative"),
          },
        ]}
        value={settings.lineNumbers}
        onChange={(val) => onUpdate("lineNumbers", val as any)}
      />

      <Switch
        label={t("settings.editor.minimap.label")}
        description={t("settings.editor.minimap.description")}
        checked={settings.minimap}
        onChange={(e) => onUpdate("minimap", e.currentTarget.checked)}
      />
    </Stack>
  );
};

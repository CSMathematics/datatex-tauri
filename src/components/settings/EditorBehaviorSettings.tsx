import React from "react";
import { Stack, Title, Text, Select, NumberInput, Switch } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { EditorBehaviorSettings as IEditorBehaviorSettings } from "../../hooks/useSettings";
import { SettingGroup } from "./SettingGroup";

interface EditorBehaviorSettingsProps {
  settings: IEditorBehaviorSettings;
  onUpdate: <K extends keyof IEditorBehaviorSettings>(
    key: K,
    value: IEditorBehaviorSettings[K]
  ) => void;
}

export const EditorBehaviorSettings: React.FC<EditorBehaviorSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const { t } = useTranslation();

  return (
    <Stack gap="md" maw={600}>
      <Title order={4}>{t("settings.editorBehavior.title")}</Title>
      <Text size="sm" c="dimmed">
        {t("settings.editorBehavior.description")}
      </Text>

      <SettingGroup
        title={t("settings.editorBehavior.formatting.title")}
        description={t("settings.editorBehavior.formatting.description")}
      >
        <NumberInput
          label={t("settings.editorBehavior.formatting.tabSize.label")}
          description={t(
            "settings.editorBehavior.formatting.tabSize.description"
          )}
          value={settings.tabSize}
          onChange={(val) => onUpdate("tabSize", Number(val))}
          min={2}
          max={8}
        />

        <Switch
          label={t("settings.editorBehavior.formatting.insertSpaces.label")}
          description={t(
            "settings.editorBehavior.formatting.insertSpaces.description"
          )}
          checked={settings.insertSpaces}
          onChange={(e) => onUpdate("insertSpaces", e.currentTarget.checked)}
        />
      </SettingGroup>

      <SettingGroup
        title={t("settings.editorBehavior.autoCompletion.title")}
        description={t("settings.editorBehavior.autoCompletion.description")}
      >
        <Switch
          label={t(
            "settings.editorBehavior.autoCompletion.autoCloseBrackets.label"
          )}
          description={t(
            "settings.editorBehavior.autoCompletion.autoCloseBrackets.description"
          )}
          checked={settings.autoCloseBrackets}
          onChange={(e) =>
            onUpdate("autoCloseBrackets", e.currentTarget.checked)
          }
        />

        <Switch
          label={t(
            "settings.editorBehavior.autoCompletion.autoCloseLatexEnv.label"
          )}
          description={t(
            "settings.editorBehavior.autoCompletion.autoCloseLatexEnv.description"
          )}
          checked={settings.autoCloseLatexEnv}
          onChange={(e) =>
            onUpdate("autoCloseLatexEnv", e.currentTarget.checked)
          }
        />

        <Switch
          label={t(
            "settings.editorBehavior.autoCompletion.suggestOnTrigger.label"
          )}
          description={t(
            "settings.editorBehavior.autoCompletion.suggestOnTrigger.description"
          )}
          checked={settings.suggestOnTrigger}
          onChange={(e) =>
            onUpdate("suggestOnTrigger", e.currentTarget.checked)
          }
        />

        <Switch
          label={t(
            "settings.editorBehavior.autoCompletion.quickSuggestions.label"
          )}
          description={t(
            "settings.editorBehavior.autoCompletion.quickSuggestions.description"
          )}
          checked={settings.quickSuggestions}
          onChange={(e) =>
            onUpdate("quickSuggestions", e.currentTarget.checked)
          }
        />
      </SettingGroup>

      <SettingGroup
        title={t("settings.editorBehavior.editorActions.title")}
        description={t("settings.editorBehavior.editorActions.description")}
      >
        <Switch
          label={t("settings.editorBehavior.editorActions.formatOnSave.label")}
          description={t(
            "settings.editorBehavior.editorActions.formatOnSave.description"
          )}
          checked={settings.formatOnSave}
          onChange={(e) => onUpdate("formatOnSave", e.currentTarget.checked)}
        />

        <Switch
          label={t(
            "settings.editorBehavior.editorActions.scrollBeyondLastLine.label"
          )}
          description={t(
            "settings.editorBehavior.editorActions.scrollBeyondLastLine.description"
          )}
          checked={settings.scrollBeyondLastLine}
          onChange={(e) =>
            onUpdate("scrollBeyondLastLine", e.currentTarget.checked)
          }
        />
      </SettingGroup>

      <SettingGroup
        title={t("settings.editorBehavior.cursor.title")}
        description={t("settings.editorBehavior.cursor.description")}
      >
        <Select
          label={t("settings.editorBehavior.cursor.style.label")}
          description={t("settings.editorBehavior.cursor.style.description")}
          data={[
            {
              value: "line",
              label: t("settings.editorBehavior.cursor.style.line"),
            },
            {
              value: "block",
              label: t("settings.editorBehavior.cursor.style.block"),
            },
            {
              value: "underline",
              label: t("settings.editorBehavior.cursor.style.underline"),
            },
          ]}
          value={settings.cursorStyle}
          onChange={(val) => val && onUpdate("cursorStyle", val as any)}
        />

        <Select
          label={t("settings.editorBehavior.cursor.blinking.label")}
          description={t("settings.editorBehavior.cursor.blinking.description")}
          data={[
            {
              value: "blink",
              label: t("settings.editorBehavior.cursor.blinking.blink"),
            },
            {
              value: "smooth",
              label: t("settings.editorBehavior.cursor.blinking.smooth"),
            },
            {
              value: "phase",
              label: t("settings.editorBehavior.cursor.blinking.phase"),
            },
            {
              value: "expand",
              label: t("settings.editorBehavior.cursor.blinking.expand"),
            },
            {
              value: "solid",
              label: t("settings.editorBehavior.cursor.blinking.solid"),
            },
          ]}
          value={settings.cursorBlinking}
          onChange={(val) => val && onUpdate("cursorBlinking", val as any)}
        />
      </SettingGroup>
    </Stack>
  );
};

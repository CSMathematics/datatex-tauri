import React from "react";
import { Stack, Title, Text, Select, NumberInput, Switch } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { DatabaseSettings as IDatabaseSettings } from "../../hooks/useSettings";
import { SettingGroup } from "./SettingGroup";

interface DatabaseSettingsProps {
  settings: IDatabaseSettings;
  onUpdate: <K extends keyof IDatabaseSettings>(
    key: K,
    value: IDatabaseSettings[K]
  ) => void;
}

export const DatabaseSettings: React.FC<DatabaseSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const { t } = useTranslation();

  return (
    <Stack gap="md" maw={600}>
      <Title order={4}>{t("settings.database.title")}</Title>
      <Text size="sm" c="dimmed">
        {t("settings.database.description")}
      </Text>

      <SettingGroup
        title={t("settings.database.view.title")}
        description={t("settings.database.view.description")}
      >
        <Select
          label={t("settings.database.view.defaultView.label")}
          description={t("settings.database.view.defaultView.description")}
          data={[
            {
              value: "table",
              label: t("settings.database.view.defaultView.table"),
            },
            {
              value: "graph",
              label: t("settings.database.view.defaultView.graph"),
            },
            {
              value: "list",
              label: t("settings.database.view.defaultView.list"),
            },
          ]}
          value={settings.defaultView}
          onChange={(val) => val && onUpdate("defaultView", val as any)}
        />

        <Switch
          label={t("settings.database.view.showMetadataPanel.label")}
          description={t(
            "settings.database.view.showMetadataPanel.description"
          )}
          checked={settings.showMetadataPanel}
          onChange={(e) =>
            onUpdate("showMetadataPanel", e.currentTarget.checked)
          }
        />

        <NumberInput
          label={t("settings.database.view.tablePageSize.label")}
          description={t("settings.database.view.tablePageSize.description")}
          value={settings.tablePageSize}
          onChange={(val) => onUpdate("tablePageSize", Number(val))}
          min={10}
          max={100}
        />
      </SettingGroup>

      <SettingGroup
        title={t("settings.database.graph.title")}
        description={t("settings.database.graph.description")}
      >
        <Switch
          label={t("settings.database.graph.physics.label")}
          description={t("settings.database.graph.physics.description")}
          checked={settings.graphPhysics}
          onChange={(e) => onUpdate("graphPhysics", e.currentTarget.checked)}
        />

        <Switch
          label={t("settings.database.graph.animation.label")}
          description={t("settings.database.graph.animation.description")}
          checked={settings.graphAnimation}
          onChange={(e) => onUpdate("graphAnimation", e.currentTarget.checked)}
        />
      </SettingGroup>

      <SettingGroup
        title={t("settings.database.advanced.title")}
        description={t("settings.database.advanced.description")}
      >
        <Switch
          label={t("settings.database.advanced.autoDetectPreambles.label")}
          description={t(
            "settings.database.advanced.autoDetectPreambles.description"
          )}
          checked={settings.autoDetectPreambles}
          onChange={(e) =>
            onUpdate("autoDetectPreambles", e.currentTarget.checked)
          }
        />

        <Switch
          label={t("settings.database.advanced.showFilePreview.label")}
          description={t(
            "settings.database.advanced.showFilePreview.description"
          )}
          checked={settings.showFilePreview}
          onChange={(e) => onUpdate("showFilePreview", e.currentTarget.checked)}
        />
      </SettingGroup>
    </Stack>
  );
};

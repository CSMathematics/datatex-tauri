import React from "react";
import { Stack, Title, Text, Select, Switch } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { PdfViewerSettings as IPdfViewerSettings } from "../../hooks/useSettings";
import { SettingGroup } from "./SettingGroup";

interface PdfViewerSettingsProps {
  settings: IPdfViewerSettings;
  onUpdate: <K extends keyof IPdfViewerSettings>(
    key: K,
    value: IPdfViewerSettings[K]
  ) => void;
}

export const PdfViewerSettings: React.FC<PdfViewerSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const { t } = useTranslation();

  return (
    <Stack gap="md" maw={600}>
      <Title order={4}>{t("settings.pdfViewer.title")}</Title>
      <Text size="sm" c="dimmed">
        {t("settings.pdfViewer.description")}
      </Text>

      <SettingGroup
        title={t("settings.pdfViewer.display.title")}
        description={t("settings.pdfViewer.display.description")}
      >
        <Select
          label={t("settings.pdfViewer.display.defaultZoom.label")}
          description={t("settings.pdfViewer.display.defaultZoom.description")}
          data={[
            {
              value: "fit-page",
              label: t("settings.pdfViewer.display.defaultZoom.fitPage"),
            },
            {
              value: "fit-width",
              label: t("settings.pdfViewer.display.defaultZoom.fitWidth"),
            },
            {
              value: "actual",
              label: t("settings.pdfViewer.display.defaultZoom.actual"),
            },
          ]}
          value={settings.defaultZoom as string}
          onChange={(val) => val && onUpdate("defaultZoom", val as any)}
        />

        <Select
          label={t("settings.pdfViewer.display.splitViewMode.label")}
          description={t(
            "settings.pdfViewer.display.splitViewMode.description"
          )}
          data={[
            {
              value: "horizontal",
              label: t("settings.pdfViewer.display.splitViewMode.horizontal"),
            },
            {
              value: "vertical",
              label: t("settings.pdfViewer.display.splitViewMode.vertical"),
            },
            {
              value: "auto",
              label: t("settings.pdfViewer.display.splitViewMode.auto"),
            },
          ]}
          value={settings.splitViewMode}
          onChange={(val) => val && onUpdate("splitViewMode", val as any)}
        />
      </SettingGroup>

      <SettingGroup
        title={t("settings.pdfViewer.behavior.title")}
        description={t("settings.pdfViewer.behavior.description")}
      >
        <Switch
          label={t("settings.pdfViewer.behavior.showByDefault.label")}
          description={t(
            "settings.pdfViewer.behavior.showByDefault.description"
          )}
          checked={settings.showByDefault}
          onChange={(e) => onUpdate("showByDefault", e.currentTarget.checked)}
        />

        <Switch
          label={t("settings.pdfViewer.behavior.autoRefresh.label")}
          description={t("settings.pdfViewer.behavior.autoRefresh.description")}
          checked={settings.autoRefresh}
          onChange={(e) => onUpdate("autoRefresh", e.currentTarget.checked)}
        />
      </SettingGroup>

      <SettingGroup
        title={t("settings.pdfViewer.synctex.title")}
        description={t("settings.pdfViewer.synctex.description")}
      >
        <Switch
          label={t("settings.pdfViewer.synctex.highlight.label")}
          description={t("settings.pdfViewer.synctex.highlight.description")}
          checked={settings.syncTexHighlight}
          onChange={(e) =>
            onUpdate("syncTexHighlight", e.currentTarget.checked)
          }
        />

        <Switch
          label={t("settings.pdfViewer.synctex.scrollSync.label")}
          description={t("settings.pdfViewer.synctex.scrollSync.description")}
          checked={settings.scrollSync}
          onChange={(e) => onUpdate("scrollSync", e.currentTarget.checked)}
        />
      </SettingGroup>
    </Stack>
  );
};

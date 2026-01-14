import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Stack,
  Title,
  Text,
  ColorInput,
  Button,
  Group,
  TextInput,
  Paper,
  Divider,
} from "@mantine/core";
import {
  CustomThemeOverrides,
  CustomTheme,
  AppSettings,
} from "../../hooks/useSettings";

interface AdvancedThemeEditorProps {
  settings: AppSettings;
  onUpdateOverride: (overrides: CustomThemeOverrides | undefined) => void;
  onSaveTheme: (theme: CustomTheme) => void;
}

export const AdvancedThemeEditor: React.FC<AdvancedThemeEditorProps> = ({
  settings,
  onUpdateOverride,
  onSaveTheme,
}) => {
  const { t } = useTranslation();
  const [themeName, setThemeName] = useState("");
  const overrides = settings.customThemeOverrides || {};

  const handleColorChange = (key: keyof CustomThemeOverrides, val: string) => {
    onUpdateOverride({
      ...overrides,
      [key]: val,
    });
  };

  const handleReset = () => {
    onUpdateOverride(undefined);
  };

  const handleSave = () => {
    if (!themeName.trim()) return;

    const newTheme: CustomTheme = {
      id: `custom-${Date.now()}`,
      label: themeName,
      baseThemeId: settings.uiTheme, // The current base theme
      overrides: overrides,
    };

    onSaveTheme(newTheme);
    setThemeName("");
  };

  return (
    <Paper p="md" withBorder mt="md" bg="var(--mantine-color-default)">
      <Stack gap="sm">
        <Title order={5}>{t("settings.theme.advanced.title")}</Title>
        <Text size="xs" c="dimmed">
          {t("settings.theme.advanced.description")}
        </Text>

        <ColorInput
          label={t("settings.theme.advanced.appBg.label")}
          description={t("settings.theme.advanced.appBg.description")}
          placeholder="#ffffff"
          value={overrides.appBg || ""}
          onChange={(val) => handleColorChange("appBg", val)}
        />
        <ColorInput
          label={t("settings.theme.advanced.sidebarBg.label")}
          description={t("settings.theme.advanced.sidebarBg.description")}
          placeholder="#f8f9fa"
          value={overrides.sidebarBg || ""}
          onChange={(val) => handleColorChange("sidebarBg", val)}
        />
        <ColorInput
          label={t("settings.theme.advanced.headerBg.label")}
          description={t("settings.theme.advanced.headerBg.description")}
          placeholder="#ffffff"
          value={overrides.headerBg || ""}
          onChange={(val) => handleColorChange("headerBg", val)}
        />
        <ColorInput
          label={t("settings.theme.advanced.panelBg.label")}
          description={t("settings.theme.advanced.panelBg.description")}
          placeholder="#f8f9fa"
          value={overrides.panelBg || ""}
          onChange={(val) => handleColorChange("panelBg", val)}
        />
        <ColorInput
          label={t("settings.theme.advanced.statusBarBg.label")}
          description={t("settings.theme.advanced.statusBarBg.description")}
          placeholder="#blue"
          value={overrides.statusBarBg || ""}
          onChange={(val) => handleColorChange("statusBarBg", val)}
        />
        <ColorInput
          label={t("settings.theme.advanced.primaryColor.label")}
          description={t("settings.theme.advanced.primaryColor.description")}
          placeholder="blue" // Mantine color name or hex
          value={overrides.primaryColor || ""}
          onChange={(val) => handleColorChange("primaryColor", val)}
        />
        <ColorInput
          label={t("settings.theme.advanced.accentColor.label")}
          description={t("settings.theme.advanced.accentColor.description")}
          placeholder="#339af0"
          value={overrides.accentColor || ""}
          onChange={(val) => handleColorChange("accentColor", val)}
        />
        <ColorInput
          label={t("settings.theme.advanced.borderColor.label")}
          description={t("settings.theme.advanced.borderColor.description")}
          placeholder="default"
          value={overrides.borderColor || ""}
          onChange={(val) => handleColorChange("borderColor", val)}
        />

        <Divider
          my="xs"
          label={t("settings.theme.advanced.actions")}
          labelPosition="center"
        />

        <Group justify="space-between" align="flex-end">
          <Button variant="subtle" color="red" size="xs" onClick={handleReset}>
            {t("settings.theme.advanced.resetOverrides")}
          </Button>

          <Group gap="xs" align="flex-end">
            <TextInput
              size="xs"
              placeholder={t("settings.theme.advanced.newThemeName")}
              value={themeName}
              onChange={(e) => setThemeName(e.currentTarget.value)}
              style={{ width: 150 }}
            />
            <Button
              size="xs"
              variant="light"
              disabled={!themeName.trim()}
              onClick={handleSave}
            >
              {t("settings.theme.advanced.saveAsTheme")}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Paper>
  );
};

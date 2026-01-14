import React from "react";
import { Stack, Title, Text, Select, NumberInput, Switch } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { AccessibilitySettings as IAccessibilitySettings } from "../../hooks/useSettings";
import { SettingGroup } from "./SettingGroup";

interface AccessibilitySettingsProps {
  settings: IAccessibilitySettings;
  onUpdate: <K extends keyof IAccessibilitySettings>(
    key: K,
    value: IAccessibilitySettings[K]
  ) => void;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const { t } = useTranslation();

  return (
    <Stack gap="md" maw={600}>
      <Title order={4}>{t("settings.accessibility.title")}</Title>
      <Text size="sm" c="dimmed">
        {t("settings.accessibility.description")}
      </Text>

      <SettingGroup
        title={t("settings.accessibility.visual.title")}
        description={t("settings.accessibility.visual.description")}
      >
        <Switch
          label={t("settings.accessibility.visual.highContrast.label")}
          description={t(
            "settings.accessibility.visual.highContrast.description"
          )}
          checked={settings.highContrastMode}
          onChange={(e) =>
            onUpdate("highContrastMode", e.currentTarget.checked)
          }
        />

        <Switch
          label={t("settings.accessibility.visual.fontLigatures.label")}
          description={t(
            "settings.accessibility.visual.fontLigatures.description"
          )}
          checked={settings.fontLigatures}
          onChange={(e) => onUpdate("fontLigatures", e.currentTarget.checked)}
        />

        <NumberInput
          label={t("settings.accessibility.visual.letterSpacing.label")}
          description={t(
            "settings.accessibility.visual.letterSpacing.description"
          )}
          value={settings.letterSpacing}
          onChange={(val) => onUpdate("letterSpacing", Number(val))}
          min={0}
          max={2}
          step={0.1}
          decimalScale={1}
          suffix=" px"
        />

        <NumberInput
          label={t("settings.accessibility.visual.lineHeight.label")}
          description={t(
            "settings.accessibility.visual.lineHeight.description"
          )}
          value={settings.lineHeight}
          onChange={(val) => onUpdate("lineHeight", Number(val))}
          min={1.0}
          max={2.0}
          step={0.1}
          decimalScale={1}
        />

        <Select
          label={t("settings.accessibility.visual.renderWhitespace.label")}
          description={t(
            "settings.accessibility.visual.renderWhitespace.description"
          )}
          data={[
            {
              value: "none",
              label: t("settings.accessibility.visual.renderWhitespace.none"),
            },
            {
              value: "boundary",
              label: t(
                "settings.accessibility.visual.renderWhitespace.boundary"
              ),
            },
            {
              value: "selection",
              label: t(
                "settings.accessibility.visual.renderWhitespace.selection"
              ),
            },
            {
              value: "all",
              label: t("settings.accessibility.visual.renderWhitespace.all"),
            },
          ]}
          value={settings.renderWhitespace}
          onChange={(val) => val && onUpdate("renderWhitespace", val as any)}
        />
      </SettingGroup>

      <SettingGroup
        title={t("settings.accessibility.motion.title")}
        description={t("settings.accessibility.motion.description")}
      >
        <Switch
          label={t("settings.accessibility.motion.smoothScrolling.label")}
          description={t(
            "settings.accessibility.motion.smoothScrolling.description"
          )}
          checked={settings.smoothScrolling}
          onChange={(e) => onUpdate("smoothScrolling", e.currentTarget.checked)}
        />

        <Select
          label={t("settings.accessibility.motion.animationSpeed.label")}
          description={t(
            "settings.accessibility.motion.animationSpeed.description"
          )}
          data={[
            {
              value: "slow",
              label: t("settings.accessibility.motion.animationSpeed.slow"),
            },
            {
              value: "normal",
              label: t("settings.accessibility.motion.animationSpeed.normal"),
            },
            {
              value: "fast",
              label: t("settings.accessibility.motion.animationSpeed.fast"),
            },
            {
              value: "none",
              label: t("settings.accessibility.motion.animationSpeed.none"),
            },
          ]}
          value={settings.animationSpeed}
          onChange={(val) => val && onUpdate("animationSpeed", val as any)}
        />

        <Switch
          label={t("settings.accessibility.motion.reduceMotion.label")}
          description={t(
            "settings.accessibility.motion.reduceMotion.description"
          )}
          checked={settings.reduceMotion}
          onChange={(e) => onUpdate("reduceMotion", e.currentTarget.checked)}
        />
      </SettingGroup>
    </Stack>
  );
};

import React from "react";
import {
  Stack,
  Title,
  Text,
  Select,
  NumberInput,
  Switch,
  TextInput,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { CompilationSettings as ICompilationSettings } from "../../hooks/useSettings";
import { SettingGroup } from "./SettingGroup";

interface CompilationSettingsProps {
  settings: ICompilationSettings;
  onUpdate: <K extends keyof ICompilationSettings>(
    key: K,
    value: ICompilationSettings[K]
  ) => void;
}

export const CompilationSettings: React.FC<CompilationSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const { t } = useTranslation();

  return (
    <Stack gap="md" maw={600}>
      <Title order={4}>{t("settings.compilation.title")}</Title>
      <Text size="sm" c="dimmed">
        {t("settings.compilation.description")}
      </Text>

      <SettingGroup
        title={t("settings.compilation.buildBehavior.title")}
        description={t("settings.compilation.buildBehavior.description")}
      >
        <Switch
          label={t("settings.compilation.buildBehavior.compileOnSave.label")}
          description={t(
            "settings.compilation.buildBehavior.compileOnSave.description"
          )}
          checked={settings.compileOnSave}
          onChange={(e) => onUpdate("compileOnSave", e.currentTarget.checked)}
        />

        <NumberInput
          label={t("settings.compilation.buildBehavior.timeout.label")}
          description={t(
            "settings.compilation.buildBehavior.timeout.description"
          )}
          value={settings.timeout}
          onChange={(val) => onUpdate("timeout", Number(val))}
          min={30}
          max={300}
          suffix=" sec"
        />
      </SettingGroup>

      <SettingGroup
        title={t("settings.compilation.outputDirectory.title")}
        description={t("settings.compilation.outputDirectory.description")}
      >
        <Select
          label={t("settings.compilation.outputDirectory.buildDirectory.label")}
          description={t(
            "settings.compilation.outputDirectory.buildDirectory.description"
          )}
          data={[
            {
              value: "source",
              label: t(
                "settings.compilation.outputDirectory.buildDirectory.source"
              ),
            },
            { value: "build", label: "./build" },
            { value: "output", label: "./output" },
            {
              value: "custom",
              label: t(
                "settings.compilation.outputDirectory.buildDirectory.custom"
              ),
            },
          ]}
          value={settings.buildDirectory}
          onChange={(val) => val && onUpdate("buildDirectory", val as any)}
        />

        {settings.buildDirectory === "custom" && (
          <TextInput
            label={t(
              "settings.compilation.outputDirectory.customBuildPath.label"
            )}
            description={t(
              "settings.compilation.outputDirectory.customBuildPath.description"
            )}
            value={settings.customBuildPath}
            onChange={(e) => onUpdate("customBuildPath", e.currentTarget.value)}
            placeholder="./custom-build"
          />
        )}

        <Switch
          label={t("settings.compilation.outputDirectory.cleanAuxFiles.label")}
          description={t(
            "settings.compilation.outputDirectory.cleanAuxFiles.description"
          )}
          checked={settings.cleanAuxFiles}
          onChange={(e) => onUpdate("cleanAuxFiles", e.currentTarget.checked)}
        />
      </SettingGroup>

      <SettingGroup
        title={t("settings.compilation.errorHandling.title")}
        description={t("settings.compilation.errorHandling.description")}
      >
        <Switch
          label={t("settings.compilation.errorHandling.showLogOnError.label")}
          description={t(
            "settings.compilation.errorHandling.showLogOnError.description"
          )}
          checked={settings.showLogOnError}
          onChange={(e) => onUpdate("showLogOnError", e.currentTarget.checked)}
        />

        <NumberInput
          label={t("settings.compilation.errorHandling.maxErrors.label")}
          description={t(
            "settings.compilation.errorHandling.maxErrors.description"
          )}
          value={settings.maxErrors}
          onChange={(val) => onUpdate("maxErrors", Number(val))}
          min={10}
          max={100}
        />
      </SettingGroup>
    </Stack>
  );
};

import React from "react";
import { Stack, Title, Text, Select } from "@mantine/core";
import { AppSettings } from "../../hooks/useSettings";

interface ThemeSettingsProps {
  settings: AppSettings;
  onUpdateUi: (theme: string) => void;
}

export const ThemeSettings: React.FC<ThemeSettingsProps> = ({
  settings,
  onUpdateUi,
}) => {
  return (
    <Stack gap="md" maw={600}>
      <Title order={4}>Theme Settings</Title>
      <Text size="sm" c="dimmed">
        Customize the look and feel of the application.
      </Text>

      <Select
        label="UI Theme"
        description="Color theme for the application interface."
        data={[
          {
            group: "Light",
            items: [
              { value: "light-blue", label: "Light Blue (Default)" },
              { value: "light-gray", label: "Light Gray (Minimal)" },
              { value: "light-teal", label: "Light Teal (Nature)" },
            ],
          },
          {
            group: "Dark",
            items: [
              { value: "dark-blue", label: "Dark Blue (Default)" },
              { value: "dark-deep", label: "Deep Black (OLED)" },
              { value: "dark-monokai", label: "Monokai Vivid" },
              { value: "dark-nord", label: "Nordic Cool" },
            ],
          },
        ]}
        value={settings.uiTheme}
        onChange={(val) => val && onUpdateUi(val)}
      />
    </Stack>
  );
};

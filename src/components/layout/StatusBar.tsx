import React from 'react';
import { Group, Text } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTerminal, faDatabase } from '@fortawesome/free-solid-svg-icons';
import { AppTab } from './Sidebar'; // Import τύπου από το Sidebar ή από ένα κοινό types file

interface StatusBarProps {
  activeFile?: AppTab;
  dbConnected?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = React.memo(({ activeFile, dbConnected = true }) => {
  return (
    <Group 
      h={24} 
      px="xs" 
      justify="space-between" 
      bg="#235fceff" 
      c="white" 
      style={{ fontSize: "12px", userSelect: "none" }}
    >
      <Group gap="lg">
        <Group gap={4}>
          <FontAwesomeIcon icon={faTerminal} style={{ width: 12, height: 12 }} />
          <Text size="xs" inherit>Ready</Text>
        </Group>
      </Group>
      
      <Group gap="lg">
        <Text size="xs" inherit>
          {activeFile?.language === 'latex' ? 'LaTeX' : activeFile?.language || 'Plain Text'}
        </Text>
        <Text size="xs" inherit>UTF-8</Text>
        <Group gap={4}>
          <FontAwesomeIcon icon={faDatabase} style={{ width: 10, height: 10, color: dbConnected ? 'white' : '#ff3e3eff' }} />
          <Text size="xs" inherit>
            DataTex DB: {dbConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </Group>
      </Group>
    </Group>
  );
});
import React from 'react';
import { Stack, Group, Text, ActionIcon, Box } from '@mantine/core';
import { X } from 'lucide-react';

interface WizardWrapperProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const WizardWrapper: React.FC<WizardWrapperProps> = ({ 
  title, 
  onClose, 
  children 
}) => {
  return (
    <Stack gap={0} h="100%" bg="dark.8" style={{ borderLeft: "1px solid var(--mantine-color-dark-6)", overflow: 'hidden' }}>
      <Group h={40} px="md" bg="dark.7" justify="space-between" style={{ borderBottom: "1px solid var(--mantine-color-dark-6)", flexShrink: 0 }}>
        <Text size="sm" fw={700}>{title}</Text>
        <ActionIcon variant="subtle" size="sm" onClick={onClose} aria-label="Close Wizard">
          <X size={16} />
        </ActionIcon>
      </Group>
      <Box style={{ flex: 1, overflow: "hidden" }}>
        {children}
      </Box>
    </Stack>
  );
};
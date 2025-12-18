import React, { useState, useEffect } from 'react';
import { 
  Stack, Checkbox, Card, Text, Group, TextInput, Select, ColorInput, Button, Tooltip, Badge, ActionIcon 
} from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSync, faTrash, faPalette } from '@fortawesome/free-solid-svg-icons';
import { PreambleConfig } from '../generators/preambleGenerators';
import { CustomColorDef, COLOR_MODELS, hexToModelValue } from '../LanguageDb';

interface ColorsTabProps {
  config: PreambleConfig;
  customColors: CustomColorDef[];
  onChange: (key: string, val: any) => void;
  onAddColor: (name: string, model: string, value: string, previewHex: string) => void;
  onRemoveColor: (id: number) => void;
}

export const ColorsTab: React.FC<ColorsTabProps> = ({ 
  config, 
  customColors, 
  onChange, 
  onAddColor, 
  onRemoveColor 
}) => {
  // Local state for the "Add New Color" form
  const [newColorName, setNewColorName] = useState('');
  const [newColorModel, setNewColorModel] = useState('HTML');
  const [pickerColor, setPickerColor] = useState('#1971C2');
  const [newColorValue, setNewColorValue] = useState('');

  // Auto-calculate the LaTeX color value when picker or model changes
  useEffect(() => {
    const val = hexToModelValue(pickerColor, newColorModel);
    setNewColorValue(val);
  }, [pickerColor, newColorModel]);

  const handleAdd = () => {
    if (newColorName && newColorValue) {
      // Sanitize name to be LaTeX friendly (alphanumeric)
      const sanitizedName = newColorName.replace(/[^a-zA-Z0-9]/g, '');
      onAddColor(sanitizedName, newColorModel, newColorValue, pickerColor);
      
      // Reset form (keep model/picker for convenience)
      setNewColorName('');
    }
  };

  return (
    <Stack gap="md">
      <Checkbox 
        label="Enable Xcolor Package" 
        checked={config.pkgXcolor} 
        onChange={(e) => onChange('pkgXcolor', e.currentTarget.checked)} 
      />
      
      <Card withBorder p="sm" bg="dark.7">
        <Group gap="xs" mb="xs">
            <FontAwesomeIcon icon={faPalette} style={{ width: 16, height: 16 }} />
            <Text size="sm" fw={700}>Define New Color</Text>
        </Group>
        
        <Stack gap="sm">
          <Group grow align="flex-end">
            <TextInput 
              label="Color Name" 
              placeholder="e.g. myBlue" 
              value={newColorName} 
              onChange={(e) => setNewColorName(e.currentTarget.value)} 
            />
            <Select 
              label="Model" 
              data={COLOR_MODELS} 
              value={newColorModel} 
              onChange={(v) => setNewColorModel(v || 'HTML')}
            />
            <ColorInput 
              label="Pick Color"
              value={pickerColor} 
              onChange={setPickerColor}
              format="hex"
            />
          </Group>
          
          <Group align="flex-end">
            <TextInput 
              label={`Calculated Values (${newColorModel})`} 
              value={newColorValue}
              onChange={(e) => setNewColorValue(e.currentTarget.value)}
              style={{ flex: 1 }}
              rightSection={
                <Tooltip label="Auto-calculated from picker. You can edit manually.">
                  <FontAwesomeIcon icon={faSync} style={{ width: 14, height: 14 }} />
                </Tooltip>
              }
            />
            <Button onClick={handleAdd} leftSection={<FontAwesomeIcon icon={faPlus} style={{ width: 16, height: 16 }} />}>Add</Button>
          </Group>
        </Stack>
      </Card>

      <Stack gap="xs">
        {customColors.map(c => (
          <Group key={c.id} justify="space-between" bg="dark.6" p="xs" style={{ borderRadius: 4 }}>
            <Group>
              <Tooltip label={`Preview based on: ${c.previewHex}`}>
                <div 
                  style={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: 4, 
                    backgroundColor: c.previewHex, 
                    border: '1px solid white' 
                  }} 
                />
              </Tooltip>
              <Stack gap={0}>
                <Text size="sm" fw={500}>{c.name}</Text>
                <Group gap={6}>
                  <Badge size="xs" variant="light" color="blue">{c.model}</Badge>
                  <Text size="xs" c="dimmed" style={{fontFamily: 'monospace'}}>{c.value}</Text>
                </Group>
              </Stack>
            </Group>
            <ActionIcon color="red" variant="subtle" onClick={() => onRemoveColor(c.id)}>
              <FontAwesomeIcon icon={faTrash} style={{ width: 16, height: 16 }} />
            </ActionIcon>
          </Group>
        ))}
        
        {customColors.length === 0 && (
          <Text size="sm" c="dimmed" ta="center" mt="sm">No custom colors defined yet.</Text>
        )}
      </Stack>
    </Stack>
  );
};
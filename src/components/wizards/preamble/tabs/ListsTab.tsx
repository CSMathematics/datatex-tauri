import React, { useState } from 'react';
import { 
  Stack, Select, Divider, Card, Group, Switch, Text, TextInput, Button, ActionIcon 
} from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { PreambleConfig } from '../generators/preambleGenerators';
import { CustomListDef } from '../LanguageDb';

interface ListsTabProps {
  config: PreambleConfig;
  customLists: CustomListDef[];
  onChange: (key: string, val: any) => void;
  onAddList: (name: string, type: string, label: string) => void;
  onRemoveList: (id: number) => void;
}

export const ListsTab: React.FC<ListsTabProps> = ({ 
  config, 
  customLists, 
  onChange, 
  onAddList, 
  onRemoveList 
}) => {
  const [newListName, setNewListName] = useState('');
  const [newListType, setNewListType] = useState<string>('enumerate');
  const [newListLabel, setNewListLabel] = useState('');

  const handleAdd = () => {
    if (newListName && newListType) {
      onAddList(newListName, newListType, newListLabel);
      setNewListName('');
      setNewListLabel('');
    }
  };

  return (
    <>
      <Card withBorder p="sm" bg="dark.7" mb="md">
        <Group justify="space-between">
          <Text fw={500}>Enumitem Package</Text>
          <Switch 
            checked={config.pkgEnumitem} 
            onChange={(e) => onChange('pkgEnumitem', e.currentTarget.checked)} 
          />
        </Group>
      </Card>

      {config.pkgEnumitem && (
        <Stack gap="md">
          <Select 
            label="Global Spacing" 
            description="Sets the vertical spacing for all lists."
            data={[
                { value: 'default', label: 'Default' },
                { value: 'nosep', label: 'No Separation (nosep)' },
                { value: 'half', label: 'Half Spacing' }
            ]}
            value={config.enumitemSep}
            onChange={(v) => onChange('enumitemSep', v)}
          />
          
          <Divider label="Itemize Settings" labelPosition="left" />
          <Select 
            label="Default Bullet Label"
            data={[
                { value: 'default', label: 'Default' },
                { value: 'bullet', label: 'Bullet (•)' },
                { value: 'dash', label: 'Dash (–)' },
                { value: 'asterisk', label: 'Asterisk (*)' },
            ]}
            value={config.enumitemItemize}
            onChange={(v) => onChange('enumitemItemize', v)}
          />

          <Divider label="Enumerate Settings" labelPosition="left" />
          <Select 
            label="Default Numbering"
            data={[
                { value: 'default', label: 'Default (1.)' },
                { value: 'arabic_paren', label: 'Parenthesis (1)' },
                { value: 'alph', label: 'Small Alpha a)' },
                { value: 'Alph', label: 'Big Alpha A.' },
                { value: 'roman', label: 'Small Roman i)' },
                { value: 'Roman', label: 'Big Roman I.' },
            ]}
            value={config.enumitemEnumerate}
            onChange={(v) => onChange('enumitemEnumerate', v)}
          />

          <Divider my="sm" />
          <Text size="sm" fw={700} mb="xs">Custom Lists</Text>
          
          <Card withBorder p="sm" bg="dark.7">
             <Stack gap="sm">
                <Group grow>
                   <TextInput 
                     label="Name" 
                     placeholder="e.g. questions" 
                     value={newListName} 
                     onChange={(e) => setNewListName(e.currentTarget.value)} 
                   />
                   <Select 
                     label="Base Type" 
                     data={['enumerate', 'itemize', 'description']} 
                     value={newListType} 
                     onChange={(v) => setNewListType(v || 'enumerate')} 
                   />
                </Group>
                <Group align="flex-end">
                   <TextInput 
                     label="Label Pattern" 
                     placeholder="e.g. \arabic*." 
                     value={newListLabel} 
                     onChange={(e) => setNewListLabel(e.currentTarget.value)} 
                     style={{ flex: 1 }} 
                   />
                   <Button onClick={handleAdd} leftSection={<FontAwesomeIcon icon={faPlus} style={{ width: 16, height: 16 }} />}>Add</Button>
                </Group>
             </Stack>
          </Card>

          <Stack gap="xs" mt="sm">
             {customLists.map(l => (
                <Group key={l.id} justify="space-between" bg="dark.6" p="xs" style={{ borderRadius: 4 }}>
                   <Stack gap={0}>
                      <Text size="sm" fw={500}>{l.name}</Text>
                      <Text size="xs" c="dimmed">Type: {l.baseType} | Label: {l.label || 'Default'}</Text>
                   </Stack>
                   <ActionIcon color="red" variant="subtle" onClick={() => onRemoveList(l.id)}>
                      <FontAwesomeIcon icon={faTrash} style={{ width: 16, height: 16 }} />
                   </ActionIcon>
                </Group>
             ))}
             {customLists.length === 0 && <Text size="sm" c="dimmed" ta="center">No custom lists defined</Text>}
          </Stack>
        </Stack>
      )}
    </>
  );
};
import React from 'react';
import { 
  Stack, Group, Text, Switch, Radio, Select, NumberInput, 
  SimpleGrid, Divider, Card, Checkbox 
} from '@mantine/core';
import { PreambleConfig } from '../generators/preambleGenerators';

interface LayoutTabProps {
  config: PreambleConfig;
  onChange: (key: string, val: any) => void;
}

export const LayoutTab: React.FC<LayoutTabProps> = ({ config, onChange }) => {
  return (
    <>
      <Card withBorder p="sm" bg="dark.7" mb="md">
        <Group justify="space-between">
          <Text fw={500}>Geometry Package</Text>
          <Switch 
            checked={config.pkgGeometry} 
            onChange={(e) => onChange('pkgGeometry', e.currentTarget.checked)} 
          />
        </Group>
      </Card>

      {config.pkgGeometry && (
        <Stack>
          <Group grow align="start">
            <Stack gap="xs">
              <Text size="sm" fw={500} c="dimmed">COLUMNS</Text>
              <Radio.Group 
                value={config.columns} 
                onChange={(v) => onChange('columns', v)}
              >
                <Group>
                  <Radio value="one" label="One" />
                  <Radio value="two" label="Two" />
                </Group>
              </Radio.Group>
              {config.columns === 'two' && (
                <NumberInput 
                  label="Sep (cm)" 
                  value={config.columnSep} 
                  onChange={(v) => onChange('columnSep', v)} 
                  step={0.1} 
                  size="xs" 
                />
              )}
            </Stack>
            <Stack gap="xs">
              <Text size="sm" fw={500} c="dimmed">SIDEDNESS</Text>
              <Select 
                data={['oneside', 'twoside', 'asymmetric']} 
                value={config.sidedness} 
                onChange={(v) => onChange('sidedness', v)} 
              />
            </Stack>
          </Group>

          <Divider />
          <Text size="sm" fw={500} c="dimmed">MARGINS (cm)</Text>
          <SimpleGrid cols={4}>
            <NumberInput 
              label="Top" 
              value={config.marginTop} 
              onChange={(v) => onChange('marginTop', v)} 
              step={0.1} 
              min={0} 
            />
            <NumberInput 
              label="Bottom" 
              value={config.marginBottom} 
              onChange={(v) => onChange('marginBottom', v)} 
              step={0.1} 
              min={0} 
            />
            <NumberInput 
              label="Left" 
              value={config.marginLeft} 
              onChange={(v) => onChange('marginLeft', v)} 
              step={0.1} 
              min={0} 
            />
            <NumberInput 
              label="Right" 
              value={config.marginRight} 
              onChange={(v) => onChange('marginRight', v)} 
              step={0.1} 
              min={0} 
            />
          </SimpleGrid>

          <Divider />
          <Text size="sm" fw={500} c="dimmed">HEADER & FOOTER & OFFSETS (cm)</Text>
          <SimpleGrid cols={3}>
            <NumberInput 
              label="Head Height" 
              value={config.headHeight} 
              onChange={(v) => onChange('headHeight', v)} 
              step={0.1} 
              min={0} 
            />
            <NumberInput 
              label="Head Sep" 
              value={config.headSep} 
              onChange={(v) => onChange('headSep', v)} 
              step={0.1} 
              min={0} 
            />
            <Checkbox 
              label="Include Head" 
              checked={config.includeHead} 
              onChange={(e) => onChange('includeHead', e.currentTarget.checked)} 
              mt={28} 
            />
            
            <NumberInput 
              label="Foot Skip" 
              value={config.footSkip} 
              onChange={(v) => onChange('footSkip', v)} 
              step={0.1} 
              min={0} 
            />
            <NumberInput 
              label="Binding Offset" 
              value={config.bindingOffset} 
              onChange={(v) => onChange('bindingOffset', v)} 
              step={0.1} 
              min={0} 
            />
            <Checkbox 
              label="Include Foot" 
              checked={config.includeFoot} 
              onChange={(e) => onChange('includeFoot', e.currentTarget.checked)} 
              mt={28} 
            />
            
            <NumberInput 
              label="H Offset" 
              value={config.hOffset} 
              onChange={(v) => onChange('hOffset', v)} 
              step={0.1} 
            />
            <NumberInput 
              label="V Offset" 
              value={config.vOffset} 
              onChange={(v) => onChange('vOffset', v)} 
              step={0.1} 
            />
          </SimpleGrid>

          <Divider />
          <Group>
            <Checkbox 
              label="Enable Margin Notes" 
              checked={config.marginNotes} 
              onChange={(e) => onChange('marginNotes', e.currentTarget.checked)} 
            />
            {config.marginNotes && (
              <>
                <Checkbox 
                  label="Include MP" 
                  checked={config.includeMp} 
                  onChange={(e) => onChange('includeMp', e.currentTarget.checked)} 
                />
                <NumberInput 
                  placeholder="Sep" 
                  value={config.marginSep} 
                  onChange={(v) => onChange('marginSep', v)} 
                  w={80} 
                  size="xs" 
                />
                <NumberInput 
                  placeholder="Width" 
                  value={config.marginWidth} 
                  onChange={(v) => onChange('marginWidth', v)} 
                  w={80} 
                  size="xs" 
                />
              </>
            )}
          </Group>
        </Stack>
      )}
    </>
  );
};
import React, { useState } from 'react';
import { 
  Grid, Select, TextInput, Button, Tabs, Stack, Text, Code, 
  Group, ScrollArea, ColorInput 
} from '@mantine/core';
import { PenTool, Check, RefreshCw } from 'lucide-react';

interface TikzWizardProps {
  onInsert: (code: string) => void;
}

export const TikzWizard: React.FC<TikzWizardProps> = ({ onInsert }) => {
  const [activeTab, setActiveTab] = useState<string | null>('basic');
  
  // Basic Shapes State
  const [shape, setShape] = useState('node');
  const [coords, setCoords] = useState('0,0');
  const [content, setContent] = useState('Text');
  const [color, setColor] = useState('black');
  
  // Plot State
  const [func, setFunc] = useState('x^2');
  const [domain, setDomain] = useState('-5:5');

  const getCode = () => {
    if (activeTab === 'basic') {
      let cmd = `\\draw[${color}] (${coords}) `;
      if (shape === 'node') return `\\node[draw, ${color}] at (${coords}) {${content}};`;
      if (shape === 'circle') cmd += `circle (${content});`;
      if (shape === 'rectangle') cmd += `rectangle ++(${content});`;
      if (shape === 'line') cmd += `-- (${content});`;
      return `\\begin{tikzpicture}\n  ${cmd}\n\\end{tikzpicture}`;
    }
    if (activeTab === 'plot') {
      return `\\begin{tikzpicture}\n  \\begin{axis}\n    \\addplot[domain=${domain}] {${func}};\n  \\end{axis}\n\\end{tikzpicture}`;
    }
    return '';
  };

  return (
    <Grid h="100%">
      <Grid.Col span={6} p="md">
        <Stack>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="basic">Basic Shapes</Tabs.Tab>
              <Tabs.Tab value="plot">Functions (Pgfplots)</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="basic" pt="md">
              <Stack>
                <Select label="Shape" data={['node', 'circle', 'rectangle', 'line']} value={shape} onChange={(v) => setShape(v || 'node')} />
                <TextInput label="Coordinates" value={coords} onChange={(e) => setCoords(e.currentTarget.value)} />
                <TextInput 
                  label={shape === 'node' ? 'Text' : shape === 'line' ? 'End Point' : 'Size/Radius'} 
                  value={content} onChange={(e) => setContent(e.currentTarget.value)} 
                />
                <Select label="Color" data={['black', 'red', 'blue', 'green']} value={color} onChange={(v) => setColor(v || 'black')} />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="plot" pt="md">
              <Stack>
                <TextInput label="Function f(x)=" value={func} onChange={(e) => setFunc(e.currentTarget.value)} />
                <TextInput label="Domain (min:max)" value={domain} onChange={(e) => setDomain(e.currentTarget.value)} />
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Grid.Col>

      <Grid.Col span={6} bg="dark.8" p="md" style={{ borderLeft: '1px solid var(--mantine-color-dark-6)' }}>
        <Stack h="100%">
           <Text size="sm" fw={700} c="dimmed">PREVIEW CODE</Text>
           <Code block style={{ flex: 1 }}>{getCode()}</Code>
           <Button leftSection={<Check size={16}/>} onClick={() => onInsert(getCode())}>Insert TikZ</Button>
        </Stack>
      </Grid.Col>
    </Grid>
  );
};
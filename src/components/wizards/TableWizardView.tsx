import React, { useState } from 'react';
import { 
  Grid, Button, TextInput, Switch, ActionIcon, 
  Group, Stack, Text, ScrollArea, Tooltip, Divider 
} from '@mantine/core';
import { 
  Plus, Trash, AlignLeft, AlignCenter, AlignRight, 
  Table as TableIcon, Check 
} from 'lucide-react';

interface TableWizardProps {
  onInsert: (code: string) => void;
}

export const TableWizard: React.FC<TableWizardProps> = ({ onInsert }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [data, setData] = useState<string[][]>(
    Array(3).fill(null).map(() => Array(3).fill(''))
  );
  const [alignments, setAlignments] = useState<string[]>(Array(3).fill('c'));
  const [useBooktabs, setUseBooktabs] = useState(true);
  const [caption, setCaption] = useState('');
  const [label, setLabel] = useState('');

  const updateCell = (r: number, c: number, val: string) => {
    const newData = [...data];
    newData[r][c] = val;
    setData(newData);
  };

  const addRow = () => {
    setData([...data, Array(cols).fill('')]);
    setRows(r => r + 1);
  };

  const addCol = () => {
    setData(data.map(row => [...row, '']));
    setAlignments([...alignments, 'c']);
    setCols(c => c + 1);
  };

  const cycleAlign = (idx: number) => {
    const map = ['l', 'c', 'r'];
    const currentIdx = map.indexOf(alignments[idx]);
    const newAligns = [...alignments];
    newAligns[idx] = map[(currentIdx + 1) % 3];
    setAlignments(newAligns);
  };

  const generateCode = () => {
    let code = `\\begin{table}[h]\n  \\centering\n`;
    const colSpec = useBooktabs ? alignments.join(' ') : `|${alignments.join('|')}|`;
    
    code += `  \\begin{tabular}{${colSpec}}\n`;
    code += useBooktabs ? `    \\toprule\n` : `    \\hline\n`;

    data.forEach((row, rIdx) => {
      code += `    ${row.join(' & ')} \\\\\n`;
      if (useBooktabs && rIdx === 0) code += `    \\midrule\n`;
      else if (!useBooktabs) code += `    \\hline\n`;
    });

    if (useBooktabs) code += `    \\bottomrule\n`;
    code += `  \\end{tabular}\n`;
    if (caption) code += `  \\caption{${caption}}\n`;
    if (label) code += `  \\label{${label}}\n`;
    code += `\\end{table}`;
    
    return code;
  };

  return (
    <Grid h="100%" gutter={0}>
      {/* Editor */}
      <Grid.Col span={9} p="md">
        <Stack h="100%">
           <Group>
             <Button leftSection={<Plus size={16}/>} variant="light" onClick={addRow} size="xs">Add Row</Button>
             <Button leftSection={<Plus size={16}/>} variant="light" onClick={addCol} size="xs">Add Col</Button>
           </Group>
           
           <ScrollArea style={{ flex: 1, border: '1px solid var(--mantine-color-dark-6)', borderRadius: 4 }} bg="dark.7" p="sm">
             <div style={{ display: 'inline-block' }}>
                {/* Header Alignments */}
                <Group gap={4} mb="xs" wrap="nowrap">
                   <div style={{ width: 30 }} /> 
                   {alignments.map((align, i) => (
                      <ActionIcon key={i} w={120} variant="subtle" onClick={() => cycleAlign(i)}>
                        {align === 'l' ? <AlignLeft size={16}/> : align === 'c' ? <AlignCenter size={16}/> : <AlignRight size={16}/>}
                      </ActionIcon>
                   ))}
                </Group>

                {/* Rows */}
                {data.map((row, rIdx) => (
                  <Group key={rIdx} gap={4} mb={4} wrap="nowrap">
                    <ActionIcon color="red" variant="subtle" size="sm" onClick={() => {
                        if (rows > 1) {
                          setData(data.filter((_, i) => i !== rIdx));
                          setRows(rows - 1);
                        }
                    }}>
                       <Trash size={14} />
                    </ActionIcon>
                    {row.map((cell, cIdx) => (
                      <TextInput 
                        key={`${rIdx}-${cIdx}`}
                        value={cell}
                        onChange={(e) => updateCell(rIdx, cIdx, e.currentTarget.value)}
                        w={120}
                        styles={{ input: { textAlign: alignments[cIdx] as any } }}
                        placeholder={rIdx === 0 ? "Header" : "Data"}
                      />
                    ))}
                  </Group>
                ))}
             </div>
           </ScrollArea>
        </Stack>
      </Grid.Col>

      {/* Sidebar Options */}
      <Grid.Col span={3} bg="dark.8" p="md" style={{ borderLeft: '1px solid var(--mantine-color-dark-6)' }}>
        <Stack>
          <Group gap="xs">
            <TableIcon size={18} />
            <Text fw={700}>Options</Text>
          </Group>
          <Divider />
          <Switch label="Professional (Booktabs)" checked={useBooktabs} onChange={(e) => setUseBooktabs(e.currentTarget.checked)} />
          <TextInput label="Caption" placeholder="My Table" value={caption} onChange={(e) => setCaption(e.currentTarget.value)} />
          <TextInput label="Label" placeholder="tab:mytable" value={label} onChange={(e) => setLabel(e.currentTarget.value)} />
          
          <Button mt="xl" fullWidth leftSection={<Check size={16} />} onClick={() => onInsert(generateCode())}>
            Insert Table
          </Button>
        </Stack>
      </Grid.Col>
    </Grid>
  );
};
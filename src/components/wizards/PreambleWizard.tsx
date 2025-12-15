import React, { useState, useEffect, useMemo } from 'react';
import { 
  Grid, Select, TextInput, NumberInput, Checkbox, Switch, 
  Button, Tabs, Divider, ColorInput, ActionIcon, Group, 
  Stack, Text, Code, ScrollArea, Box, Radio, Badge,
  SimpleGrid, Card, Tooltip
} from '@mantine/core';
import { 
  Check, Trash, Plus, FileText, Layout, Package, Palette, 
  Code as CodeIcon, Eye, RefreshCw
} from 'lucide-react';

interface PreambleWizardProps {
  onInsert: (code: string) => void;
}

// --- Constants ---
const PAGE_WIDTH_PX = 340;
const A4_ASPECT_RATIO = 1.414;
const PAGE_HEIGHT_PX = PAGE_WIDTH_PX * A4_ASPECT_RATIO;
const A4_WIDTH_CM = 21;
const CM_TO_PX = PAGE_WIDTH_PX / A4_WIDTH_CM;

const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'greek', label: 'Greek (Ελληνικά)' },
  { value: 'german', label: 'German' },
  { value: 'french', label: 'French' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'italian', label: 'Italian' },
  { value: 'russian', label: 'Russian' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'arabic', label: 'Arabic' },
];

const COLOR_MODELS = [
  { value: 'HTML', label: 'HTML (Hex)' },
  { value: 'rgb', label: 'rgb (0-1)' },
  { value: 'RGB', label: 'RGB (0-255)' },
  { value: 'cmyk', label: 'cmyk (0-1)' },
  { value: 'gray', label: 'gray (0-1)' },
];

interface CustomColorDef {
  id: number;
  name: string;
  model: string;
  value: string;
  previewHex: string; // Used strictly for UI preview
}

// --- Helper: Color Conversion Logic ---
const hexToModelValue = (hex: string, model: string): string => {
  // Remove hash
  hex = hex.replace('#', '');
  
  // Parse RGB
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  switch (model) {
    case 'HTML':
      return hex.toUpperCase();
    
    case 'RGB':
      return `${r},${g},${b}`;
    
    case 'rgb':
      return `${rNorm.toFixed(3)},${gNorm.toFixed(3)},${bNorm.toFixed(3)}`;
    
    case 'gray':
      // Standard luminance formula
      const gray = 0.299 * rNorm + 0.587 * gNorm + 0.114 * bNorm;
      return gray.toFixed(3);
    
    case 'cmyk':
      const k = 1 - Math.max(rNorm, gNorm, bNorm);
      if (k === 1) return '0,0,0,1';
      const c = (1 - rNorm - k) / (1 - k);
      const m = (1 - gNorm - k) / (1 - k);
      const y = (1 - bNorm - k) / (1 - k);
      return `${c.toFixed(3)},${m.toFixed(3)},${y.toFixed(3)},${k.toFixed(3)}`;
      
    default:
      return hex;
  }
};

export const PreambleWizard: React.FC<PreambleWizardProps> = ({ onInsert }) => {
  const [activeTab, setActiveTab] = useState<string | null>('general');
  const [previewMode, setPreviewMode] = useState<'code' | 'visual'>('visual');
  const [generatedCode, setGeneratedCode] = useState('');

  // --- Configuration State ---
  const [config, setConfig] = useState({
    docClass: 'article',
    fontSize: '11',
    paperSize: 'a4paper',
    encoding: 'utf8',
    mainLang: 'english',
    title: '',
    author: '',
    date: true,
    pkgGeometry: true,
    marginTop: 2.5,
    marginBottom: 2.5,
    marginLeft: 2.5,
    marginRight: 2.5,
    columns: 'one',
    columnSep: 0.5,
    sidedness: 'oneside',
    marginNotes: false,
    marginSep: 0.5,
    marginWidth: 3.0,
    includeMp: false,
    headHeight: 0,
    headSep: 0,
    footSkip: 0,
    bindingOffset: 0,
    includeHead: false,
    includeFoot: false,
    pkgAmsmath: true,
    pkgGraphicx: true,
    pkgHyperref: true,
    pkgTikz: false,
    pkgPgfplots: false,
    pkgBooktabs: false,
    pkgFloat: false,
    pkgFancyhdr: false,
    pkgXcolor: true,
  });

  // --- Custom Colors State ---
  const [customColors, setCustomColors] = useState<CustomColorDef[]>([]);
  
  // New Color Form State
  const [newColorName, setNewColorName] = useState('');
  const [newColorModel, setNewColorModel] = useState('HTML');
  const [pickerColor, setPickerColor] = useState('#1971C2'); // Source of truth for color
  const [newColorValue, setNewColorValue] = useState(''); // Calculated value string

  const handleChange = (key: string, val: any) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  // --- EFFECT: Auto-Calculate Value when Picker or Model changes ---
  useEffect(() => {
    const val = hexToModelValue(pickerColor, newColorModel);
    setNewColorValue(val);
  }, [pickerColor, newColorModel]);

  // --- Code Generation ---
  useEffect(() => {
    const v = config;
    let code = '';

    // Class & Basic Packages
    let classOpts: string[] = [`${v.fontSize}pt`, v.paperSize];
    if (v.columns === 'two') classOpts.push('twocolumn');
    if (v.sidedness === 'twoside') classOpts.push('twoside');

    code += `\\documentclass[${classOpts.join(', ')}]{${v.docClass}}\n`;
    code += `\\usepackage[${v.encoding}]{inputenc}\n`;
    code += `\\usepackage[T1]{fontenc}\n`;

    let babelOpts = ['english'];
    if (v.mainLang !== 'english') babelOpts.push(v.mainLang);
    code += `\\usepackage[${babelOpts.join(',')}]{babel}\n`;
    if (v.mainLang === 'greek') code += `\\usepackage{alphabeta}\n`;

    // Geometry
    if (v.pkgGeometry) {
      let gOpts: string[] = [];
      gOpts.push(`top=${v.marginTop}cm`, `bottom=${v.marginBottom}cm`, `left=${v.marginLeft}cm`, `right=${v.marginRight}cm`);
      if (v.columns === 'two') gOpts.push(`columnsep=${v.columnSep}cm`);
      if (v.marginNotes) {
        gOpts.push(`marginparsep=${v.marginSep}cm`, `marginparwidth=${v.marginWidth}cm`);
        if (v.includeMp) gOpts.push(`includemp`);
      }
      if (v.headHeight > 0) gOpts.push(`headheight=${v.headHeight}cm`);
      if (v.headSep > 0) gOpts.push(`headsep=${v.headSep}cm`);
      if (v.footSkip > 0) gOpts.push(`footskip=${v.footSkip}cm`);
      if (v.bindingOffset > 0) gOpts.push(`bindingoffset=${v.bindingOffset}cm`);
      if (v.includeHead) gOpts.push(`includehead`);
      if (v.includeFoot) gOpts.push(`includefoot`);
      if (v.sidedness === 'asymmetric') gOpts.push(`asymmetric`);

      code += `\\usepackage[${gOpts.join(', ')}]{geometry}\n`;
    }

    // Packages
    code += `\n% --- Packages ---\n`;
    if (v.pkgAmsmath) code += `\\usepackage{amsmath, amsfonts, amssymb}\n`;
    if (v.pkgGraphicx) code += `\\usepackage{graphicx}\n`;
    
    // XColor Logic
    if (v.pkgXcolor || customColors.length > 0) {
        code += `\\usepackage[dvipsnames, table]{xcolor}\n`;
    }

    // Custom Colors Definitions
    if (customColors.length > 0) {
        code += `\n% --- Custom Colors ---\n`;
        customColors.forEach(c => {
            code += `\\definecolor{${c.name}}{${c.model}}{${c.value}}\n`;
        });
    }

    if (v.pkgBooktabs) code += `\\usepackage{booktabs}\n`;
    if (v.pkgFloat) code += `\\usepackage{float}\n`;
    if (v.pkgTikz) code += `\\usepackage{tikz}\n`;
    if (v.pkgPgfplots) code += `\\usepackage{pgfplots}\n\\pgfplotsset{compat=1.18}\n`;
    if (v.pkgFancyhdr) code += `\\usepackage{fancyhdr}\n\\pagestyle{fancy}\n`;
    if (v.pkgHyperref) code += `\\usepackage{hyperref}\n\\hypersetup{colorlinks=true, linkcolor=blue}\n`;

    // Metadata
    code += `\n% --- Metadata ---\n`;
    code += `\\title{${v.title || 'Untitled'}}\n`;
    code += `\\author{${v.author || ''}}\n`;
    code += `\\date{${v.date ? '\\today' : ''}}\n`;

    code += `\n\\begin{document}\n\n\\maketitle\n\n\\section{Introduction}\n% Content here\n\n\\end{document}`;
    setGeneratedCode(code);
  }, [config, customColors]);

  // --- Handlers ---
  const addColor = () => {
    if (newColorName && newColorValue) {
      const sanitizedName = newColorName.replace(/[^a-zA-Z0-9]/g, '');
      setCustomColors([
          ...customColors, 
          { 
              id: Date.now(), 
              name: sanitizedName, 
              model: newColorModel, 
              value: newColorValue,
              previewHex: pickerColor // Always store the picker hex for UI preview
          }
      ]);
      setNewColorName('');
      // We keep the picker color and model as is for easy variations
    }
  };

  // --- Visualization Helpers ---
  const geometryStyles = useMemo(() => {
    const headerHeightPx = config.pkgGeometry ? config.headHeight * CM_TO_PX : 0;
    const headerSepPx = config.pkgGeometry ? config.headSep * CM_TO_PX : 0;
    
    const bodyTopPx = config.pkgGeometry 
        ? config.marginTop * CM_TO_PX + (config.includeHead ? 0 : headerHeightPx + headerSepPx)
        : 30;
    
    const bodyBottomMarginPx = config.pkgGeometry ? config.marginBottom * CM_TO_PX : 30;
    const bodyBottomPx = PAGE_HEIGHT_PX - bodyBottomMarginPx;
    const bodyRightEdgePx = PAGE_WIDTH_PX - (config.marginRight * CM_TO_PX);
    const marginNotesStartPx = bodyRightEdgePx + (config.marginSep * CM_TO_PX);
    const marginNotesWidthCapPx = config.marginWidth * CM_TO_PX;

    return { headerHeightPx, headerSepPx, bodyTopPx, bodyBottomPx, bodyBottomMarginPx, marginNotesStartPx, marginNotesWidthCapPx };
  }, [config]);

  return (
    <Grid h="100%" gutter={0}>
      {/* LEFT COLUMN: Settings */}
      <Grid.Col span={7} h="100%">
        <ScrollArea h="100%">
          <Stack gap="md" p="md">
            
            <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="sm">
              <Tabs.List grow>
                <Tabs.Tab value="general" leftSection={<FileText size={16}/>}>General</Tabs.Tab>
                <Tabs.Tab value="layout" leftSection={<Layout size={16}/>}>Layout</Tabs.Tab>
                <Tabs.Tab value="packages" leftSection={<Package size={16}/>}>Packages</Tabs.Tab>
                <Tabs.Tab value="colors" leftSection={<Palette size={16}/>}>Colors</Tabs.Tab>
              </Tabs.List>

              {/* TABS CONTENT */}
              <Tabs.Panel value="general" pt="md">
                <SimpleGrid cols={2} spacing="md">
                  <Select label="Document Class" data={['article', 'report', 'book', 'beamer']} value={config.docClass} onChange={(v) => handleChange('docClass', v)} />
                  <Select label="Font Size" data={['10', '11', '12']} value={config.fontSize} onChange={(v) => handleChange('fontSize', v)} />
                  <Select label="Paper Size" data={['a4paper', 'letterpaper', 'b5paper']} value={config.paperSize} onChange={(v) => handleChange('paperSize', v)} />
                  <Select label="Language" data={LANGUAGES} value={config.mainLang} onChange={(v) => handleChange('mainLang', v)} searchable />
                </SimpleGrid>
                <Divider my="md" />
                <TextInput label="Title" mb="sm" value={config.title} onChange={(e) => handleChange('title', e.currentTarget.value)} />
                <Group grow>
                   <TextInput label="Author" value={config.author} onChange={(e) => handleChange('author', e.currentTarget.value)} />
                   <Switch label="Include Date" checked={config.date} onChange={(e) => handleChange('date', e.currentTarget.checked)} mt={24} />
                </Group>
              </Tabs.Panel>

              <Tabs.Panel value="layout" pt="md">
                 <Card withBorder p="sm" bg="dark.7" mb="md">
                   <Group justify="space-between">
                     <Text fw={500}>Geometry Package</Text>
                     <Switch checked={config.pkgGeometry} onChange={(e) => handleChange('pkgGeometry', e.currentTarget.checked)} />
                   </Group>
                 </Card>
                 {config.pkgGeometry && (
                   <Stack>
                     <Group grow align="start">
                        <Stack gap="xs">
                            <Text size="sm" fw={500} c="dimmed">COLUMNS</Text>
                            <Radio.Group value={config.columns} onChange={(v) => handleChange('columns', v)}>
                                <Group>
                                    <Radio value="one" label="One" />
                                    <Radio value="two" label="Two" />
                                </Group>
                            </Radio.Group>
                            {config.columns === 'two' && <NumberInput label="Sep (cm)" value={config.columnSep} onChange={(v) => handleChange('columnSep', v)} step={0.1} size="xs" />}
                        </Stack>
                        <Stack gap="xs">
                            <Text size="sm" fw={500} c="dimmed">SIDEDNESS</Text>
                            <Select data={['oneside', 'twoside', 'asymmetric']} value={config.sidedness} onChange={(v) => handleChange('sidedness', v)} />
                        </Stack>
                     </Group>
                     <Divider />
                     <Text size="sm" fw={500} c="dimmed">MARGINS (cm)</Text>
                     <SimpleGrid cols={4}>
                        <NumberInput label="Top" value={config.marginTop} onChange={(v) => handleChange('marginTop', v)} step={0.1} min={0} />
                        <NumberInput label="Bottom" value={config.marginBottom} onChange={(v) => handleChange('marginBottom', v)} step={0.1} min={0} />
                        <NumberInput label="Left" value={config.marginLeft} onChange={(v) => handleChange('marginLeft', v)} step={0.1} min={0} />
                        <NumberInput label="Right" value={config.marginRight} onChange={(v) => handleChange('marginRight', v)} step={0.1} min={0} />
                     </SimpleGrid>
                     <Divider />
                     <Text size="sm" fw={500} c="dimmed">HEADER & FOOTER (cm)</Text>
                     <SimpleGrid cols={3}>
                        <NumberInput label="Head Height" value={config.headHeight} onChange={(v) => handleChange('headHeight', v)} step={0.1} min={0} />
                        <NumberInput label="Head Sep" value={config.headSep} onChange={(v) => handleChange('headSep', v)} step={0.1} min={0} />
                        <Checkbox label="Include Head" checked={config.includeHead} onChange={(e) => handleChange('includeHead', e.currentTarget.checked)} mt={28} />
                        <NumberInput label="Foot Skip" value={config.footSkip} onChange={(v) => handleChange('footSkip', v)} step={0.1} min={0} />
                        <NumberInput label="Binding Offset" value={config.bindingOffset} onChange={(v) => handleChange('bindingOffset', v)} step={0.1} min={0} />
                        <Checkbox label="Include Foot" checked={config.includeFoot} onChange={(e) => handleChange('includeFoot', e.currentTarget.checked)} mt={28} />
                     </SimpleGrid>
                     <Divider />
                     <Group>
                        <Checkbox label="Enable Margin Notes" checked={config.marginNotes} onChange={(e) => handleChange('marginNotes', e.currentTarget.checked)} />
                        {config.marginNotes && (
                            <>
                                <Checkbox label="Include MP" checked={config.includeMp} onChange={(e) => handleChange('includeMp', e.currentTarget.checked)} />
                                <NumberInput placeholder="Sep" value={config.marginSep} onChange={(v) => handleChange('marginSep', v)} w={80} size="xs" />
                                <NumberInput placeholder="Width" value={config.marginWidth} onChange={(v) => handleChange('marginWidth', v)} w={80} size="xs" />
                            </>
                        )}
                     </Group>
                   </Stack>
                 )}
              </Tabs.Panel>

              <Tabs.Panel value="packages" pt="md">
                <SimpleGrid cols={2} spacing="lg">
                    <Stack gap="xs">
                        <Text fw={700} size="sm">Mathematics</Text>
                        <Checkbox label="AMS Suite" checked={config.pkgAmsmath} onChange={(e) => handleChange('pkgAmsmath', e.currentTarget.checked)} />
                    </Stack>
                    <Stack gap="xs">
                        <Text fw={700} size="sm">Graphics</Text>
                        <Checkbox label="Graphicx" checked={config.pkgGraphicx} onChange={(e) => handleChange('pkgGraphicx', e.currentTarget.checked)} />
                        <Checkbox label="TikZ" checked={config.pkgTikz} onChange={(e) => handleChange('pkgTikz', e.currentTarget.checked)} />
                        <Checkbox label="Pgfplots" checked={config.pkgPgfplots} onChange={(e) => handleChange('pkgPgfplots', e.currentTarget.checked)} />
                    </Stack>
                    <Stack gap="xs">
                        <Text fw={700} size="sm">Formatting</Text>
                        <Checkbox label="Booktabs (Tables)" checked={config.pkgBooktabs} onChange={(e) => handleChange('pkgBooktabs', e.currentTarget.checked)} />
                        <Checkbox label="Float" checked={config.pkgFloat} onChange={(e) => handleChange('pkgFloat', e.currentTarget.checked)} />
                        <Checkbox label="Fancyhdr" checked={config.pkgFancyhdr} onChange={(e) => handleChange('pkgFancyhdr', e.currentTarget.checked)} />
                        <Checkbox label="Hyperref" checked={config.pkgHyperref} onChange={(e) => handleChange('pkgHyperref', e.currentTarget.checked)} />
                    </Stack>
                </SimpleGrid>
              </Tabs.Panel>

              {/* 4. COLORS TAB (ENHANCED) */}
              <Tabs.Panel value="colors" pt="md">
                <Checkbox label="Enable Xcolor Package" checked={config.pkgXcolor} onChange={(e) => handleChange('pkgXcolor', e.currentTarget.checked)} mb="md" />
                
                <Card withBorder p="sm" bg="dark.7" mb="md">
                    <Text size="sm" fw={700} mb="xs">Define New Color</Text>
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
                             {/* THE PICKER IS ALWAYS VISIBLE NOW */}
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
                                rightSection={<Tooltip label="Auto-calculated from picker. You can edit manually."><RefreshCw size={14}/></Tooltip>}
                            />
                            <Button onClick={addColor} leftSection={<Plus size={16}/>}>Add</Button>
                        </Group>
                    </Stack>
                </Card>

                <Stack gap="xs">
                    {customColors.map(c => (
                        <Group key={c.id} justify="space-between" bg="dark.6" p="xs" style={{ borderRadius: 4 }}>
                            <Group>
                                {/* PREVIEW ALWAYS USES THE STORED HEX */}
                                <Tooltip label={`Preview based on: ${c.previewHex}`}>
                                    <div style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: c.previewHex, border: '1px solid white' }} />
                                </Tooltip>
                                <Stack gap={0}>
                                    <Text size="sm" fw={500}>{c.name}</Text>
                                    <Group gap={6}>
                                        <Badge size="xs" variant="light" color="blue">{c.model}</Badge>
                                        <Text size="xs" c="dimmed" style={{fontFamily: 'monospace'}}>{c.value}</Text>
                                    </Group>
                                </Stack>
                            </Group>
                            <ActionIcon color="red" variant="subtle" onClick={() => setCustomColors(customColors.filter(x => x.id !== c.id))}>
                                <Trash size={16} />
                            </ActionIcon>
                        </Group>
                    ))}
                    {customColors.length === 0 && <Text size="sm" c="dimmed" ta="center">No custom colors defined</Text>}
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </Stack>
        </ScrollArea>
      </Grid.Col>

      {/* RIGHT COLUMN: Preview (Remains same) */}
      <Grid.Col span={5} bg="dark.8" h="100%" style={{ borderLeft: '1px solid var(--mantine-color-dark-6)', display: 'flex', flexDirection: 'column' }}>
        <Group p="xs" justify="center" bg="dark.7">
             <Button.Group>
                <Button 
                    size="xs" 
                    variant={previewMode === 'code' ? 'filled' : 'default'} 
                    leftSection={<CodeIcon size={14}/>}
                    onClick={() => setPreviewMode('code')}
                >
                    Code
                </Button>
                <Button 
                    size="xs" 
                    variant={previewMode === 'visual' ? 'filled' : 'default'} 
                    leftSection={<Eye size={14}/>}
                    onClick={() => setPreviewMode('visual')}
                >
                    Visual
                </Button>
             </Button.Group>
        </Group>

        <Box style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            {previewMode === 'code' ? (
                <ScrollArea h="100%">
                    <Code block style={{ whiteSpace: 'pre-wrap', backgroundColor: 'transparent', minHeight: '100%' }}>
                        {generatedCode}
                    </Code>
                </ScrollArea>
            ) : (
                <Box h="100%" bg="dark.9" style={{ display: 'flex', justifyContent: 'center', overflow: 'auto', padding: 20 }}>
                    {/* --- VISUALIZER --- */}
                    <div style={{
                        width: PAGE_WIDTH_PX,
                        height: PAGE_HEIGHT_PX,
                        backgroundColor: 'white',
                        position: 'relative',
                        boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                        transition: 'all 0.3s ease',
                        color: 'black',
                        fontSize: 10,
                        overflow: 'hidden'
                    }}>
                        {/* Header Area */}
                        {config.pkgGeometry && geometryStyles.headerHeightPx > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: config.marginLeft * CM_TO_PX,
                                right: config.marginRight * CM_TO_PX,
                                height: geometryStyles.headerHeightPx,
                                background: 'rgba(255, 165, 0, 0.2)',
                                borderBottom: '1px solid orange',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'orange'
                            }}>
                                HEADER
                            </div>
                        )}

                        {/* Body Content Area (Margins) */}
                        <div style={{
                            position: 'absolute',
                            top: geometryStyles.bodyTopPx,
                            bottom: PAGE_HEIGHT_PX - geometryStyles.bodyBottomPx,
                            left: config.pkgGeometry ? config.marginLeft * CM_TO_PX : 20,
                            right: config.pkgGeometry ? config.marginRight * CM_TO_PX : 20,
                            border: '1px dashed #339af0',
                            background: 'rgba(51, 154, 240, 0.1)',
                            display: 'flex',
                            gap: config.columns === 'two' ? config.columnSep * CM_TO_PX : 0
                        }}>
                             {config.columns === 'two' ? (
                                <>
                                    <div style={{ flex: 1, border: '1px dotted #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Col 1</div>
                                    <div style={{ flex: 1, border: '1px dotted #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Col 2</div>
                                </>
                             ) : (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Body Text</div>
                             )}
                        </div>

                        {/* Margin Notes */}
                        {config.pkgGeometry && config.marginNotes && (
                            <div style={{
                                position: 'absolute',
                                top: geometryStyles.bodyTopPx,
                                bottom: PAGE_HEIGHT_PX - geometryStyles.bodyBottomPx,
                                left: geometryStyles.marginNotesStartPx,
                                width: geometryStyles.marginNotesWidthCapPx,
                                background: 'rgba(40, 167, 69, 0.2)',
                                border: '1px solid green',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                writingMode: 'vertical-rl',
                                color: 'green'
                            }}>
                                Notes
                            </div>
                        )}

                        {/* Footer Area */}
                        {config.pkgGeometry && config.footSkip > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: geometryStyles.bodyBottomPx,
                                left: config.marginLeft * CM_TO_PX,
                                right: config.marginRight * CM_TO_PX,
                                paddingTop: config.footSkip * CM_TO_PX,
                                borderTop: '1px solid blue',
                                display: 'flex', justifyContent: 'center'
                            }}>
                                <span style={{ background: 'rgba(0,0,255,0.1)', padding: '2px 8px' }}>Footer</span>
                            </div>
                        )}
                    </div>
                </Box>
            )}
        </Box>

        <Box p="md" bg="dark.7" style={{ borderTop: '1px solid var(--mantine-color-dark-6)' }}>
             <Button fullWidth leftSection={<Check size={16}/>} onClick={() => onInsert(generatedCode)}>
                Create Document
             </Button>
        </Box>
      </Grid.Col>
    </Grid>
  );
};
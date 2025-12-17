import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Stack, Text, Group, Tabs, TextInput, NumberInput, 
  ColorInput, Slider, Button, ScrollArea,
  Select, Box, Divider, Switch, ActionIcon, Grid, Badge, Textarea, Menu, Popover, ColorPicker, Paper
} from '@mantine/core';
import { 
  Square, TrendingUp, Plus, Type, Layers, Trash2, LayoutTemplate, 
  Pencil, MousePointer2, Repeat, ArrowRight, Palette, ChevronDown, GripHorizontal, GripVertical
} from 'lucide-react';
import { TIKZ_TEMPLATES } from './tikzTemplates';

interface TikzWizardProps {
  onInsert: (code: string) => void;
}

type Mode = 'shapes' | 'plots' | 'text' | 'templates';
type ShapeType = 'circle' | 'rectangle' | 'line' | 'grid';
type LineStyle = 'solid' | 'dashed' | 'dotted';
type ArrowType = 'none' | '->' | '<-' | '<->';

interface SceneElement {
  id: string;
  type: Mode;
  params: any;
  style: {
    color: string;
    fill: string;
    lineWidth: number;
    opacity: number;
    lineStyle: LineStyle;
    arrowHead: ArrowType;
  };
}

export function TikzWizard({ onInsert }: TikzWizardProps) {
  const [activeTab, setActiveTab] = useState<string>('shapes');
  const [elements, setElements] = useState<SceneElement[]>([]);
  const [codeValue, setCodeValue] = useState('');
  
  // --- Resizing State ---
  const [topSectionHeight, setTopSectionHeight] = useState(250); 
  const [isResizingVert, setIsResizingVert] = useState(false);
  const [leftColWidth, setLeftColWidth] = useState(40); 
  const [isResizingHoriz, setIsResizingHoriz] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  // Quick Color Picker State
  const [quickColor, setQuickColor] = useState('#339af0');

  // Ref για να ξέρουμε αν η αλλαγή προήλθε από πληκτρολόγηση
  const shouldSkipUpdate = useRef(false);

  // --- Global Styling State ---
  const [color, setColor] = useState('#339af0');
  const [lineWidth, setLineWidth] = useState(0.8);
  const [fill, setFill] = useState('');
  const [opacity, setOpacity] = useState(100);
  const [lineStyle, setLineStyle] = useState<LineStyle>('solid');
  const [arrowHead, setArrowHead] = useState<ArrowType>('none');

  // --- Shapes State ---
  const [shapeType, setShapeType] = useState<ShapeType>('circle');
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [radius, setRadius] = useState(2);
  const [width, setWidth] = useState(3);
  const [height, setHeight] = useState(2);
  const [x2, setX2] = useState(2);
  const [y2, setY2] = useState(2);

  // --- Plots State ---
  const [functionStr, setFunctionStr] = useState('sin(x)');
  const [xMin, setXMin] = useState(-5);
  const [xMax, setXMax] = useState(5);
  const [samples, setSamples] = useState(100);
  const [showAxis, setShowAxis] = useState(true);

  // --- Text (Node) State ---
  const [textContent, setTextContent] = useState('Label');

  const toSvgX = (val: number) => 150 + (val * 20);
  const toSvgY = (val: number) => 150 - (val * 20); 

  // --- Resize Logics ---
  const startResizingVert = useCallback((e: React.MouseEvent) => { e.preventDefault(); setIsResizingVert(true); }, []);
  const startResizingHoriz = useCallback((e: React.MouseEvent) => { e.preventDefault(); setIsResizingHoriz(true); }, []);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (isResizingVert && rightColRef.current) {
        const rect = rightColRef.current.getBoundingClientRect();
        setTopSectionHeight(Math.max(100, Math.min(e.clientY - rect.top, rect.height - 150)));
      }
      if (isResizingHoriz && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setLeftColWidth(Math.max(20, Math.min(((e.clientX - rect.left) / rect.width) * 100, 80)));
      }
    };
    const up = () => { setIsResizingVert(false); setIsResizingHoriz(false); };
    if (isResizingVert || isResizingHoriz) {
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
      document.body.style.cursor = isResizingVert ? 'row-resize' : 'col-resize';
    } else {
      document.body.style.cursor = 'default';
    }
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [isResizingVert, isResizingHoriz]);

  // --- Snippet Injection ---
  const insertSnippet = (snippet: string) => {
    shouldSkipUpdate.current = true;
    setCodeValue(prev => {
        const endIdx = prev.lastIndexOf('\\end{tikzpicture}');
        if (endIdx !== -1) return prev.slice(0, endIdx) + '  ' + snippet + '\n' + prev.slice(endIdx);
        return prev + '\n' + snippet;
    });
    // Trigger parser manually after snippet insertion to update elements
    setTimeout(() => parseCode(codeValue + '\n' + snippet), 0);
  };

  // --- Generator: Element -> TikZ String ---
  const generateCommand = (el: SceneElement | null): string => {
    const type = el ? el.type : (activeTab as Mode);
    // @ts-ignore
    const p = el ? el.params : { x, y, radius, width, height, x2, y2, functionStr, xMin, xMax, samples, showAxis, textContent, shapeType };
    const s = el ? el.style : { color, fill, lineWidth, opacity, lineStyle, arrowHead };

    const styleOptions = [];
    if (s.color && s.color !== '#000000') styleOptions.push(`draw=${s.color.replace('#', '')}`);
    if (s.fill) styleOptions.push(`fill=${s.fill.replace('#', '')}`);
    if (s.lineWidth !== 0.8) styleOptions.push(`line width=${s.lineWidth}mm`);
    if (s.opacity !== 100) styleOptions.push(`opacity=${s.opacity/100}`);
    if (s.lineStyle !== 'solid') styleOptions.push(s.lineStyle);
    if (s.arrowHead !== 'none') styleOptions.unshift(s.arrowHead);
    if (type === 'text' && s.color !== '#000000') styleOptions.push(`text=${s.color.replace('#', '')}`);

    const styleStr = styleOptions.length > 0 ? `[${styleOptions.join(', ')}]` : '';

    if (type === 'shapes') {
        const st = p.shapeType;
        if (st === 'circle') return `\\draw${styleStr} (${p.x},${p.y}) circle (${p.radius}cm);`;
        if (st === 'rectangle') return `\\draw${styleStr} (${p.x},${p.y}) rectangle ++(${p.width},${p.height});`;
        if (st === 'line') return `\\draw${styleStr} (${p.x},${p.y}) -- (${p.x2},${p.y2});`;
        if (st === 'grid') return `\\draw[step=1cm,gray,very thin] (${p.x},${p.y}) grid (${p.x2},${p.y2});`;
    } 
    else if (type === 'text') {
        return `\\node${styleStr} at (${p.x},${p.y}) {${p.textContent}};`;
    } 
    else if (type === 'plots') {
        return `\\addplot${styleStr} {${p.functionStr}};`;
    }
    return '';
  };

  // --- Code Assembly (Elements -> Text) ---
  useEffect(() => {
    // Αν η αλλαγή προήλθε από πληκτρολόγηση, δεν ξαναγράφουμε τον κώδικα
    // για να μην χάσουμε τον κέρσορα ή το formatting του χρήστη.
    if (shouldSkipUpdate.current) {
        shouldSkipUpdate.current = false;
        return;
    }
    if (activeTab === 'templates') return;

    const plotElements = elements.filter(e => e.type === 'plots');
    const otherElements = elements.filter(e => e.type !== 'plots');

    let code = '\\begin{tikzpicture}\n';
    
    otherElements.forEach(el => {
        code += `  ${generateCommand(el)}\n`;
    });

    if (plotElements.length > 0) {
        const p = plotElements[0].params; 
        code += `  \\begin{axis}[\n    axis lines = ${p.showAxis ? 'middle' : 'none'},\n    xlabel = $x$, ylabel = $y$,\n    domain=${p.xMin}:${p.xMax},\n    samples=${p.samples}\n  ]\n`;
        plotElements.forEach(el => {
            code += `    ${generateCommand(el)}\n`;
        });
        code += `  \\end{axis}\n`;
    }

    if (elements.length === 0 && !codeValue.includes('tikzpicture')) {
       code += '\\end{tikzpicture}';
    } else if (elements.length === 0 && codeValue.includes('tikzpicture')) {
        return; // Don't overwrite if empty elements but user has code
    } else {
        code += '\\end{tikzpicture}';
    }
    
    setCodeValue(code);
  }, [elements, activeTab]); 

  // --- PARSER (Text -> Elements) ---
  const parseCode = useCallback((code: string) => {
    const newElements: SceneElement[] = [];
    const lines = code.split('\n');

    lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('%')) return;

        // Helper: Extract styles
        const getStyle = (styleStr: string | undefined) => {
            const style = { color: '#000000', fill: '', lineWidth: 0.8, opacity: 100, lineStyle: 'solid' as LineStyle, arrowHead: 'none' as ArrowType };
            if (!styleStr) return style;
            
            if (styleStr.includes('->')) style.arrowHead = '->';
            else if (styleStr.includes('<-')) style.arrowHead = '<-';
            else if (styleStr.includes('<->')) style.arrowHead = '<->';
            
            if (styleStr.includes('dashed')) style.lineStyle = 'dashed';
            else if (styleStr.includes('dotted')) style.lineStyle = 'dotted';

            const drawMatch = styleStr.match(/draw=([0-9a-fA-F]+)/);
            if (drawMatch) style.color = '#' + drawMatch[1];
            
            const fillMatch = styleStr.match(/fill=([0-9a-fA-F]+)/);
            if (fillMatch) style.fill = '#' + fillMatch[1];

            const lwMatch = styleStr.match(/line width=([\d.]+)mm/);
            if (lwMatch) style.lineWidth = parseFloat(lwMatch[1]);

            const opMatch = styleStr.match(/opacity=([\d.]+)/);
            if (opMatch) style.opacity = parseFloat(opMatch[1]) * 100;

            return style;
        };

        // 1. Circle: \draw[...] (x,y) circle (r cm);
        const circleMatch = trimmed.match(/\\draw(?:\[(.*?)\])?\s*\(([\d.-]+),([\d.-]+)\)\s*circle\s*\(([\d.-]+)cm\);/);
        if (circleMatch) {
            newElements.push({
                id: Math.random().toString(36).substr(2, 9), type: 'shapes',
                style: getStyle(circleMatch[1]),
                params: { shapeType: 'circle', x: parseFloat(circleMatch[2]), y: parseFloat(circleMatch[3]), radius: parseFloat(circleMatch[4]) }
            });
            return;
        }

        // 2. Rectangle: \draw[...] (x,y) rectangle ++(w,h);
        const rectMatch = trimmed.match(/\\draw(?:\[(.*?)\])?\s*\(([\d.-]+),([\d.-]+)\)\s*rectangle\s*\+\+\(([\d.-]+),([\d.-]+)\);/);
        if (rectMatch) {
            newElements.push({
                id: Math.random().toString(36).substr(2, 9), type: 'shapes',
                style: getStyle(rectMatch[1]),
                params: { shapeType: 'rectangle', x: parseFloat(rectMatch[2]), y: parseFloat(rectMatch[3]), width: parseFloat(rectMatch[4]), height: parseFloat(rectMatch[5]) }
            });
            return;
        }

        // 3. Line: \draw[...] (x,y) -- (x2,y2);
        const lineMatch = trimmed.match(/\\draw(?:\[(.*?)\])?\s*\(([\d.-]+),([\d.-]+)\)\s*--\s*\(([\d.-]+),([\d.-]+)\);/);
        if (lineMatch) {
            newElements.push({
                id: Math.random().toString(36).substr(2, 9), type: 'shapes',
                style: getStyle(lineMatch[1]),
                params: { shapeType: 'line', x: parseFloat(lineMatch[2]), y: parseFloat(lineMatch[3]), x2: parseFloat(lineMatch[4]), y2: parseFloat(lineMatch[5]) }
            });
            return;
        }

        // 4. Node: \node[...] at (x,y) {text};
        const nodeMatch = trimmed.match(/\\node(?:\[(.*?)\])?\s*at\s*\(([\d.-]+),([\d.-]+)\)\s*\{(.*?)\};/);
        if (nodeMatch) {
            const s = getStyle(nodeMatch[1]);
            const textCol = nodeMatch[1]?.match(/text=([0-9a-fA-F]+)/);
            if (textCol) s.color = '#' + textCol[1];
            newElements.push({
                id: Math.random().toString(36).substr(2, 9), type: 'text',
                style: s,
                params: { x: parseFloat(nodeMatch[2]), y: parseFloat(nodeMatch[3]), textContent: nodeMatch[4] }
            });
            return;
        }

        // 5. Plot: \addplot[...] {func};
        const plotMatch = trimmed.match(/\\addplot(?:\[(.*?)\])?\s*\{(.*?)\};/);
        if (plotMatch) {
            newElements.push({
                id: Math.random().toString(36).substr(2, 9), type: 'plots',
                style: getStyle(plotMatch[1]),
                params: { functionStr: plotMatch[2], xMin: -5, xMax: 5, samples: 100, showAxis: true }
            });
            return;
        }
    });

    if (newElements.length > 0) {
        setElements(newElements);
    }
  }, []);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.currentTarget.value;
    shouldSkipUpdate.current = true; // Lock code generation
    setCodeValue(val);
    parseCode(val); // Try to reverse engineer elements
  };

  const handleAddElement = () => {
    const newEl: SceneElement = {
        id: Date.now().toString(),
        type: activeTab as Mode,
        params: { x, y, radius, width, height, x2, y2, functionStr, xMin, xMax, samples, showAxis, textContent, shapeType },
        style: { color, fill, lineWidth, opacity, lineStyle, arrowHead }
    };
    // Adding element resets the skip update flag implicitly because the button click isn't a text edit
    shouldSkipUpdate.current = false; 
    setElements([...elements, newEl]);
  };

  const handleRemoveElement = (id: string) => {
    shouldSkipUpdate.current = false;
    setElements(elements.filter(e => e.id !== id));
  };

  const renderSvgElement = (el: SceneElement | null, isDraft: boolean) => {
    const type = el ? el.type : (activeTab as Mode);
    // @ts-ignore
    const p = el ? el.params : { x, y, radius, width, height, x2, y2, functionStr, xMin, xMax, textContent, shapeType };
    const s = el ? el.style : { color, fill, lineWidth, opacity, lineStyle, arrowHead };

    const stroke = s.color;
    const fillVal = s.fill || 'none';
    const op = isDraft ? 0.5 : (s.opacity / 100);
    const sw = s.lineWidth * 2;
    let dashArray = 'none';
    if (s.lineStyle === 'dashed') dashArray = '10, 5';
    if (s.lineStyle === 'dotted') dashArray = '2, 4';

    if (type === 'shapes') {
        const st = p.shapeType;
        if (st === 'circle') return <circle cx={toSvgX(p.x)} cy={toSvgY(p.y)} r={p.radius * 20} stroke={stroke} strokeWidth={sw} fill={fillVal} opacity={op} strokeDasharray={dashArray} />;
        if (st === 'rectangle') return <rect x={toSvgX(p.x)} y={toSvgY(p.y + p.height)} width={p.width * 20} height={p.height * 20} stroke={stroke} strokeWidth={sw} fill={fillVal} opacity={op} strokeDasharray={dashArray} />;
        if (st === 'line') return <line x1={toSvgX(p.x)} y1={toSvgY(p.y)} x2={toSvgX(p.x2)} y2={toSvgY(p.y2)} stroke={stroke} strokeWidth={sw} opacity={op} strokeDasharray={dashArray} />;
        if (st === 'grid') return <path d={`M ${toSvgX(p.x)} ${toSvgY(p.y)} H ${toSvgX(p.x2)} V ${toSvgY(p.y2)} H ${toSvgX(p.x)} Z`} stroke="gray" fill="none" strokeDasharray="2,2" />;
    } else if (type === 'text') {
        return <text x={toSvgX(p.x)} y={toSvgY(p.y)} fill={s.color} fontSize={16} textAnchor="middle" alignmentBaseline="middle" opacity={op}>{p.textContent}</text>;
    } else if (type === 'plots') {
        try {
            const points = [];
            const min = p.xMin ?? -5;
            const max = p.xMax ?? 5;
            const step = (max - min) / 40; 
            for (let i = min; i <= max; i += step) {
                const jsFunc = p.functionStr.replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos').replace(/\^/g, '**').replace(/exp/g, 'Math.exp'); 
                // eslint-disable-next-line no-new-func
                const f = new Function('x', `return ${jsFunc}`);
                const val = f(i);
                if (!isNaN(val) && Math.abs(val) < 15) points.push(`${toSvgX(i)},${toSvgY(val)}`);
            }
            return <polyline points={points.join(' ')} fill="none" stroke={stroke} strokeWidth={sw} opacity={op} strokeDasharray={dashArray} />;
        } catch { return null; }
    }
    return null;
  };

  return (
    <div ref={containerRef} style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden' }}>
      
      {/* --- COLUMN 1: CONTROLS --- */}
      <Box style={{ width: `${leftColWidth}%`, borderRight: '1px solid var(--mantine-color-dark-4)', display: 'flex', flexDirection: 'column', height: '100%', minWidth: 200 }}>
        <Tabs value={activeTab} onChange={(v) => v && setActiveTab(v)} variant="pills" radius="sm" p="xs">
            <Tabs.List grow>
                <Tabs.Tab value="shapes" leftSection={<Square size={14} />}>Shapes</Tabs.Tab>
                <Tabs.Tab value="text" leftSection={<Type size={14} />}>Text</Tabs.Tab>
                <Tabs.Tab value="plots" leftSection={<TrendingUp size={14} />}>Plots</Tabs.Tab>
                <Tabs.Tab value="templates" leftSection={<LayoutTemplate size={14} />}>Templates</Tabs.Tab>
            </Tabs.List>
        </Tabs>

        <ScrollArea style={{ flex: 1 }} type="auto" offsetScrollbars>
            {activeTab === 'templates' ? (
                 <Stack gap="xs" p="xs">
                    {TIKZ_TEMPLATES.map((tmpl, idx) => (
                        <Paper key={idx} p="xs" withBorder bg="dark.7" style={{ cursor: 'pointer', transition: '0.2s' }} onClick={() => { shouldSkipUpdate.current = true; setCodeValue(tmpl.code); }}>
                            <Group justify="space-between" mb={4}>
                                <Text size="sm" fw={700}>{tmpl.label}</Text>
                                <ArrowRight size={14} color="gray"/>
                            </Group>
                            <Text size="xs" c="dimmed" lineClamp={2}>{tmpl.description}</Text>
                        </Paper>
                    ))}
                 </Stack>
            ) : (
                <Stack gap="xs" p="xs">
                    <Divider label="Styling" labelPosition="center" color="dark.4" />
                    <Group grow>
                        <ColorInput label="Color" value={color} onChange={setColor} size="xs" />
                        <Select label="Style" value={lineStyle} onChange={(v) => setLineStyle(v as LineStyle)} data={['solid', 'dashed', 'dotted']} size="xs" />
                    </Group>
                    <Group grow>
                        <NumberInput label="Width (mm)" value={lineWidth} onChange={(v) => setLineWidth(Number(v))} step={0.1} min={0} size="xs" />
                        <Select label="Arrow" value={arrowHead} onChange={(v) => setArrowHead(v as ArrowType)} data={['none', '->', '<-', '<->']} size="xs" />
                    </Group>
                    <Stack gap={0}>
                        <Text size="xs" fw={500}>Opacity</Text>
                        <Slider value={opacity} onChange={setOpacity} size="sm" />
                    </Stack>
                    {activeTab === 'shapes' && <ColorInput label="Fill" value={fill} onChange={setFill} size="xs" placeholder="None" />}

                    <Divider label="Parameters" labelPosition="center" color="dark.4" />

                    {activeTab === 'shapes' && (
                        <>
                        <Select label="Type" value={shapeType} onChange={(v) => setShapeType(v as ShapeType)} data={['circle', 'rectangle', 'line', 'grid']} size="xs" />
                        <Group grow>
                            <NumberInput label="X" value={x} onChange={(v) => setX(Number(v))} size="xs" />
                            <NumberInput label="Y" value={y} onChange={(v) => setY(Number(v))} size="xs" />
                        </Group>
                        {shapeType === 'circle' && <NumberInput label="Radius" value={radius} onChange={(v) => setRadius(Number(v))} size="xs" />}
                        {shapeType === 'rectangle' && <Group grow><NumberInput label="W" value={width} onChange={(v) => setWidth(Number(v))} size="xs" /><NumberInput label="H" value={height} onChange={(v) => setHeight(Number(v))} size="xs" /></Group>}
                        {(shapeType === 'line' || shapeType === 'grid') && <Group grow><NumberInput label="End X" value={x2} onChange={(v) => setX2(Number(v))} size="xs" /><NumberInput label="End Y" value={y2} onChange={(v) => setY2(Number(v))} size="xs" /></Group>}
                        </>
                    )}
                    
                    {activeTab === 'text' && (
                        <>
                        <TextInput label="Label" value={textContent} onChange={(e) => setTextContent(e.currentTarget.value)} size="xs" />
                        <Group grow>
                            <NumberInput label="X" value={x} onChange={(v) => setX(Number(v))} size="xs" />
                            <NumberInput label="Y" value={y} onChange={(v) => setY(Number(v))} size="xs" />
                        </Group>
                        </>
                    )}

                    {activeTab === 'plots' && (
                        <>
                        <TextInput label="f(x)" value={functionStr} onChange={(e) => setFunctionStr(e.currentTarget.value)} size="xs" />
                        <Group grow>
                            <NumberInput label="Min" value={xMin} onChange={(v) => setXMin(Number(v))} size="xs" />
                            <NumberInput label="Max" value={xMax} onChange={(v) => setXMax(Number(v))} size="xs" />
                        </Group>
                        </>
                    )}
                </Stack>
            )}
        </ScrollArea>

        {activeTab !== 'templates' && (
            <Box p="xs" style={{ borderTop: '1px solid var(--mantine-color-dark-4)' }}>
                <Button fullWidth leftSection={<Plus size={16} />} onClick={handleAddElement} color="teal" variant="light">
                    Add to Scene
                </Button>
            </Box>
        )}
      </Box>

      {/* --- HORIZONTAL RESIZER --- */}
      <Box 
        onMouseDown={startResizingHoriz}
        style={{ 
            width: 6, 
            backgroundColor: isResizingHoriz ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-dark-7)', 
            cursor: 'col-resize', 
            flexShrink: 0,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
        }}
      >
        <GripVertical size={12} color="gray" style={{ opacity: 0.5 }} />
      </Box>

      {/* --- COLUMN 2: PREVIEW & CODE --- */}
      <Box 
        ref={rightColRef}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--mantine-color-dark-8)', minWidth: 200 }}
      >
        <Box h={topSectionHeight} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box style={{ flex: 1, position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
                <Box style={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}><Badge color="gray" variant="light">Live Preview</Badge></Box>
                <svg width="100%" height="100%" viewBox="0 0 300 300">
                    <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#333" strokeWidth="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    <line x1="0" y1="150" x2="300" y2="150" stroke="#555" strokeWidth="1" />
                    <line x1="150" y1="0" x2="150" y2="300" stroke="#555" strokeWidth="1" />
                    {elements.map(el => (<g key={el.id}>{renderSvgElement(el, false)}</g>))}
                    {activeTab !== 'templates' && renderSvgElement(null, true)}
                </svg>
            </Box>
            {activeTab !== 'templates' && elements.length > 0 && (
                <Box h={80} style={{ flexShrink: 0, borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
                    <Group justify="space-between" px="xs" py={2} bg="dark.9" h={24}>
                        <Text size="xs" fw={700}>Added Elements</Text>
                        <Layers size={12}/>
                    </Group>
                    <ScrollArea h={56}>
                        <Stack gap={2} p={2}>
                            {elements.map((el, i) => (
                                <Group key={el.id} justify="space-between" bg="dark.7" px="xs" py={2} style={{borderRadius: 4}}>
                                    <Text size="xs">{i+1}. {el.type} {el.type==='shapes'?`(${el.params.shapeType})`:''}</Text>
                                    <ActionIcon size="xs" color="red" variant="subtle" onClick={() => handleRemoveElement(el.id)}><Trash2 size={10}/></ActionIcon>
                                </Group>
                            ))}
                        </Stack>
                    </ScrollArea>
                </Box>
            )}
        </Box>

        <Box 
            onMouseDown={startResizingVert}
            style={{ 
                height: 6, 
                backgroundColor: isResizingVert ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-dark-6)', 
                cursor: 'row-resize', 
                flexShrink: 0,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
            }}
        >
            <GripHorizontal size={12} color="gray" style={{ opacity: 0.5 }} />
        </Box>

        <Box className="tikz-code-editor" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Group gap={4} p={4} bg="dark.7" style={{ borderBottom: '1px solid var(--mantine-color-dark-6)', flexShrink: 0 }}>
                <Menu shadow="md" width={200}>
                    <Menu.Target><Button size="compact-xs" variant="default" rightSection={<ChevronDown size={10} />}>Commands</Button></Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Label>Drawing</Menu.Label>
                        <Menu.Item leftSection={<Pencil size={14}/>} onClick={() => insertSnippet('\\draw (0,0) -- (1,1);')}>Line</Menu.Item>
                        <Menu.Item leftSection={<Square size={14}/>} onClick={() => insertSnippet('\\draw (0,0) rectangle (2,2);')}>Rectangle</Menu.Item>
                        <Menu.Item leftSection={<Type size={14}/>} onClick={() => insertSnippet('\\node at (0,0) {Label};')}>Node</Menu.Item>
                        <Menu.Divider />
                        <Menu.Label>Structure</Menu.Label>
                        <Menu.Item leftSection={<MousePointer2 size={14}/>} onClick={() => insertSnippet('\\coordinate (A) at (0,0);')}>Coordinate</Menu.Item>
                        <Menu.Item leftSection={<Repeat size={14}/>} onClick={() => insertSnippet('\\foreach \\i in {1,...,5} {\n  \n}')}>Foreach Loop</Menu.Item>
                    </Menu.Dropdown>
                </Menu>
                <Menu shadow="md" width={200}>
                    <Menu.Target><Button size="compact-xs" variant="default" rightSection={<ChevronDown size={10} />}>Styles</Button></Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Label>Lines</Menu.Label>
                        <Menu.Item onClick={() => insertSnippet('thick')}>Thick</Menu.Item>
                        <Menu.Item onClick={() => insertSnippet('thin')}>Thin</Menu.Item>
                        <Menu.Item onClick={() => insertSnippet('dashed')}>Dashed</Menu.Item>
                        <Menu.Divider />
                        <Menu.Label>Arrows</Menu.Label>
                        <Menu.Item onClick={() => insertSnippet('->')}>Arrow {'->'}</Menu.Item>
                        <Menu.Item onClick={() => insertSnippet('<->')}>Arrow {'<->'}</Menu.Item>
                    </Menu.Dropdown>
                </Menu>
                <Divider orientation="vertical" />
                <Popover position="bottom" withArrow shadow="md">
                    <Popover.Target><ActionIcon size="sm" variant="default" aria-label="Color"><Palette size={14} color={quickColor} /></ActionIcon></Popover.Target>
                    <Popover.Dropdown>
                        <Stack gap="xs">
                            <Text size="xs" fw={700}>Select Color</Text>
                            <ColorPicker size="xs" value={quickColor} onChange={setQuickColor} format="hex" />
                            <Button size="xs" fullWidth onClick={() => insertSnippet(quickColor.replace('#', ''))}>Insert Hex</Button>
                        </Stack>
                    </Popover.Dropdown>
                </Popover>
            </Group>

            <Textarea 
                className="tikz-code-editor"
                value={codeValue}
                onChange={handleCodeChange}
                style={{ flex: 1 }} 
                styles={{ 
                    root: { display: 'flex', flexDirection: 'column', flex: 1 }, 
                    wrapper: { display: 'flex', flexDirection: 'column', flex: 1 }, 
                    input: { 
                        fontFamily: 'monospace', 
                        fontSize: 12, 
                        backgroundColor: 'var(--mantine-color-dark-9)',
                        color: '#d4d4d4',
                        border: 0,
                        borderRadius: 0,
                        height: '100%'
                    } 
                }}
                placeholder="\begin{tikzpicture}..."
            />
            
            <Group justify="space-between" p="xs" bg="dark.7" style={{ borderTop: '1px solid var(--mantine-color-dark-6)', flexShrink: 0 }}>
                <Text size="xs" c="dimmed">Characters: {codeValue.length}</Text>
                <Button size="compact-xs" leftSection={<Plus size={12} />} onClick={() => onInsert(codeValue)}>
                    Insert Code
                </Button>
            </Group>
        </Box>
      </Box>
    </div>
  );
}
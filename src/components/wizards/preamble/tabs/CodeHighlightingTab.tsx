import React, { useMemo } from 'react';
import { 
  Stack, Select, Divider, MultiSelect, Group, Switch, 
  ColorInput, Alert 
} from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { LANGUAGES_DB, MINTED_STYLES } from '../LanguageDb';

export interface CodeHighlightConfig {
  engine: 'none' | 'listings' | 'minted';
  langs: string[];
  showNumbers: boolean;
  showFrame: boolean;
  breakLines: boolean;
  mintedStyle: string;
  lstColors: {
    keyword: string;
    string: string;
    comment: string;
    background: string;
  };
}

interface CodeHighlightingTabProps {
  config: CodeHighlightConfig;
  onChange: (key: keyof CodeHighlightConfig, val: any) => void;
  onColorChange: (key: keyof CodeHighlightConfig['lstColors'], val: string) => void;
}

export const CodeHighlightingTab: React.FC<CodeHighlightingTabProps> = ({ 
  config, 
  onChange,
  onColorChange
}) => {
  
  // Filter languages based on selected engine
  const availableLanguages = useMemo(() => {
    if (config.engine === 'none') return [];
    if (config.engine === 'listings') return LANGUAGES_DB.filter(l => l.listings !== null);
    if (config.engine === 'minted') return LANGUAGES_DB; 
    return [];
  }, [config.engine]);

  return (
    <Stack gap="sm">
      <Select 
        label="Highlighting Engine" 
        description="Choose 'minted' for best results (requires python/pygments) or 'listings' for standard latex."
        value={config.engine} 
        onChange={(v) => {
            onChange('engine', v);
            // Reset languages when engine changes to avoid incompatible selections
            onChange('langs', []); 
        }} 
        data={[
            { value: 'none', label: 'None' },
            { value: 'listings', label: 'Listings (Native LaTeX)' },
            { value: 'minted', label: 'Minted (Requires Python)' }
        ]} 
      />

      {config.engine !== 'none' && (
        <>
          <Divider label="Settings" labelPosition="left" />
          
          <MultiSelect 
            label="Target Languages" 
            placeholder="Select languages to use"
            data={availableLanguages}
            value={config.langs}
            onChange={(v) => onChange('langs', v)}
            searchable
            nothingFoundMessage="Language not supported by selected engine"
          />
          
          <Group grow>
            <Switch 
              label="Line Numbers" 
              checked={config.showNumbers} 
              onChange={(e) => onChange('showNumbers', e.currentTarget.checked)} 
            />
            <Switch 
              label="Frame/Border" 
              checked={config.showFrame} 
              onChange={(e) => onChange('showFrame', e.currentTarget.checked)} 
            />
            <Switch 
              label="Break Lines" 
              checked={config.breakLines} 
              onChange={(e) => onChange('breakLines', e.currentTarget.checked)} 
            />
          </Group>

          {config.engine === 'listings' && (
            <>
              <Divider label="Colors (VSCode Style)" labelPosition="left" />
              <Group grow>
                <ColorInput 
                  label="Keywords" 
                  value={config.lstColors.keyword} 
                  onChange={(v) => onColorChange('keyword', v)} 
                />
                <ColorInput 
                  label="Strings" 
                  value={config.lstColors.string} 
                  onChange={(v) => onColorChange('string', v)} 
                />
              </Group>
              <Group grow>
                <ColorInput 
                  label="Comments" 
                  value={config.lstColors.comment} 
                  onChange={(v) => onColorChange('comment', v)} 
                />
                <ColorInput 
                  label="Background" 
                  value={config.lstColors.background} 
                  onChange={(v) => onColorChange('background', v)} 
                />
              </Group>
            </>
          )}

          {config.engine === 'minted' && (
            <>
              <Divider label="Theme" labelPosition="left" />
              <Alert variant="light" color="orange" title="Requirement" icon={<FontAwesomeIcon icon={faExclamationCircle} style={{ width: 16, height: 16 }} />} fz="xs">
                Minted requires compiling with <b>-shell-escape</b> flag.
              </Alert>
              <Select 
                label="Style" 
                value={config.mintedStyle} 
                onChange={(v) => onChange('mintedStyle', v || 'friendly')} 
                data={MINTED_STYLES}
                searchable
              />
            </>
          )}
        </>
      )}
    </Stack>
  );
};
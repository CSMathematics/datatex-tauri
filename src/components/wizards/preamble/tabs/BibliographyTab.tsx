import React from 'react';
import { Stack, Select, TextInput, Text, Divider } from '@mantine/core';
import { BIB_BACKENDS, BIB_STYLES_BIBTEX, BIB_STYLES_BIBLATEX } from '../LanguageDb';
import { PreambleConfig } from '../generators/preambleGenerators';

interface BibliographyTabProps {
  config: PreambleConfig;
  onChange: (key: string, val: any) => void;
}

export const BibliographyTab: React.FC<BibliographyTabProps> = ({ config, onChange }) => {

  const currentStyles = config.bibBackend === 'biber' ? BIB_STYLES_BIBLATEX : BIB_STYLES_BIBTEX;

  return (
    <Stack gap="md">
      <Text size="sm">Configure how citations and references are handled.</Text>

      <Select
        label="Backend System"
        description="Select 'Biber' (Modern) or 'BibTeX' (Classic)."
        data={BIB_BACKENDS}
        value={config.bibBackend}
        onChange={(v) => onChange('bibBackend', v)}
      />

      {config.bibBackend !== 'none' && (
        <>
          <Divider />

          <Select
            label="Citation Style"
            data={currentStyles}
            value={config.bibStyle}
            onChange={(v) => onChange('bibStyle', v)}
            searchable
          />

          <TextInput
            label="Bibliography File (.bib)"
            placeholder="references.bib"
            value={config.bibFile}
            onChange={(e) => onChange('bibFile', e.currentTarget.value)}
          />

          {config.bibBackend === 'bibtex' && (
             <Text c="dimmed" size="xs">
                Note: When using BibTeX, we will include <b>natbib</b> package for better citation management.
             </Text>
          )}

          {config.bibBackend === 'biber' && (
             <Text c="dimmed" size="xs">
                Note: Biber uses the <b>biblatex</b> package. Ensure your compiler is set to run 'biber'.
             </Text>
          )}
        </>
      )}
    </Stack>
  );
};
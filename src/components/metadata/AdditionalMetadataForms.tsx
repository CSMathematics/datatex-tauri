// Additional Typed Metadata Forms
import React, { useState } from "react";
import {
  Stack,
  Select,
  TextInput,
  Textarea,
  Checkbox,
  MultiSelect,
  NumberInput,
  Button,
  Group,
  ActionIcon,
  Tabs,
  Grid,
  Text,
} from "@mantine/core";
import { useTypedMetadataStore } from "../../stores/typedMetadataStore";
import type {
  DocumentMetadata,
  BibliographyMetadata,
  TableMetadata,
  FigureMetadata,
  CommandMetadata,
  PackageMetadata,
  PreambleMetadata,
  ClassMetadata,
} from "../../types/typedMetadata";
import { CreatableSelect, CreatableMultiSelect } from "./TypedMetadataForms";
import { HierarchyEditor } from "./HierarchyEditor";
import { ManageableSelect } from "./ManageableSelect";

import { IconPlus, IconTrash } from "@tabler/icons-react";

// Bibliography Entry Types
const BIB_ENTRY_TYPES = [
  "Article",
  "Book",
  "Multivolume book",
  "Part of a book",
  "Book in book",
  "Supplemental Material in a book",
  "Booklet",
  "Collection",
  "Multivolume collection",
  "Part in a collection",
  "Supplemental material in a collection",
  "Manual",
  "Miscellaneous",
  "Online resource",
  "Patent",
  "Complete issue of a periodical",
  "Supplemental material in a periodical",
  "Proceedings",
  "Multivolume proceedings",
  "Article in proceedings",
  "Reference",
  "Multivolume reference",
  "Part of a Reference",
  "Report",
  "Thesis",
  "Unpublished",
];

// Bibliography Metadata Form
interface BibliographyMetadataFormProps {
  resourceId: string;
  initialMetadata?: BibliographyMetadata;
  onChange?: (metadata: BibliographyMetadata) => void;
}

export const BibliographyMetadataForm: React.FC<
  BibliographyMetadataFormProps
> = ({ initialMetadata = {}, onChange }) => {
  const [metadata, setMetadata] =
    useState<BibliographyMetadata>(initialMetadata);

  const handleChange = <K extends keyof BibliographyMetadata>(
    field: K,
    value: BibliographyMetadata[K]
  ) => {
    const updated = { ...metadata, [field]: value };
    setMetadata(updated);
    onChange?.(updated);
  };

  // Helper for list management (Authors, Editors, Translators)
  const handleListChange = (
    field: "authors" | "editors" | "translators",
    newList: string[]
  ) => {
    handleChange(field, newList.length > 0 ? newList : undefined);
  };

  const renderPersonList = (
    label: string,
    field: "authors" | "editors" | "translators"
  ) => {
    const list = metadata[field] || [];
    return (
      <Stack gap="xs">
        <Text size="sm" fw={500}>
          {label}
        </Text>
        {list.map((person, index) => (
          <Group key={index} gap="xs">
            <TextInput
              style={{ flex: 1 }}
              value={person}
              onChange={(e) => {
                const newList = [...list];
                newList[index] = e.currentTarget.value;
                handleListChange(field, newList);
              }}
            />
            <ActionIcon
              color="red"
              variant="subtle"
              onClick={() => {
                const newList = list.filter((_, i) => i !== index);
                handleListChange(field, newList);
              }}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        ))}
        <Button
          variant="light"
          size="xs"
          leftSection={<IconPlus size={14} />}
          onClick={() => handleListChange(field, [...list, ""])}
        >
          Add {label.slice(0, -1)}
        </Button>
      </Stack>
    );
  };

  return (
    <Stack gap="md">
      <Select
        label="Entry Type"
        data={BIB_ENTRY_TYPES}
        value={metadata.entryType}
        onChange={(val) => handleChange("entryType", val || undefined)}
        searchable
        placeholder="Select entry type"
      />

      <Tabs defaultValue="persons">
        <Tabs.List>
          <Tabs.Tab value="persons">Authors/Editors</Tabs.Tab>
          <Tabs.Tab value="basic">Basic Info</Tabs.Tab>
          <Tabs.Tab value="misc">Misc</Tabs.Tab>
          <Tabs.Tab value="content">Abstract/Note</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="persons" pt="md">
          <Stack gap="lg">
            {renderPersonList("Authors", "authors")}
            {renderPersonList("Editors", "editors")}
            {renderPersonList("Translators", "translators")}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="basic" pt="md">
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Citation Key"
                value={metadata.citationKey || ""}
                onChange={(e) => handleChange("citationKey", e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Title"
                value={metadata.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Journal"
                value={metadata.journal || ""}
                onChange={(e) => handleChange("journal", e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Year"
                value={metadata.year || ""}
                onChange={(e) => handleChange("year", e.target.value)}
              />
            </Grid.Col>

            <Grid.Col span={4}>
              <TextInput
                label="Volume"
                value={metadata.volume || ""}
                onChange={(e) => handleChange("volume", e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput
                label="Number"
                value={metadata.number || ""}
                onChange={(e) => handleChange("number", e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput
                label="Pages"
                value={metadata.pages || ""}
                onChange={(e) => handleChange("pages", e.target.value)}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Month"
                value={metadata.month || ""}
                onChange={(e) => handleChange("month", e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Publisher"
                value={metadata.publisher || ""}
                onChange={(e) => handleChange("publisher", e.target.value)}
              />
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="misc" pt="md">
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Series"
                value={metadata.series || ""}
                onChange={(e) => handleChange("series", e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Edition"
                value={metadata.edition || ""}
                onChange={(e) => handleChange("edition", e.target.value)}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="ISBN"
                value={metadata.isbn || ""}
                onChange={(e) => handleChange("isbn", e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="ISSN"
                value={metadata.issn || ""}
                onChange={(e) => handleChange("issn", e.target.value)}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="DOI"
                value={metadata.doi || ""}
                onChange={(e) => handleChange("doi", e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="URL"
                value={metadata.url || ""}
                onChange={(e) => handleChange("url", e.target.value)}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Language"
                value={metadata.language || ""}
                onChange={(e) => handleChange("language", e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Location"
                value={metadata.location || ""}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Organization"
                value={metadata.organization || ""}
                onChange={(e) => handleChange("organization", e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Institution"
                value={metadata.institution || ""}
                onChange={(e) => handleChange("institution", e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="School"
                value={metadata.school || ""}
                onChange={(e) => handleChange("school", e.target.value)}
              />
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="content" pt="md">
          <Stack>
            <TextInput
              label="Subtitle"
              value={metadata.subtitle || ""}
              onChange={(e) => handleChange("subtitle", e.target.value)}
            />
            <TextInput
              label="Book Title"
              value={metadata.booktitle || ""}
              onChange={(e) => handleChange("booktitle", e.target.value)}
            />
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Chapter"
                  value={metadata.chapter || ""}
                  onChange={(e) => handleChange("chapter", e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Crossref"
                  value={metadata.crossref || ""}
                  onChange={(e) => handleChange("crossref", e.target.value)}
                />
              </Grid.Col>
            </Grid>

            <Textarea
              label="Abstract"
              value={metadata.abstract || ""}
              onChange={(e) =>
                handleChange("abstract", e.currentTarget.value || undefined)
              }
              autosize
              minRows={3}
            />
            <Textarea
              label="Note"
              value={metadata.note || ""}
              onChange={(e) =>
                handleChange("note", e.currentTarget.value || undefined)
              }
              autosize
              minRows={2}
            />
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};

// Document Metadata Form
interface DocumentMetadataFormProps {
  resourceId: string;
  initialMetadata?: DocumentMetadata;
  onChange?: (metadata: DocumentMetadata) => void;
}

export const DocumentMetadataForm: React.FC<DocumentMetadataFormProps> = ({
  initialMetadata = {},
  onChange,
}) => {
  const [metadata, setMetadata] = useState<DocumentMetadata>(initialMetadata);
  const documentTypes = useTypedMetadataStore((state) => state.documentTypes);
  const createDocumentType = useTypedMetadataStore(
    (state) => state.createDocumentType
  );
  const renameDocumentType = useTypedMetadataStore(
    (state) => state.renameDocumentType
  );
  const deleteDocumentType = useTypedMetadataStore(
    (state) => state.deleteDocumentType
  );

  const handleChange = <K extends keyof DocumentMetadata>(
    field: K,
    value: DocumentMetadata[K]
  ) => {
    const updated = { ...metadata, [field]: value };
    setMetadata(updated);
    onChange?.(updated);
  };

  return (
    <Stack gap="md">
      {/* Title */}
      <TextInput
        label="Title"
        placeholder="Document title"
        value={metadata.title || ""}
        onChange={(e) =>
          handleChange("title", e.currentTarget.value || undefined)
        }
      />

      {/* Document Type - Manageable */}
      <ManageableSelect
        label="Document Type"
        placeholder="Select or create document type..."
        data={documentTypes}
        value={metadata.documentTypeId}
        onChange={(value) => handleChange("documentTypeId", value)}
        onCreate={createDocumentType}
        onRename={renameDocumentType}
        onDelete={deleteDocumentType}
      />

      {/* Hierarchy Editor - Field/Chapter/Section/Subsection */}
      <HierarchyEditor
        selectedFieldId={metadata.fieldId}
        selectedChapterIds={metadata.chapters}
        selectedSectionIds={metadata.sections}
        selectedSubsectionIds={metadata.subsections}
        onChange={(selections) => {
          const updated = {
            ...metadata,
            fieldId: selections.fieldId,
            chapters:
              selections.chapters.length > 0 ? selections.chapters : undefined,
            sections:
              selections.sections.length > 0 ? selections.sections : undefined,
            subsections:
              selections.subsections.length > 0
                ? selections.subsections
                : undefined,
          };
          setMetadata(updated);
          onChange?.(updated);
        }}
        mode="edit"
      />

      {/* Date - Using TextInput with type="date" */}
      <TextInput
        label="Date"
        type="date"
        placeholder="YYYY-MM-DD"
        value={metadata.date || ""}
        onChange={(e) =>
          handleChange("date", e.currentTarget.value || undefined)
        }
      />

      {/* Preamble Selection */}
      <CreatableSelect
        label="Preamble"
        placeholder="Select preamble..."
        data={[]} // TODO: Load preambles from resources
        value={metadata.preambleId}
        onChange={(value) => handleChange("preambleId", value)}
        onCreate={async (name) => ({ id: name, name })}
      />

      {/* Build Command */}
      <Select
        label="Build Command"
        placeholder="Select build command"
        data={[
          { value: "pdflatex", label: "pdflatex" },
          { value: "xelatex", label: "xelatex" },
          { value: "lualatex", label: "lualatex" },
          { value: "latex", label: "latex" },
        ]}
        value={metadata.buildCommand}
        onChange={(value) => handleChange("buildCommand", value || undefined)}
        clearable
      />

      {/* Description */}
      <Textarea
        label="Description"
        placeholder="Document description..."
        value={metadata.description || ""}
        onChange={(e) =>
          handleChange("description", e.currentTarget.value || undefined)
        }
        autosize
        minRows={2}
      />

      {/* Bibliography */}
      <Textarea
        label="Bibliography"
        placeholder="Bibliography content..."
        value={metadata.bibliography || ""}
        onChange={(e) =>
          handleChange("bibliography", e.currentTarget.value || undefined)
        }
        autosize
        minRows={2}
      />

      {/* Custom Tags */}
      <CreatableMultiSelect
        label="Custom Tags"
        placeholder="Type and create custom tags..."
        data={(metadata.customTags || []).map((tag) => ({
          id: tag,
          name: tag,
        }))}
        value={metadata.customTags || []}
        onChange={(value) =>
          handleChange("customTags", value.length > 0 ? value : undefined)
        }
        onCreate={async (name) => ({ id: name, name })}
      />

      {/* Solution Document - placeholder for now */}
      <CreatableSelect
        label="Solution Document"
        placeholder="Link to solution document..."
        data={[]} // TODO: Load documents from resources
        value={metadata.solutionDocumentId}
        onChange={(value) => handleChange("solutionDocumentId", value)}
        onCreate={async (name) => ({ id: name, name })}
      />
    </Stack>
  );
};

// Table Metadata Form
interface TableMetadataFormProps {
  resourceId: string;
  initialMetadata?: TableMetadata;
  onChange?: (metadata: TableMetadata) => void;
}

const TABLE_ENVIRONMENTS = [
  "tabular",
  "tabularx",
  "longtable",
  "sidewaystable",
  "tabularray",
  "tblr",
  "longtblr",
];

export const TableMetadataForm: React.FC<TableMetadataFormProps> = ({
  initialMetadata = {},
  onChange,
}) => {
  const [metadata, setMetadata] = useState<TableMetadata>(initialMetadata);
  const tableTypes = useTypedMetadataStore((state) => state.tableTypes);
  const createTableType = useTypedMetadataStore(
    (state) => state.createTableType
  );
  const renameTableType = useTypedMetadataStore(
    (state) => state.renameTableType
  );
  const deleteTableType = useTypedMetadataStore(
    (state) => state.deleteTableType
  );

  const handleChange = <K extends keyof TableMetadata>(
    field: K,
    value: TableMetadata[K]
  ) => {
    const updated = { ...metadata, [field]: value };
    setMetadata(updated);
    onChange?.(updated);
  };

  return (
    <Stack gap="md">
      <TextInput
        label="Caption"
        placeholder="Table caption"
        value={metadata.caption || ""}
        onChange={(e) =>
          handleChange("caption", e.currentTarget.value || undefined)
        }
      />

      <Textarea
        label="Description"
        placeholder="Internal description..."
        value={metadata.description || ""}
        onChange={(e) =>
          handleChange("description", e.currentTarget.value || undefined)
        }
        autosize
        minRows={2}
      />

      <Group grow>
        <ManageableSelect
          label="Table Type"
          placeholder="Select Type..."
          data={[...tableTypes]}
          value={metadata.tableTypeId}
          onChange={(val) => handleChange("tableTypeId", val)}
          onCreate={createTableType}
          onRename={renameTableType}
          onDelete={deleteTableType}
        />
        <TextInput
          label="Date"
          type="date"
          value={metadata.date || ""}
          onChange={(e) =>
            handleChange("date", e.currentTarget.value || undefined)
          }
        />
      </Group>

      <Group grow>
        <Select
          label="Environment"
          data={TABLE_ENVIRONMENTS}
          value={metadata.environment || "tabular"}
          onChange={(val) => handleChange("environment", val || undefined)}
          searchable
        />
        <TextInput
          label="Label"
          placeholder="tab:my_table"
          value={metadata.label || ""}
          onChange={(e) =>
            handleChange("label", e.currentTarget.value || undefined)
          }
        />
      </Group>

      <Group grow>
        <TextInput
          label="Placement"
          placeholder="htbp"
          value={metadata.placement || ""}
          onChange={(e) =>
            handleChange("placement", e.currentTarget.value || undefined)
          }
        />
        <TextInput
          label="Width"
          placeholder="1.0\textwidth"
          value={metadata.width || ""}
          onChange={(e) =>
            handleChange("width", e.currentTarget.value || undefined)
          }
        />
        <TextInput
          label="Alignment"
          placeholder="|l|c|r|"
          value={metadata.alignment || ""}
          onChange={(e) =>
            handleChange("alignment", e.currentTarget.value || undefined)
          }
        />
      </Group>

      <Group grow>
        <NumberInput
          label="Rows"
          min={0}
          value={metadata.rows}
          onChange={(val) =>
            handleChange("rows", typeof val === "number" ? val : undefined)
          }
        />
        <NumberInput
          label="Columns"
          min={0}
          value={metadata.columns}
          onChange={(val) =>
            handleChange("columns", typeof val === "number" ? val : undefined)
          }
        />
      </Group>

      <MultiSelect
        label="Required Packages"
        placeholder="e.g., booktabs, tabularx"
        data={metadata.requiredPackages || []}
        value={metadata.requiredPackages || []}
        onChange={(value) =>
          handleChange("requiredPackages", value.length > 0 ? value : undefined)
        }
        searchable
        // Note: Mantine v7 MultiSelect doesn't use creatable prop this way, using Combobox or creatable logic usually handled by checking data
        // For simplicity, sticking to searchable. If creation is needed, CreatableMultiSelect should be used.
      />

      <CreatableMultiSelect
        label="Custom Tags"
        placeholder="Type and create custom tags..."
        data={(metadata.customTags || []).map((tag) => ({
          id: tag,
          name: tag,
        }))}
        value={metadata.customTags || []}
        onChange={(value) =>
          handleChange("customTags", value.length > 0 ? value : undefined)
        }
        onCreate={async (name) => ({ id: name, name })}
      />
    </Stack>
  );
};

// Figure Metadata Form
interface FigureMetadataFormProps {
  resourceId: string;
  initialMetadata?: FigureMetadata;
  onChange?: (metadata: FigureMetadata) => void;
}

export const FigureMetadataForm: React.FC<FigureMetadataFormProps> = ({
  initialMetadata = {},
  onChange,
}) => {
  const [metadata, setMetadata] = useState<FigureMetadata>(initialMetadata);

  const handleChange = <K extends keyof FigureMetadata>(
    field: K,
    value: FigureMetadata[K]
  ) => {
    const updated = { ...metadata, [field]: value };
    setMetadata(updated);
    onChange?.(updated);
  };

  return (
    <Stack gap="md">
      <Select
        label="Environment"
        placeholder="Select environment"
        data={[
          { value: "tikzpicture", label: "tikzpicture" },
          { value: "axis", label: "axis" },
          { value: "includegraphics", label: "includegraphics" },
        ]}
        value={metadata.environment}
        onChange={(value) => handleChange("environment", value || undefined)}
        clearable
      />
      <TextInput
        label="Caption"
        placeholder="Figure caption"
        value={metadata.caption || ""}
        onChange={(e) =>
          handleChange("caption", e.currentTarget.value || undefined)
        }
      />
      <Textarea
        label="Description"
        placeholder="Figure description..."
        value={metadata.description || ""}
        onChange={(e) =>
          handleChange("description", e.currentTarget.value || undefined)
        }
        autosize
        minRows={2}
      />
    </Stack>
  );
};

// Command Metadata Form
interface CommandMetadataFormProps {
  resourceId: string;
  initialMetadata?: CommandMetadata;
  onChange?: (metadata: CommandMetadata) => void;
}

export const CommandMetadataForm: React.FC<CommandMetadataFormProps> = ({
  initialMetadata = {},
  onChange,
}) => {
  const [metadata, setMetadata] = useState<CommandMetadata>(initialMetadata);

  const handleChange = <K extends keyof CommandMetadata>(
    field: K,
    value: CommandMetadata[K]
  ) => {
    const updated = { ...metadata, [field]: value };
    setMetadata(updated);
    onChange?.(updated);
  };

  return (
    <Stack gap="md">
      <TextInput
        label="Command Name"
        placeholder="e.g., \\mycommand"
        value={metadata.name || ""}
        onChange={(e) =>
          handleChange("name", e.currentTarget.value || undefined)
        }
      />
      <Textarea
        label="Description"
        placeholder="Command description..."
        value={metadata.description || ""}
        onChange={(e) =>
          handleChange("description", e.currentTarget.value || undefined)
        }
        autosize
        minRows={2}
      />
      <Checkbox
        label="Built-in Command"
        checked={metadata.builtIn || false}
        onChange={(e) => handleChange("builtIn", e.currentTarget.checked)}
      />
    </Stack>
  );
};

// Package Metadata Form
interface PackageMetadataFormProps {
  resourceId: string;
  initialMetadata?: PackageMetadata;
  onChange?: (metadata: PackageMetadata) => void;
}

export const PackageMetadataForm: React.FC<PackageMetadataFormProps> = ({
  initialMetadata = {},
  onChange,
}) => {
  const [metadata, setMetadata] = useState<PackageMetadata>(initialMetadata);
  const packageTopics = useTypedMetadataStore((state) => state.packageTopics);
  const createPackageTopic = useTypedMetadataStore(
    (state) => state.createPackageTopic
  );

  const handleChange = <K extends keyof PackageMetadata>(
    field: K,
    value: PackageMetadata[K]
  ) => {
    const updated = { ...metadata, [field]: value };
    setMetadata(updated);
    onChange?.(updated);
  };

  return (
    <Stack gap="md">
      <TextInput
        label="Package Name"
        placeholder="e.g., geometry"
        value={metadata.name || ""}
        onChange={(e) =>
          handleChange("name", e.currentTarget.value || undefined)
        }
      />
      <CreatableSelect
        label="Primary Topic"
        placeholder="Select or create primary topic..."
        data={packageTopics.map((pt) => ({ id: pt.id, name: pt.name }))}
        value={metadata.topicId}
        onChange={(value) => handleChange("topicId", value || undefined)}
        onCreate={createPackageTopic}
      />
      <CreatableMultiSelect
        label="Related Topics"
        placeholder="Select or create related topics..."
        data={packageTopics.map((pt) => ({ id: pt.id, name: pt.name }))}
        value={metadata.topics || []}
        onChange={(value) =>
          handleChange("topics", value.length > 0 ? value : undefined)
        }
        onCreate={createPackageTopic}
      />
      <CreatableMultiSelect
        label="Dependencies"
        placeholder="Type and create package dependencies..."
        data={(metadata.dependencies || []).map((dep) => ({
          id: dep,
          name: dep,
        }))}
        value={metadata.dependencies || []}
        onChange={(value) =>
          handleChange("dependencies", value.length > 0 ? value : undefined)
        }
        onCreate={async (name) => ({ id: name, name })}
      />
      <Textarea
        label="Description"
        placeholder="Package description..."
        value={metadata.description || ""}
        onChange={(e) =>
          handleChange("description", e.currentTarget.value || undefined)
        }
        autosize
        minRows={2}
      />
    </Stack>
  );
};

// Preamble Metadata Form
interface PreambleMetadataFormProps {
  resourceId: string;
  initialMetadata?: PreambleMetadata;
  onChange?: (metadata: PreambleMetadata) => void;
}

export const PreambleMetadataForm: React.FC<PreambleMetadataFormProps> = ({
  initialMetadata = {},
  onChange,
}) => {
  const [metadata, setMetadata] = useState<PreambleMetadata>(initialMetadata);
  const fileTypes = useTypedMetadataStore((state) => state.fileTypes);
  const macroCommandTypes = useTypedMetadataStore(
    (state) => state.macroCommandTypes
  );
  const createMacroCommandType = useTypedMetadataStore(
    (state) => state.createMacroCommandType
  );

  const handleChange = <K extends keyof PreambleMetadata>(
    field: K,
    value: PreambleMetadata[K]
  ) => {
    const updated = { ...metadata, [field]: value };
    setMetadata(updated);
    onChange?.(updated);
  };

  return (
    <Stack gap="md">
      <TextInput
        label="Name"
        placeholder="Preamble name"
        value={metadata.name || ""}
        onChange={(e) =>
          handleChange("name", e.currentTarget.value || undefined)
        }
      />
      <Select
        label="File Type"
        placeholder="Select type"
        data={fileTypes.map((ft) => ({ value: ft.id, label: ft.name }))}
        value={metadata.fileTypeId}
        onChange={(value) => handleChange("fileTypeId", value || undefined)}
        clearable
      />
      <CreatableMultiSelect
        label="Command Types"
        placeholder="Select or create command types..."
        data={macroCommandTypes.map((m) => ({ id: m.id, name: m.name }))}
        value={metadata.commandTypes || []}
        onChange={(value) =>
          handleChange("commandTypes", value.length > 0 ? value : undefined)
        }
        onCreate={createMacroCommandType}
      />
      <CreatableMultiSelect
        label="Required Packages"
        placeholder="Type and create required packages..."
        data={(metadata.requiredPackages || []).map((dep) => ({
          id: dep,
          name: dep,
        }))}
        value={metadata.requiredPackages || []}
        onChange={(value) =>
          handleChange("requiredPackages", value.length > 0 ? value : undefined)
        }
        onCreate={async (name) => ({ id: name, name })}
      />
      <Checkbox
        label="Built-in"
        checked={metadata.builtIn || false}
        onChange={(e) => handleChange("builtIn", e.currentTarget.checked)}
      />
      <Textarea
        label="Description"
        placeholder="Preamble description..."
        value={metadata.description || ""}
        onChange={(e) =>
          handleChange("description", e.currentTarget.value || undefined)
        }
        autosize
        minRows={2}
      />
    </Stack>
  );
};

// Class Metadata Form
interface ClassMetadataFormProps {
  resourceId: string;
  initialMetadata?: ClassMetadata;
  onChange?: (metadata: ClassMetadata) => void;
}

export const ClassMetadataForm: React.FC<ClassMetadataFormProps> = ({
  initialMetadata = {},
  onChange,
}) => {
  const [metadata, setMetadata] = useState<ClassMetadata>(initialMetadata);
  const fileTypes = useTypedMetadataStore((state) => state.fileTypes);

  const handleChange = <K extends keyof ClassMetadata>(
    field: K,
    value: ClassMetadata[K]
  ) => {
    const updated = { ...metadata, [field]: value };
    setMetadata(updated);
    onChange?.(updated);
  };

  return (
    <Stack gap="md">
      <TextInput
        label="Class Name"
        placeholder="e.g., article"
        value={metadata.name || ""}
        onChange={(e) =>
          handleChange("name", e.currentTarget.value || undefined)
        }
      />
      <Select
        label="File Type"
        placeholder="Select type"
        data={fileTypes.map((ft) => ({ value: ft.id, label: ft.name }))}
        value={metadata.fileTypeId}
        onChange={(value) => handleChange("fileTypeId", value || undefined)}
        clearable
      />
      <CreatableMultiSelect
        label="Custom Tags"
        placeholder="Type and create custom tags..."
        data={(metadata.customTags || []).map((tag) => ({
          id: tag,
          name: tag,
        }))}
        value={metadata.customTags || []}
        onChange={(value) =>
          handleChange("customTags", value.length > 0 ? value : undefined)
        }
        onCreate={async (name) => ({ id: name, name })}
      />
      <Textarea
        label="Description"
        placeholder="Class description..."
        value={metadata.description || ""}
        onChange={(e) =>
          handleChange("description", e.currentTarget.value || undefined)
        }
        autosize
        minRows={2}
      />
    </Stack>
  );
};

// Additional Typed Metadata Forms - Fixed version
import React, { useState } from 'react';
import { Stack, Select, TextInput, Textarea, Checkbox, MultiSelect } from '@mantine/core';
import { useTypedMetadataStore } from '../../stores/typedMetadataStore';
import type {
    DocumentMetadata,
    TableMetadata,
    FigureMetadata,
    CommandMetadata,
    PackageMetadata,
    PreambleMetadata,
    ClassMetadata,
} from '../../types/typedMetadata';
import { CreatableSelect, CreatableMultiSelect } from './TypedMetadataForms';

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
    const fileTypes = useTypedMetadataStore(state => state.fileTypes);

    const handleChange = <K extends keyof DocumentMetadata>(field: K, value: DocumentMetadata[K]) => {
        const updated = { ...metadata, [field]: value };
        setMetadata(updated);
        onChange?.(updated);
    };

    return (
        <Stack gap="md">
            <TextInput
                label="Title"
                placeholder="Document title"
                value={metadata.title || ''}
                onChange={(e) => handleChange('title', e.currentTarget.value || undefined)}
            />
            <Select
                label="Document Type"
                placeholder="Select type"
                data={fileTypes.map(ft => ({ value: ft.id, label: ft.name }))}
                value={metadata.documentTypeId}
                onChange={(value) => handleChange('documentTypeId', value || undefined)}
                clearable
            />
            <Textarea
                label="Description"
                placeholder="Document description..."
                value={metadata.description || ''}
                onChange={(e) => handleChange('description', e.currentTarget.value || undefined)}
                autosize
                minRows={2}
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

export const TableMetadataForm: React.FC<TableMetadataFormProps> = ({
    initialMetadata = {},
    onChange,
}) => {
    const [metadata, setMetadata] = useState<TableMetadata>(initialMetadata);

    const handleChange = <K extends keyof TableMetadata>(field: K, value: TableMetadata[K]) => {
        const updated = { ...metadata, [field]: value };
        setMetadata(updated);
        onChange?.(updated);
    };

    return (
        <Stack gap="md">
            <TextInput
                label="Caption"
                placeholder="Table caption"
                value={metadata.caption || ''}
                onChange={(e) => handleChange('caption', e.currentTarget.value || undefined)}
            />
            <MultiSelect
                label="Required Packages"
                placeholder="e.g., booktabs, tabularx"
                data={metadata.requiredPackages || []}
                value={metadata.requiredPackages || []}
                onChange={(value) => handleChange('requiredPackages', value.length > 0 ? value : undefined)}
                searchable
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

    const handleChange = <K extends keyof FigureMetadata>(field: K, value: FigureMetadata[K]) => {
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
                    { value: 'tikzpicture', label: 'tikzpicture' },
                    { value: 'axis', label: 'axis' },
                    { value: 'includegraphics', label: 'includegraphics' },
                ]}
                value={metadata.environment}
                onChange={(value) => handleChange('environment', value || undefined)}
                clearable
            />
            <TextInput
                label="Caption"
                placeholder="Figure caption"
                value={metadata.caption || ''}
                onChange={(e) => handleChange('caption', e.currentTarget.value || undefined)}
            />
            <Textarea
                label="Description"
                placeholder="Figure description..."
                value={metadata.description || ''}
                onChange={(e) => handleChange('description', e.currentTarget.value || undefined)}
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

    const handleChange = <K extends keyof CommandMetadata>(field: K, value: CommandMetadata[K]) => {
        const updated = { ...metadata, [field]: value };
        setMetadata(updated);
        onChange?.(updated);
    };

    return (
        <Stack gap="md">
            <TextInput
                label="Command Name"
                placeholder="e.g., \\mycommand"
                value={metadata.name || ''}
                onChange={(e) => handleChange('name', e.currentTarget.value || undefined)}
            />
            <Textarea
                label="Description"
                placeholder="Command description..."
                value={metadata.description || ''}
                onChange={(e) => handleChange('description', e.currentTarget.value || undefined)}
                autosize
                minRows={2}
            />
            <Checkbox
                label="Built-in Command"
                checked={metadata.builtIn || false}
                onChange={(e) => handleChange('builtIn', e.currentTarget.checked)}
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
    const packageTopics = useTypedMetadataStore(state => state.packageTopics);
    const createPackageTopic = useTypedMetadataStore(state => state.createPackageTopic);

    const handleChange = <K extends keyof PackageMetadata>(field: K, value: PackageMetadata[K]) => {
        const updated = { ...metadata, [field]: value };
        setMetadata(updated);
        onChange?.(updated);
    };

    return (
        <Stack gap="md">
            <TextInput
                label="Package Name"
                placeholder="e.g., geometry"
                value={metadata.name || ''}
                onChange={(e) => handleChange('name', e.currentTarget.value || undefined)}
            />
            <CreatableSelect
                label="Primary Topic"
                placeholder="Select or create primary topic..."
                data={packageTopics.map(pt => ({ id: pt.id, name: pt.name }))}
                value={metadata.topicId}
                onChange={(value) => handleChange('topicId', value || undefined)}
                onCreate={createPackageTopic}
            />
             <CreatableMultiSelect
                label="Related Topics"
                placeholder="Select or create related topics..."
                data={packageTopics.map(pt => ({ id: pt.id, name: pt.name }))}
                value={metadata.topics || []}
                onChange={(value) => handleChange('topics', value.length > 0 ? value : undefined)}
                onCreate={createPackageTopic}
            />
            <CreatableMultiSelect
                label="Dependencies"
                placeholder="Type and create package dependencies..."
                data={(metadata.dependencies || []).map(dep => ({ id: dep, name: dep }))}
                value={metadata.dependencies || []}
                onChange={(value) => handleChange('dependencies', value.length > 0 ? value : undefined)}
                onCreate={async (name) => ({ id: name, name })}
            />
             <Textarea
                label="Description"
                placeholder="Package description..."
                value={metadata.description || ''}
                onChange={(e) => handleChange('description', e.currentTarget.value || undefined)}
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
    const fileTypes = useTypedMetadataStore(state => state.fileTypes);
    const macroCommandTypes = useTypedMetadataStore(state => state.macroCommandTypes);
    const createMacroCommandType = useTypedMetadataStore(state => state.createMacroCommandType);

    const handleChange = <K extends keyof PreambleMetadata>(field: K, value: PreambleMetadata[K]) => {
        const updated = { ...metadata, [field]: value };
        setMetadata(updated);
        onChange?.(updated);
    };

    return (
        <Stack gap="md">
             <TextInput
                label="Name"
                placeholder="Preamble name"
                value={metadata.name || ''}
                onChange={(e) => handleChange('name', e.currentTarget.value || undefined)}
            />
             <Select
                label="File Type"
                placeholder="Select type"
                data={fileTypes.map(ft => ({ value: ft.id, label: ft.name }))}
                value={metadata.fileTypeId}
                onChange={(value) => handleChange('fileTypeId', value || undefined)}
                clearable
            />
            <CreatableMultiSelect
                label="Command Types"
                 placeholder="Select or create command types..."
                data={macroCommandTypes.map(m => ({ id: m.id, name: m.name }))}
                value={metadata.commandTypes || []}
                onChange={(value) => handleChange('commandTypes', value.length > 0 ? value : undefined)}
                onCreate={createMacroCommandType}
            />
             <CreatableMultiSelect
                label="Required Packages"
                placeholder="Type and create required packages..."
                data={(metadata.requiredPackages || []).map(dep => ({ id: dep, name: dep }))}
                value={metadata.requiredPackages || []}
                onChange={(value) => handleChange('requiredPackages', value.length > 0 ? value : undefined)}
                onCreate={async (name) => ({ id: name, name })}
            />
            <Checkbox
                label="Built-in"
                checked={metadata.builtIn || false}
                onChange={(e) => handleChange('builtIn', e.currentTarget.checked)}
            />
            <Textarea
                label="Description"
                placeholder="Preamble description..."
                value={metadata.description || ''}
                onChange={(e) => handleChange('description', e.currentTarget.value || undefined)}
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
    const fileTypes = useTypedMetadataStore(state => state.fileTypes);

    const handleChange = <K extends keyof ClassMetadata>(field: K, value: ClassMetadata[K]) => {
        const updated = { ...metadata, [field]: value };
        setMetadata(updated);
        onChange?.(updated);
    };

    return (
        <Stack gap="md">
             <TextInput
                label="Class Name"
                placeholder="e.g., article"
                value={metadata.name || ''}
                onChange={(e) => handleChange('name', e.currentTarget.value || undefined)}
            />
             <Select
                label="File Type"
                placeholder="Select type"
                data={fileTypes.map(ft => ({ value: ft.id, label: ft.name }))}
                value={metadata.fileTypeId}
                onChange={(value) => handleChange('fileTypeId', value || undefined)}
                clearable
            />
             <CreatableMultiSelect
                label="Custom Tags"
                placeholder="Type and create custom tags..."
                data={(metadata.customTags || []).map(tag => ({ id: tag, name: tag }))}
                value={metadata.customTags || []}
                onChange={(value) => handleChange('customTags', value.length > 0 ? value : undefined)}
                onCreate={async (name) => ({ id: name, name })}
            />
            <Textarea
                label="Description"
                placeholder="Class description..."
                value={metadata.description || ''}
                onChange={(e) => handleChange('description', e.currentTarget.value || undefined)}
                autosize
                minRows={2}
            />
        </Stack>
    );
};

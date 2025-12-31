import React, { useEffect, useState, useMemo } from 'react';
import { Stack, Text, NavLink, Loader, ActionIcon, Group, Tooltip, Box, Accordion, TextInput } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faPlus, faSync, faBook, faFileLines, faFile, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useDatabaseStore } from '../../stores/databaseStore';
import { open } from '@tauri-apps/plugin-dialog';

interface DatabaseSidebarProps {
    onOpenResource?: (path: string) => void;
}

export const DatabaseSidebar = ({ onOpenResource }: DatabaseSidebarProps) => {
    const { collections, fetchCollections, selectCollection, activeCollection, resources, isLoading, importFolder } = useDatabaseStore();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCollections();
    }, []);

    const handleImport = async () => {
        try {
            const selected = await open({ directory: true, title: "Select Folder to Import" });
            if (selected && typeof selected === 'string') {
                 const separator = selected.includes('\\') ? '\\' : '/';
                 const name = selected.split(separator).pop() || 'Imported';
                 await importFolder(selected, name);
            }
        } catch (e) {
            console.error("Import failed", e);
        }
    };

    const handleAccordionChange = (value: string | null) => {
        if (value) {
            selectCollection(value);
        }
    };

    const filteredCollections = useMemo(() => {
        if (!searchQuery) return collections;
        return collections.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [collections, searchQuery]);

    const filteredResources = useMemo(() => {
        if (!searchQuery) return resources;
        return resources.filter(r => 
            (r.title && r.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
            r.path.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [resources, searchQuery]);

    return (
        <Stack p="xs" gap="xs" h="100%" style={{ overflow: 'hidden' }}>
            <Group justify="space-between" px={4}>
                <Text size="xs" fw={700} c="dimmed">COLLECTIONS</Text>
                <Group gap={2}>
                    <Tooltip label="Refresh">
                        <ActionIcon size="xs" variant="subtle" color="gray" onClick={() => fetchCollections()}>
                            <FontAwesomeIcon icon={faSync} style={{ width: 12, height: 12 }} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Import Folder">
                        <ActionIcon size="xs" variant="subtle" color="gray" onClick={handleImport}>
                            <FontAwesomeIcon icon={faPlus} style={{ width: 12, height: 12 }} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Group>

            <Box px={4}>
                <TextInput 
                    placeholder="Search..." 
                    size="xs" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    rightSection={searchQuery ? <ActionIcon size="xs" variant="transparent" onClick={() => setSearchQuery('')}><FontAwesomeIcon icon={faTimes} /></ActionIcon> : <FontAwesomeIcon icon={faSearch} style={{ width: 12, height: 12, color: 'var(--mantine-color-dimmed)' }} />}
                />
            </Box>

            {isLoading && collections.length === 0 && <Loader size="xs" mx="auto" />}

            {collections.length === 0 && !isLoading && (
                 <Text size="xs" c="dimmed" ta="center">No collections found.</Text>
            )}

            <Box style={{ flex: 1, overflowY: 'auto' }}>
                <Accordion variant="filled" chevronPosition="left" onChange={handleAccordionChange} value={activeCollection}>
                    {filteredCollections.map(col => (
                        <Accordion.Item value={col.name} key={col.name}>
                            <Accordion.Control icon={<FontAwesomeIcon icon={col.icon === 'book' ? faBook : col.kind === 'documents' ? faFileLines : faFolder} style={{ width: 14, height: 14, color: "#fab005" }} />}>
                                <Text size="sm" truncate>{col.name}</Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                                {activeCollection === col.name && isLoading && resources.length === 0 && <Loader size="xs" />}
                                {activeCollection === col.name && filteredResources.length === 0 && !isLoading && <Text size="xs" c="dimmed" pl="md">Empty or no matches</Text>}
                                {activeCollection === col.name && filteredResources.map(res => (
                                    <NavLink
                                        key={res.id}
                                        label={res.title || res.path.split(/[/\\]/).pop()}
                                        leftSection={<FontAwesomeIcon icon={faFile} style={{ width: 12, height: 12, color: "#4dabf7" }} />}
                                        onClick={() => onOpenResource && onOpenResource(res.path)}
                                        styles={{ root: { paddingLeft: 20, height: 28 }, label: { fontSize: 13 } }}
                                    />
                                ))}
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </Box>
        </Stack>
    );
};


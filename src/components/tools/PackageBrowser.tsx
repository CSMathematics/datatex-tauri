import React, { useState, useMemo, useEffect } from "react";
import {
  Title,
  Text,
  TextInput,
  Card,
  Group,
  Badge,
  Stack,
  ScrollArea,
  ActionIcon,
  Button,
  ThemeIcon,
  Box,
  LoadingOverlay,
  Select,
  Divider,
  Accordion,
} from "@mantine/core";
import { useInputState, useDebouncedValue } from "@mantine/hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faBoxOpen,
  faExternalLinkAlt,
  faCopyright,
  faUser,
  faTag,
  faTimes,
  faLayerGroup,
  faList,
} from "@fortawesome/free-solid-svg-icons";

import ctanData from "../../assets/CTANpackageDatabase.json";

interface PackageAuthor {
  givenname?: string;
  familyname?: string;
}

interface PackageLicense {
  name?: string;
  key?: string;
  free?: boolean;
}

interface PackageTopic {
  details: string;
  key: string;
}

interface PackageEntry {
  id: string;
  name: string;
  caption?: string;
  descriptions?: { text: string }[] | { description: string };
  authors?: PackageAuthor[];
  license?: PackageLicense;
  version?: { number: string; date: string };
  topics?: PackageTopic[];
  documentation?: { href: string; details: string }[];
  home?: string;
}

interface PackageBrowserProps {
  onClose: () => void;
}

type ViewMode = "list" | "grouped";

const ITEMS_PER_PAGE = 100;

export const PackageBrowser: React.FC<PackageBrowserProps> = ({ onClose }) => {
  const [search, setSearch] = useInputState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [selectedPackage, setSelectedPackage] = useState<PackageEntry | null>(
    null
  );
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Simulate initial load delay
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  // Extract all unique topics for the filter dropdown
  const allTopics = useMemo(() => {
    const topicMap = new Map<string, string>();
    (ctanData as PackageEntry[]).forEach((pkg) => {
      pkg.topics?.forEach((t) => {
        if (!topicMap.has(t.key)) {
          topicMap.set(t.key, t.details);
        }
      });
    });
    return Array.from(topicMap.entries())
      .map(([key, details]) => ({ value: key, label: details }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  // Filter and sort packages alphabetically
  const filteredPackages = useMemo(() => {
    let result = ctanData as PackageEntry[];

    // Filter by search
    if (debouncedSearch.trim()) {
      const lowerQuery = debouncedSearch.toLowerCase();
      result = result.filter(
        (pkg) =>
          pkg.name?.toLowerCase().includes(lowerQuery) ||
          pkg.caption?.toLowerCase().includes(lowerQuery) ||
          pkg.id?.toLowerCase().includes(lowerQuery)
      );
    }

    // Filter by topic
    if (selectedTopic) {
      result = result.filter((pkg) =>
        pkg.topics?.some((t) => t.key === selectedTopic)
      );
    }

    // Sort alphabetically by name
    return result.sort((a, b) =>
      (a.name || a.id).localeCompare(b.name || b.id)
    );
  }, [debouncedSearch, selectedTopic]);

  // Group packages by topic
  const packagesByTopic = useMemo(() => {
    const topicGroups: Record<
      string,
      { label: string; packages: PackageEntry[] }
    > = {};

    filteredPackages.forEach((pkg) => {
      if (pkg.topics && pkg.topics.length > 0) {
        pkg.topics.forEach((t) => {
          if (!topicGroups[t.key]) {
            topicGroups[t.key] = { label: t.details, packages: [] };
          }
          // Avoid duplicates
          if (!topicGroups[t.key].packages.find((p) => p.id === pkg.id)) {
            topicGroups[t.key].packages.push(pkg);
          }
        });
      } else {
        // Packages without topics
        if (!topicGroups["_uncategorized"]) {
          topicGroups["_uncategorized"] = {
            label: "Uncategorized",
            packages: [],
          };
        }
        topicGroups["_uncategorized"].packages.push(pkg);
      }
    });

    // Sort by topic label
    return Object.entries(topicGroups)
      .sort(([, a], [, b]) => a.label.localeCompare(b.label))
      .slice(0, 50); // Limit topics shown for performance
  }, [filteredPackages]);

  const visiblePackages = useMemo(() => {
    return filteredPackages.slice(0, visibleCount);
  }, [filteredPackages, visibleCount]);

  const getAuthorString = (authors?: PackageAuthor[]) => {
    if (!authors || authors.length === 0) return "Unknown Author";
    return authors
      .map((a) => `${a.givenname || ""} ${a.familyname || ""}`.trim())
      .join(", ");
  };

  const getDescription = (pkg: PackageEntry) => {
    if (Array.isArray(pkg.descriptions)) {
      return pkg.descriptions[0]?.text || "";
    }
    // @ts-ignore
    return pkg.descriptions?.description || pkg.caption || "";
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Package Card Component
  const PackageCard = ({ pkg }: { pkg: PackageEntry }) => (
    <Card
      shadow="sm"
      padding="sm"
      radius="sm"
      withBorder
      bg={selectedPackage?.id === pkg.id ? "dark.6" : "dark.7"}
      style={{
        cursor: "pointer",
        transition: "background-color 0.15s",
        borderColor:
          selectedPackage?.id === pkg.id
            ? "var(--mantine-color-teal-6)"
            : undefined,
      }}
      onClick={() => setSelectedPackage(pkg)}
    >
      <Group justify="space-between" wrap="nowrap">
        <Text fw={600} size="sm" truncate style={{ flex: 1 }}>
          {pkg.name}
        </Text>
        {pkg.version?.number && (
          <Badge size="xs" variant="dot" color="gray">
            {pkg.version.number}
          </Badge>
        )}
      </Group>
      <Text size="xs" c="dimmed" lineClamp={2} mt={4}>
        {stripHtml(pkg.caption || "")}
      </Text>
    </Card>
  );

  return (
    <Group h="100%" gap={0} wrap="nowrap" style={{ overflow: "hidden" }}>
      <LoadingOverlay visible={isLoading} />

      {/* LEFT: Package List */}
      <Stack
        h="100%"
        gap={0}
        style={{
          flex: 1,
          minWidth: 0,
          borderRight: "1px solid var(--mantine-color-dark-6)",
        }}
      >
        {/* Header */}
        <Box
          p="md"
          bg="dark.8"
          style={{ borderBottom: "1px solid var(--mantine-color-dark-6)" }}
        >
          <Group justify="space-between" align="center" mb="sm">
            <Group>
              <ThemeIcon
                size="lg"
                variant="gradient"
                gradient={{ from: "teal", to: "cyan" }}
              >
                <FontAwesomeIcon icon={faBoxOpen} />
              </ThemeIcon>
              <Title order={4}>CTAN Packages</Title>
              <Badge variant="outline" size="sm">
                {filteredPackages.length} /{" "}
                {(ctanData as PackageEntry[]).length}
              </Badge>
            </Group>
            <ActionIcon
              onClick={onClose}
              variant="subtle"
              color="gray"
              size="lg"
            >
              <FontAwesomeIcon icon={faTimes} />
            </ActionIcon>
          </Group>

          <TextInput
            placeholder="Search packages..."
            leftSection={<FontAwesomeIcon icon={faSearch} />}
            value={search}
            onChange={setSearch}
            size="sm"
            mb="sm"
          />

          <Group gap="xs">
            <Select
              placeholder="Filter by topic"
              data={allTopics}
              value={selectedTopic}
              onChange={setSelectedTopic}
              clearable
              searchable
              size="xs"
              style={{ flex: 1 }}
              leftSection={
                <FontAwesomeIcon icon={faTag} style={{ width: 12 }} />
              }
            />
            <ActionIcon.Group>
              <ActionIcon
                variant={viewMode === "list" ? "filled" : "default"}
                onClick={() => setViewMode("list")}
                size="md"
              >
                <FontAwesomeIcon icon={faList} style={{ width: 12 }} />
              </ActionIcon>
              <ActionIcon
                variant={viewMode === "grouped" ? "filled" : "default"}
                onClick={() => setViewMode("grouped")}
                size="md"
              >
                <FontAwesomeIcon icon={faLayerGroup} style={{ width: 12 }} />
              </ActionIcon>
            </ActionIcon.Group>
          </Group>
        </Box>

        {/* Package List */}
        <ScrollArea h="100%" type="hover" offsetScrollbars>
          <Stack gap="xs" p="sm">
            {viewMode === "list" ? (
              <>
                {visiblePackages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
                {visibleCount < filteredPackages.length && (
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}
                  >
                    Load{" "}
                    {Math.min(
                      ITEMS_PER_PAGE,
                      filteredPackages.length - visibleCount
                    )}{" "}
                    more...
                  </Button>
                )}
              </>
            ) : (
              <Accordion variant="separated" radius="sm">
                {packagesByTopic.map(([key, { label, packages }]) => (
                  <Accordion.Item key={key} value={key}>
                    <Accordion.Control>
                      <Group justify="space-between">
                        <Text size="sm" fw={600}>
                          {label}
                        </Text>
                        <Badge size="xs" variant="light">
                          {packages.length}
                        </Badge>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap="xs">
                        {packages.slice(0, 20).map((pkg) => (
                          <PackageCard key={pkg.id} pkg={pkg} />
                        ))}
                        {packages.length > 20 && (
                          <Text size="xs" c="dimmed" ta="center">
                            +{packages.length - 20} more packages
                          </Text>
                        )}
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            )}

            {visiblePackages.length === 0 && !isLoading && (
              <Stack align="center" mt={50}>
                <FontAwesomeIcon
                  icon={faBoxOpen}
                  style={{ fontSize: 48, color: "var(--mantine-color-dark-4)" }}
                />
                <Text c="dimmed">No packages found matching "{search}"</Text>
              </Stack>
            )}
          </Stack>
        </ScrollArea>
      </Stack>

      {/* RIGHT: Detail Panel */}
      <Box
        w={400}
        h="100%"
        bg="dark.8"
        style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}
      >
        {selectedPackage ? (
          <>
            <Box
              p="md"
              style={{ borderBottom: "1px solid var(--mantine-color-dark-6)" }}
            >
              <Group justify="space-between" align="start">
                <Box style={{ flex: 1 }}>
                  <Text fw={700} size="lg">
                    {selectedPackage.name}
                  </Text>
                  <Badge size="sm" radius="sm" mt={4}>
                    {selectedPackage.id}
                  </Badge>
                </Box>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() => setSelectedPackage(null)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </ActionIcon>
              </Group>
            </Box>

            <ScrollArea h="100%" p="md" type="hover" offsetScrollbars>
              <Stack>
                {/* Description */}
                <Box>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>
                    Description
                  </Text>
                  <Text
                    size="sm"
                    style={{ whiteSpace: "pre-wrap" }}
                    dangerouslySetInnerHTML={{
                      __html: getDescription(selectedPackage),
                    }}
                  />
                </Box>

                <Divider />

                {/* Author */}
                <Box>
                  <Group gap="xs" mb={4}>
                    <FontAwesomeIcon
                      icon={faUser}
                      style={{
                        width: 12,
                        color: "var(--mantine-color-dimmed)",
                      }}
                    />
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                      Authors
                    </Text>
                  </Group>
                  <Text size="sm">
                    {getAuthorString(selectedPackage.authors)}
                  </Text>
                </Box>

                {/* License */}
                <Box>
                  <Group gap="xs" mb={4}>
                    <FontAwesomeIcon
                      icon={faCopyright}
                      style={{
                        width: 12,
                        color: "var(--mantine-color-dimmed)",
                      }}
                    />
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                      License
                    </Text>
                  </Group>
                  <Text size="sm">
                    {selectedPackage.license?.name || "Unknown"}
                  </Text>
                </Box>

                {/* Version */}
                {selectedPackage.version && (
                  <Box>
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>
                      Version
                    </Text>
                    <Text size="sm">
                      {selectedPackage.version.number}
                      {selectedPackage.version.date &&
                        ` (${selectedPackage.version.date})`}
                    </Text>
                  </Box>
                )}

                {/* Topics */}
                {selectedPackage.topics &&
                  selectedPackage.topics.length > 0 && (
                    <Box>
                      <Group gap="xs" mb={8}>
                        <FontAwesomeIcon
                          icon={faTag}
                          style={{
                            width: 12,
                            color: "var(--mantine-color-dimmed)",
                          }}
                        />
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                          Topics
                        </Text>
                      </Group>
                      <Group gap="xs">
                        {selectedPackage.topics.map((t) => (
                          <Badge
                            key={t.key}
                            size="sm"
                            variant="light"
                            color="blue"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setSelectedTopic(t.key);
                              setViewMode("list");
                            }}
                          >
                            {t.details}
                          </Badge>
                        ))}
                      </Group>
                    </Box>
                  )}

                <Divider />

                {/* Links */}
                <Stack gap="xs">
                  {selectedPackage.home && (
                    <Button
                      leftSection={<FontAwesomeIcon icon={faExternalLinkAlt} />}
                      variant="light"
                      size="sm"
                      component="a"
                      href={selectedPackage.home}
                      target="_blank"
                      fullWidth
                    >
                      Website
                    </Button>
                  )}
                  {selectedPackage.documentation?.[0] && (
                    <Button
                      leftSection={<FontAwesomeIcon icon={faExternalLinkAlt} />}
                      variant="default"
                      size="sm"
                      component="a"
                      href={selectedPackage.documentation[0].href.replace(
                        "ctan:",
                        "https://ctan.org/tex-archive/"
                      )}
                      target="_blank"
                      fullWidth
                    >
                      Documentation
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    component="a"
                    href={`https://ctan.org/pkg/${selectedPackage.id}`}
                    target="_blank"
                    fullWidth
                  >
                    View on CTAN
                  </Button>
                </Stack>
              </Stack>
            </ScrollArea>
          </>
        ) : (
          <Stack align="center" justify="center" h="100%" c="dimmed">
            <FontAwesomeIcon
              icon={faBoxOpen}
              style={{ fontSize: 48, opacity: 0.3 }}
            />
            <Text size="sm">Select a package to view details</Text>
          </Stack>
        )}
      </Box>
    </Group>
  );
};

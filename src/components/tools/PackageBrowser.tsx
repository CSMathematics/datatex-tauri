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
  Select,
  Divider,
  Checkbox,
  Tooltip,
} from "@mantine/core";
import { useInputState, useDebouncedValue } from "@mantine/hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faBoxOpen,
  faExternalLinkAlt,
  faTag,
  faTimes,
  faLayerGroup,
  faList,
  faWandMagicSparkles,
  faPlus,
  faInfo,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";

import {
  getAllPackages,
  ListPackage,
  hasWizard,
  getAllTopics,
} from "../../services/packageService";

interface PackageBrowserProps {
  onClose: () => void;
  onInsertPackage?: (code: string) => void;
  compact?: boolean;
}

type ViewMode = "list" | "grouped";

const ITEMS_PER_PAGE = 100;

// Helper functions moved outside component to avoid recreation on every render
const stripHtml = (html: string): string => {
  // Use regex instead of DOM manipulation for better performance
  return html.replace(/<[^>]*>/g, "").trim();
};

export const PackageBrowser: React.FC<PackageBrowserProps> = ({
  onClose,
  onInsertPackage,
  compact = false,
}) => {
  const [search, setSearch] = useInputState("");
  const [debouncedSearch] = useDebouncedValue(search, 150);
  // Selected package for detail view (null = none selected, storing just the ID)
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null
  );

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedPkgs, setSelectedPkgs] = useState<Set<string>>(new Set());

  const [filteredPackages, setFilteredPackages] = useState<ListPackage[]>([]);
  const [allTopics, setAllTopics] = useState<
    { value: string; label: string }[]
  >([]);
  const [totalPackages, setTotalPackages] = useState(0);

  // Load topics on mount
  useEffect(() => {
    getAllTopics().then((topics) => {
      setAllTopics(topics.map((t) => ({ value: t.key, label: t.label })));
    });
  }, []);

  // Fetch packages when search or topic changes
  useEffect(() => {
    const fetchData = async () => {
      const startTime = performance.now();
      try {
        const result = await getAllPackages(
          debouncedSearch,
          selectedTopic || undefined,
          ITEMS_PER_PAGE,
          0
        );
        const elapsed = performance.now() - startTime;
        console.log(
          `[PackageBrowser] Fetched ${
            result.total
          } packages in ${elapsed.toFixed(1)}ms`
        );
        setFilteredPackages(result.packages);
        setTotalPackages(result.total);
      } catch (error) {
        console.error("Failed to fetch packages:", error);
      }
    };

    fetchData();
  }, [debouncedSearch, selectedTopic]);

  const loadMore = async () => {
    try {
      const nextOffset = filteredPackages.length;
      const result = await getAllPackages(
        debouncedSearch,
        selectedTopic || undefined,
        ITEMS_PER_PAGE,
        nextOffset
      );
      setFilteredPackages((prev) => [...prev, ...result.packages]);
    } catch (err) {
      console.error(err);
    }
  };

  // Note: Topic grouping removed for performance - lightweight list items don't include topics
  // Use the topic filter dropdown instead to filter by topic

  const visiblePackages = useMemo(() => {
    return filteredPackages;
  }, [filteredPackages]);

  // Package Card Component (uses lightweight ListPackage)
  const PackageCard = ({ pkg }: { pkg: ListPackage }) => (
    <Card
      shadow="sm"
      padding="sm"
      radius="sm"
      withBorder
      bg={
        selectedPackageId === pkg.id
          ? "var(--mantine-color-default-hover)"
          : "var(--mantine-color-default)"
      }
      style={{
        cursor: "pointer",
        transition: "background-color 0.15s",
        borderColor:
          selectedPackageId === pkg.id
            ? "var(--mantine-color-teal-6)"
            : undefined,
      }}
      onClick={() => setSelectedPackageId(pkg.id)}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap={8} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          <Checkbox
            checked={selectedPkgs.has(pkg.id)}
            onChange={(e) => {
              e.stopPropagation(); // Prevent card selection
              const newSet = new Set(selectedPkgs);
              if (newSet.has(pkg.id)) newSet.delete(pkg.id);
              else newSet.add(pkg.id);
              setSelectedPkgs(newSet);
            }}
            size="xs"
            onClick={(e) => e.stopPropagation()}
          />
          <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
            <Group gap={4} wrap="nowrap">
              <Text fw={600} size="sm" truncate>
                {pkg.name}
              </Text>
              {hasWizard(pkg.id) && (
                <ThemeIcon size="xs" variant="light" color="violet" radius="xl">
                  <FontAwesomeIcon
                    icon={faWandMagicSparkles}
                    style={{ width: 8, height: 8 }}
                  />
                </ThemeIcon>
              )}
            </Group>
            {/* Caption only if not compact or if brief */}
            {!compact && (
              <Text size="xs" c="dimmed" lineClamp={2} mt={4}>
                {stripHtml(pkg.caption || "")}
              </Text>
            )}
          </Stack>
        </Group>
        {pkg.version && (
          <Badge
            size="xs"
            variant="dot"
            color="gray"
            style={{ alignSelf: "flex-start" }}
          >
            {pkg.version}
          </Badge>
        )}
      </Group>
    </Card>
  );

  return (
    <Stack h="100%" gap={0} style={{ overflow: "hidden" }}>
      {/* TOP: Package List (70%) */}
      <Stack
        gap={0}
        style={{
          flex: 7,
          minHeight: 0,
          borderBottom: "1px solid var(--mantine-color-default-border)",
        }}
      >
        {/* Header */}
        <Box
          p="md"
          bg="var(--mantine-color-body)"
          style={{
            borderBottom: "1px solid var(--mantine-color-default-border)",
          }}
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
                {totalPackages > 0 ? totalPackages : "?"}
              </Badge>
            </Group>
            <Group>
              {selectedPkgs.size > 0 && onInsertPackage && (
                <Button
                  size="xs"
                  color="teal"
                  variant="filled"
                  leftSection={<FontAwesomeIcon icon={faPlus} />}
                  onClick={() => {
                    const code = Array.from(selectedPkgs)
                      .map((id) => `\\usepackage{${id}}`)
                      .join("\n");
                    onInsertPackage(code + "\n");
                    setSelectedPkgs(new Set());
                  }}
                >
                  Insert {selectedPkgs.size}
                </Button>
              )}
              <ActionIcon
                onClick={onClose}
                variant="subtle"
                color="gray"
                size="lg"
              >
                <FontAwesomeIcon icon={faTimes} />
              </ActionIcon>
            </Group>
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
                {filteredPackages.length < totalPackages && (
                  <Button variant="subtle" size="xs" onClick={loadMore}>
                    Load More... ({totalPackages - filteredPackages.length}{" "}
                    remaining)
                  </Button>
                )}
              </>
            ) : null}

            {visiblePackages.length === 0 && (
              <Stack align="center" mt={50}>
                <FontAwesomeIcon
                  icon={faBoxOpen}
                  style={{ fontSize: 48, color: "var(--mantine-color-dimmed)" }}
                />
                <Text c="dimmed">No packages found matching "{search}"</Text>
              </Stack>
            )}
          </Stack>
        </ScrollArea>
      </Stack>

      {/* BOTTOM: Detail Panel (30%) */}
      <Box
        style={{
          flex: 3,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        bg="var(--mantine-color-body)"
      >
        {selectedPackageId ? (
          (() => {
            const pkg = filteredPackages.find(
              (p) => p.id === selectedPackageId
            );
            if (!pkg) return null;
            return (
              <>
                <Box
                  p="md"
                  style={{
                    borderBottom:
                      "1px solid var(--mantine-color-default-border)",
                  }}
                >
                  <Group justify="space-between" align="start">
                    <Box style={{ flex: 1 }}>
                      <Text fw={700} size="lg">
                        {pkg.name}
                      </Text>
                      <Badge size="sm" radius="sm" mt={4}>
                        {pkg.id}
                      </Badge>
                    </Box>

                    <Group
                      gap="xs"
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "stretch",
                      }}
                    >
                      {pkg.home && (
                        <Tooltip label="Visit Home Page">
                          <ActionIcon
                            variant="light"
                            size="sm"
                            component="a"
                            href={pkg.home}
                            target="_blank"
                          >
                            <FontAwesomeIcon icon={faGlobe} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      {pkg.ctan && (
                        <Tooltip label="Visit CTAN Page">
                          <ActionIcon
                            variant="default"
                            size="sm"
                            component="a"
                            href={`https://ctan.org/tex-archive${pkg.ctan}`}
                            target="_blank"
                          >
                            <FontAwesomeIcon icon={faExternalLinkAlt} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      <Tooltip label={`${pkg.id} Information`}>
                        <ActionIcon
                          variant="default"
                          size="sm"
                          component="a"
                          href={`https://ctan.org/pkg/${pkg.id}`}
                          target="_blank"
                        >
                          <FontAwesomeIcon icon={faInfo} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={() => setSelectedPackageId(null)}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </ActionIcon>
                  </Group>
                </Box>

                <ScrollArea h="100%" p="md" type="hover" offsetScrollbars>
                  <Stack>
                    {/* Caption/Description */}
                    <Box>
                      <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>
                        Description
                      </Text>
                      <Text size="sm">{stripHtml(pkg.caption)}</Text>
                    </Box>

                    {/* Version */}
                    {pkg.version && (
                      <Box>
                        <Text
                          size="xs"
                          fw={700}
                          c="dimmed"
                          tt="uppercase"
                          mb={4}
                        >
                          Version
                        </Text>
                        <Text size="sm">{pkg.version}</Text>
                      </Box>
                    )}

                    <Divider />

                    {/* Insert Package Button */}
                    {onInsertPackage && (
                      <Button
                        leftSection={<FontAwesomeIcon icon={faPlus} />}
                        variant="gradient"
                        gradient={{ from: "teal", to: "cyan" }}
                        size="sm"
                        fullWidth
                        onClick={() =>
                          onInsertPackage(`\\usepackage{${pkg.id}}\n`)
                        }
                      >
                        Insert \usepackage{`{${pkg.id}}`}
                      </Button>
                    )}

                    {pkg.hasWizard && (
                      <Badge
                        color="violet"
                        variant="light"
                        size="lg"
                        fullWidth
                        leftSection={
                          <FontAwesomeIcon icon={faWandMagicSparkles} />
                        }
                      >
                        Wizard Available
                      </Badge>
                    )}

                    <Divider />

                    {/* Links */}
                  </Stack>
                </ScrollArea>
              </>
            );
          })()
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
    </Stack>
  );
};

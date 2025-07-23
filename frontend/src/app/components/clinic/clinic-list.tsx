import {
  ActionIcon,
  Group,
  Input,
  NativeSelect,
  Popover,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";

import { useState } from "react";
import { SearchIcon } from "@/icons/search-icon";
import { FilterIcon } from "@/icons/filter-icon";
import { ChevronDownIcon } from "@/icons/chevron-down-icon";
import ClinicCard, { ClinicCardSkeleton } from "@components/clinic/clinic-card";
import { useClinicContext } from "@/context/clinic-context";

export default function ClinicList() {
  const [selectedType, setSelectedType] = useState<string>("All");
  const { clinics, loading, error, searchTerm, updateSearchTerm } =
    useClinicContext();

  const filteredClinics =
    selectedType === "All"
      ? clinics
      : clinics.filter((clinic) => clinic.type === selectedType);

  return (
    <Stack h="90vh" maw={450} mx="auto">
      <Input
        placeholder="Search clinics by name"
        value={searchTerm}
        onChange={(e) => updateSearchTerm(e.currentTarget.value)}
        rightSectionPointerEvents="all"
        rightSection={
          <ActionIcon variant="transparent" size="lg">
            <SearchIcon />
          </ActionIcon>
        }
      />

      {/* Filter and Type Select */}
      <Group justify="space-between" align="center">
        <Popover width={300} trapFocus position="bottom" withArrow shadow="md">
          <Popover.Target>
            <ActionIcon variant="transparent">
              <FilterIcon />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Text>test filter options</Text>
          </Popover.Dropdown>
        </Popover>

        <NativeSelect
          rightSection={<ChevronDownIcon size={16} />}
          data={["All", "Clinic", "Hospital", "Urgent Care"]}
          value={selectedType}
          onChange={(event) => setSelectedType(event.currentTarget.value)}
        />
      </Group>

      {/* Clinics List */}
      {loading ? (
        <ScrollArea>
          <Stack>
            {Array(3)
              .fill(0)
              .map((_, index) => (
                <ClinicCardSkeleton key={index} />
              ))}
          </Stack>
        </ScrollArea>
      ) : error ? (
        <Text>{error}</Text>
      ) : (
        <ScrollArea>
          <Stack>
            {filteredClinics.length > 0 ? (
              filteredClinics.map((clinic) => (
                <ClinicCard key={clinic.id} clinic={clinic} />
              ))
            ) : (
              <Text>No medical facilities found in this area.</Text>
            )}
          </Stack>
        </ScrollArea>
      )}
    </Stack>
  );
}

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
  const { clinics, loading, error } = useClinicContext();

  const filteredClinics =
    selectedType === "All"
      ? clinics
      : clinics.filter((c) => c.type === selectedType);

  return (
    <Stack h="90vh" maw={400}>
      <Input
        mr="sm"
        placeholder="Enter address to find nearest location"
        rightSectionPointerEvents="all"
        rightSection={
          <ActionIcon variant="transparent" size="lg">
            <SearchIcon />
          </ActionIcon>
        }
      />

      <Group justify="space-between" align="center" mr="sm">
        <Popover width={300} trapFocus position="bottom" withArrow shadow="md">
          <Popover.Target>
            <ActionIcon variant="transparent">
              <FilterIcon />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            {/* TODO: add filter options here */}
            <Text>test filter options</Text>
          </Popover.Dropdown>
        </Popover>

        <NativeSelect
          rightSection={<ChevronDownIcon size={16} />}
          data={["All", "Clinic", "Hospital", "Urgent Care"]}
          value={selectedType}
          onChange={(evt) => setSelectedType(evt.currentTarget.value)}
        />
      </Group>

      {loading ? (
        <ScrollArea>
          <Stack mr="sm">
            {Array.from({ length: 3 }).map((_, i) => (
              <ClinicCardSkeleton key={i} />
            ))}
          </Stack>
        </ScrollArea>
      ) : error ? (
        <Text>{error}</Text>
      ) : (
        <ScrollArea>
          <Stack mr="sm">
            {filteredClinics.length > 0 ? (
              filteredClinics.map((clinic) => (
                <div key={clinic.id}>
                  <ClinicCard clinic={clinic} />
                  <Text size="sm" color="dimmed" mt="xs">
                    {clinic.distance != null
                      ? `${(clinic.distance / 1000).toFixed(2)} km away`
                      : "Distance unknown"}
                  </Text>
                </div>
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

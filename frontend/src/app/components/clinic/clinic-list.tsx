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

import {useState} from "react";
import {SearchIcon} from "@/icons/search-icon";
import {FilterIcon} from "@/icons/filter-icon";
import {ChevronDownIcon} from "@/icons/chevron-down-icon";
import ClinicCard, {ClinicCardSkeleton} from "@components/clinic/clinic-card";
import ClinicInfoPanel from "@components/clinic/clinic-info";
import {useClinicContext} from "@/context/clinic-context";
import {Clinic} from "@models/clinic";

interface ClinicListProps {
  selectedClinic?: Clinic | null;
  onClinicSelect?: (clinic: Clinic) => void;
}

export default function ClinicList({selectedClinic, onClinicSelect}: ClinicListProps) {
    const [selectedType, setSelectedType] = useState<string>("All");
    const {clinics, loading, error, searchTerm, updateSearchTerm} =
        useClinicContext();

    const filteredClinics =
        selectedType === "All"
            ? clinics
            : clinics.filter((clinic) => clinic.type === selectedType);

    const handleMoreInfoClick = (clinic: Clinic) => {
        if (onClinicSelect) {
            onClinicSelect(clinic);
        }
    };

    const handleBackToList = () => {
        if (onClinicSelect) {
            onClinicSelect(null);
        }
    };

    // show info panel if a clinic is selected
    if (selectedClinic) {
        return (
            <ClinicInfoPanel
                clinic={selectedClinic}
                onBack={handleBackToList}
            />
        );
    }
    return (
        <Stack h="90vh" maw={450} mx="auto">
            <Input
                placeholder="Search clinics by name"
                value={searchTerm}
                onChange={(e) => updateSearchTerm(e.currentTarget.value)}
                rightSectionPointerEvents="all"
                rightSection={
                    <ActionIcon variant="transparent" size="lg">
                        <SearchIcon/>
                    </ActionIcon>
                }
            />

            {/* Filter and Type Select */}
            <Group justify="space-between" align="center">
                <Popover width={300} trapFocus position="bottom" withArrow shadow="md">
                    <Popover.Target>
                        <ActionIcon variant="transparent">
                            <FilterIcon/>
                        </ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown>
                        <Text>test filter options</Text>
                    </Popover.Dropdown>
                </Popover>

                <NativeSelect
                    rightSection={<ChevronDownIcon size={16}/>}
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
                                <ClinicCardSkeleton key={index}/>
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
                                <ClinicCard
                                    key={clinic.id}
                                    clinic={clinic}
                                    onMoreInfoClick={handleMoreInfoClick}
                                />
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

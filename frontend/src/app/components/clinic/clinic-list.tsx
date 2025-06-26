import {ActionIcon, Group, Input, NativeSelect, Popover, ScrollArea, Stack, Text} from "@mantine/core";

import {useState} from "react";
import {SearchIcon} from "@/icons/search-icon";
import {FilterIcon} from "@/icons/filter-icon";
import {ChevronDownIcon} from "@/icons/chevron-down-icon";
import ClinicCard, {ClinicCardSkeleton} from "@components/clinic/clinic-card";
import {useClinicContext} from "@/context/clinic-context";

function ClinicList() {
    const [selectedType, setSelectedType] = useState<string>('All');
    const {clinics, loading, error} = useClinicContext();

    const filteredClinics = selectedType === 'All'
        ? clinics
        : clinics.filter(clinic => clinic.type === selectedType);

    return (
        <>
            <Stack h="90vh" maw={400}>
                <Input
                    mr="sm"
                    placeholder="Enter address to find nearest location"
                    rightSectionPointerEvents="all"
                    rightSection={
                        <ActionIcon variant="transparent" size="lg">
                            {<SearchIcon/>}
                        </ActionIcon>
                    }
                >
                </Input>
                <Group justify="space-between" align="center" mr="sm">
                    <Popover width={300} trapFocus position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <ActionIcon variant="transparent"><FilterIcon/></ActionIcon>
                        </Popover.Target>
                        <Popover.Dropdown>
                            {/*TODO: add filter options here*/}
                            <Text>
                                test filter options
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                    <NativeSelect
                        rightSection={
                            <ChevronDownIcon size={16}/>
                        }
                        data={['All', 'Clinic', 'Hospital', 'Urgent Care']}
                        value={selectedType}
                        onChange={(event) => setSelectedType(event.currentTarget.value)}
                    />
                </Group>

                {loading ? (
                    <ScrollArea>
                        <Stack mr="sm">

                           {/* Display 3 skeleton cards while loading */}
                            {Array(3).fill(0).map((_, index) => (
                               <ClinicCardSkeleton key={index}/>
                            ))}
                        </Stack>
                    </ScrollArea>
                ) : error ? (
                    <Text>{error}</Text>
                ) : (
                    <ScrollArea>
                        <Stack mr="sm">
                            {filteredClinics.length > 0 ? (
                                filteredClinics.map(clinic => (
                                    <ClinicCard key={clinic.id} clinic={clinic}/>
                                ))
                            ) : (
                                <Text>No medical facilities found in this area.</Text>
                            )}
                        </Stack>
                    </ScrollArea>
                )}
            </Stack>
        </>
    );
}

export default ClinicList;

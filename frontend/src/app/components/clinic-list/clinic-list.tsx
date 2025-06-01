import {ActionIcon, Group, Input, NativeSelect, Popover, ScrollArea, Stack, Text} from "@mantine/core";


import ClinicCard from "../clinic-card/clinic-card";

import {useState} from "react";
import {mockClinics} from "@/data/mock-clinics";
import {SearchIcon} from "@/icons/search-icon";
import {FilterIcon} from "@/icons/filter-icon";
import {ChevronDownIcon} from "@/icons/chevron-down-icon";

function ClinicList() {
    const [selectedType, setSelectedType] = useState<string>('All');

    const filteredClinics = selectedType === 'All'
        ? mockClinics
        : mockClinics.filter(clinic => clinic.type === selectedType);

    return (
        <>
            <Stack h="100%">
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
                <ScrollArea>
                    <Stack mr="sm">
                        {filteredClinics.map(clinic => (
                            <ClinicCard key={clinic.id} clinic={clinic}/>
                        ))}
                    </Stack>
                </ScrollArea>
            </Stack>
        </>
    );
}

export default ClinicList;
// TODO: scroll area?
import {ActionIcon, Group, Input, NativeSelect, Popover, Stack, Text} from "@mantine/core";
import {SearchIcon} from "./icons/SearchIcon";
import {ChevronDownIcon} from "./icons/ChevronDownIcon";
import ClinicCard from "./ClinicCard";
import {FilterIcon} from "./icons/FilterIcon";

function ClinicList() {
    const icon = <SearchIcon/>;
    const chevronIcon = <ChevronDownIcon size={16}/>;
    return (
        <>
            <Stack>
                <Input
                    placeholder="Enter address to find nearest location"
                    rightSectionPointerEvents="all"
                    rightSection={
                        <ActionIcon variant="transparent" size="lg">
                            {icon}
                        </ActionIcon>
                    }
                >
                </Input>
                <Group justify="space-between" align="center">
                    <Popover width={300} trapFocus position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <ActionIcon variant="transparent"><FilterIcon/></ActionIcon>
                        </Popover.Target>
                        <Popover.Dropdown>
                            {/*TODO: add filter options here*/}
                            <Text>
                                test for popover
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                    <NativeSelect
                        rightSection={chevronIcon}
                        data={['Clinic', 'Hospital']}
                    />
                </Group>
                <Stack>
                    <ClinicCard></ClinicCard>
                </Stack>
            </Stack>
        </>
    );
}

export default ClinicList;
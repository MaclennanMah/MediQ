'use client'

import {useDisclosure} from '@mantine/hooks';
import {AppShell, Burger, Group} from "@mantine/core";
import ClinicList from "./ClinicList";

function BasicAppShell() {
    const [opened, {toggle}] = useDisclosure();

    return (
        <AppShell
            header={{height: 60}}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md">
                    <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm"/>
                </Group>
            </AppShell.Header>
            <AppShell.Main>Main</AppShell.Main>
            <AppShell.Aside p="md">
                <ClinicList/>
            </AppShell.Aside>
        </AppShell>
    );

}

export default BasicAppShell;
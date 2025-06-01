'use client'

import {useDisclosure} from '@mantine/hooks';
import {AppShell} from "@mantine/core";
import ClinicList from "@components/clinic-list/clinic-list";


function BasicAppShell() {
    const [opened, {toggle}] = useDisclosure();

    return (
        <AppShell
            header={{height: 60}}
            padding="md"
        >
            <AppShell.Header>
            </AppShell.Header>
            <AppShell.Main>Main</AppShell.Main>
            <AppShell.Aside p="md">
                <ClinicList/>
            </AppShell.Aside>
        </AppShell>
    );

}

export default BasicAppShell;

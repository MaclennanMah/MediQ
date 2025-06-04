'use client';

import {AppShell, Group} from "@mantine/core";
import ClinicList from "@components/clinic/clinic-list";

import dynamic from "next/dynamic";
const LazyMap = dynamic(() => import("@/components/clinic/clinic-map"), {
    ssr: false,
    loading: () => <p>Loading...</p>,
});

function App() {

    return (
        <AppShell
            header={{height: 60}}
            padding="md"
        >
            <AppShell.Header>
            </AppShell.Header>

            <AppShell.Main >
                <Group>
                <LazyMap/>
                <ClinicList/>
            </Group>
            </AppShell.Main>
        </AppShell>
    );

}

export default App;

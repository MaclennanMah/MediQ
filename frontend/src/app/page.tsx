'use client';

import {AppShell, Group} from "@mantine/core";
import ClinicList from "@components/clinic/clinic-list";
import {ClinicProvider} from "@/context/clinic-context";

import dynamic from "next/dynamic";

const ClinicMap = dynamic(() => import("@/components/clinic/clinic-map"), {
    ssr: false,
    loading: () => <p>Loading...</p>,
});

function App() {
    return (
        <ClinicProvider>
            <AppShell
                header={{height: 60}}
                padding={0}
            >
                {/*<AppShell.Header>*/}
                {/*</AppShell.Header>*/}

                <AppShell.Main>
                    <Group>
                        <ClinicMap/>
                        <ClinicList/>
                    </Group>
                </AppShell.Main>
            </AppShell>
        </ClinicProvider>
    );
}

export default App;

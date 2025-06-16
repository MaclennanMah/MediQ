'use client';

import {AppShell, Group, useMantineColorScheme, ActionIcon, Box} from "@mantine/core";
import {IconSun, IconMoon} from '@tabler/icons-react';
import ClinicList from "@components/clinic/clinic-list";
import {ClinicProvider} from "@/context/clinic-context";
import dynamic from "next/dynamic";
import Image from "next/image";
import {ThemeLogo} from "@/components/ui/ThemeLogo";

const ClinicMap = dynamic(() => import("@/components/clinic/clinic-map"), {
    ssr: false,
    loading: () => <p>Loading...</p>,
});

function App() {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();

    return (
        <ClinicProvider>
            <AppShell
                header={{height: 80}}
                padding={0} >

                <AppShell.Header
                    className={`${colorScheme === 'dark' ? 'dark-header' : 'light-header'}`}>
                    <Box className="header-container">
                        <div className="logo-wrapper">
                            <ThemeLogo />
                        </div>
                        {/*switch dark and light mode*/}
                        <ActionIcon
                            className="theme-toggle"
                            variant="subtle"
                            onClick={() => toggleColorScheme()}
                            aria-label="Toggle color scheme"
                            size="sm">
                            {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
                        </ActionIcon>
                    </Box>
                </AppShell.Header>

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

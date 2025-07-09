'use client';

import { Image, useMantineColorScheme } from '@mantine/core';

export function ThemeLogo() {
    const { colorScheme } = useMantineColorScheme();

    return (
        <Image
            src={colorScheme === 'dark'
                ? "/assets/logos/MediQ_Logo_Light-header.svg"
                : "/assets/logos/MediQ_Logo_Dark-header.svg"}
            alt="MediQ Logo"
            width={150}
            height={150}
        />
    );
}
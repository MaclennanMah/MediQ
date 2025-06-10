import '@mantine/core/styles.css';
import {ColorSchemeScript, mantineHtmlProps, MantineProvider} from '@mantine/core';
import './globals.css';
import { Header } from '@components/ui/header';
import Undici from "undici-types";
import Headers = Undici.Headers;

export const metadata = {
    title: 'MediQ',
    description: 'Hospital and clinic wait times',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" {...mantineHtmlProps}>
        <head>
            <title>MediQ</title>
            <ColorSchemeScript/>
        </head>
        <body>
            <Header />
            <MantineProvider>
                {children}
            </MantineProvider>
        </body>
        </html>
    );
}
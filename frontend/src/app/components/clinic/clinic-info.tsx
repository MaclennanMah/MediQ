"use client";

import React from "react";
import {
    Stack,
    Text,
    Group,
    Badge,
    Button,
    Divider,
    Box,
    ScrollArea,
    ActionIcon,
    Skeleton,
} from "@mantine/core";
import {
    IconMapPin,
    IconClock,
    IconWorld,
    IconPhone,
    IconArrowLeft,
    IconHourglassEmpty,
    IconMapPin2,
} from "@tabler/icons-react";
import { Clinic } from "@/models/clinic";
import { useClinicAddress } from "@/utils/address";
import { convertTimeRangeTo12Hour, determineOpenStatus, parseOpeningHours } from "@/utils/time";

interface ClinicInfoPanelProps {
    clinic: Clinic;
    onBack: () => void;
}

function waitTimeColour(wt: string) {
    const n = parseInt(wt);
    if (isNaN(n)) return "gray";
    if (n < 15) return "green";
    if (n < 30) return "yellow";
    return "red";
}

function formatOperatingHours(hours?: string) {
    const parsed = parseOpeningHours(hours);

    if (parsed) {
        // convert to 12-hour format
        return parsed.map(schedule => ({
            ...schedule,
            hours: convertTimeRangeTo12Hour(schedule.hours)
        }));
    }

    return null;
}

export default function ClinicInfoPanel({
                                            clinic,
                                            onBack,
                                        }: ClinicInfoPanelProps) {
    const colour = waitTimeColour(clinic.estimatedWaitTime);
    const operatingHours = formatOperatingHours(clinic.hours);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${clinic.location.lat},${clinic.location.lng}`;

    // get accurate open/closed status
    const { isOpen, hasData } = determineOpenStatus(clinic.hours);

    // use hook to get address
    const { address, loading: addressLoading} = useClinicAddress(clinic);

    // calc distance display
    const distanceKm =
        clinic.distance != null && typeof clinic.distance === "number"
            ? (clinic.distance / 1000).toFixed(2)
            : null;

    return (
        <Stack h="90vh" maw={450} mx="auto">
            {/* Header with back button */}
            <Group>
                <ActionIcon
                    variant="subtle"
                    onClick={onBack}
                    size="lg"
                >
                    <IconArrowLeft size={20} />
                </ActionIcon>
                <Text size="sm" c="dimmed">Back to list</Text>
            </Group>

            <ScrollArea flex={1}>
                <Stack gap="lg" p="xs">
                    {/* Clinic Name */}
                    <Text
                        className="montserrat-bold"
                        size="xl"
                        ta="center"
                        lineClamp={2}
                    >
                        {clinic.name}
                    </Text>

                    {/* Clinic Type and Status Badges */}
                    <Group justify="center" gap="sm">
                        <Badge color="blue" variant="light" size="lg">
                            <Text size="sm" tt="uppercase">
                                {clinic.type}
                            </Text>
                        </Badge>
                        {/* only show open/closed badge if we have hours data */}
                        {hasData && (
                            <Badge
                                color={isOpen ? "green" : "red"}
                                variant="light"
                                size="lg"
                            >
                                <Text size="sm" tt="uppercase">
                                    {isOpen ? "Open Now" : "Closed"}
                                </Text>
                            </Badge>
                        )}
                    </Group>

                    {/* Distance */}
                    {distanceKm && (
                        <Group justify="center">
                            <Text size="sm" c="dimmed">
                                {distanceKm} km away from you
                            </Text>
                        </Group>
                    )}

                    <Stack gap="md">
                        {/* Address */}
                        <Group gap="sm" align="flex-start">
                            <IconMapPin size={20} style={{marginTop: 2, flexShrink: 0}}/>
                            <Box flex={1}>
                                <Text size="sm" fw={600} mb={2}>
                                    Address
                                </Text>
                                {addressLoading ? (
                                    <Skeleton height={40} radius={"sm"} />
                                ) : (
                                    <Text size="sm" c="dimmed">
                                        {address|| "Address not available"}
                                    </Text>
                                )}
                            </Box>
                        </Group>

                        {/* Operating Hours */}
                        <Group gap="sm" align="flex-start">
                            <IconClock size={20} style={{marginTop: 2, flexShrink: 0}}/>
                            <Box flex={1}>
                                <Text size="sm" fw={600} mb={4}>
                                    Operating Hours
                                </Text>
                                <Stack gap={2}>
                                    {operatingHours ? (
                                        // show actual hours when available in 12-hour format
                                        operatingHours.map((schedule) => (
                                            <Group justify="space-between" key={schedule.day}>
                                                <Text size="sm">{schedule.day}</Text>
                                                <Text size="sm" c="dimmed">{schedule.hours}</Text>
                                            </Group>
                                        ))
                                    ) : (
                                        // show generic message only when no hours data is available
                                        <>
                                            <Text size="sm" c="orange" fw={500} mb={4}>
                                                Coming Soon! Hours data not available from OpenStreetMap.
                                            </Text>
                                            <Group justify="space-between">
                                                <Text size="sm">For current hours:</Text>
                                                <Text size="sm" c="blue">Call facility directly</Text>
                                            </Group>
                                            <Group justify="space-between">
                                                <Text size="sm">General hours:</Text>
                                                <Text size="sm" c="dimmed">Varies by facility type</Text>
                                            </Group>
                                            <Box mt={8} p={8} style={{ background: '#f8f9fa', borderRadius: '4px' }}>
                                                <Text size="xs" c="dimmed">
                                                    <strong>Note:</strong> {clinic.type === 'Hospital'
                                                    ? 'Emergency departments typically operate 24/7'
                                                    : clinic.type === 'Urgent Care'
                                                        ? 'Urgent care usually: 8AM-8PM daily'
                                                        : 'Walk-in clinics typically: 9AM-5PM weekdays'
                                                }
                                                </Text>
                                            </Box>
                                        </>
                                    )}
                                </Stack>
                            </Box>
                        </Group>

                        {/* Website */}
                        <Group gap="sm" align="flex-start">
                            <IconWorld size={20} style={{marginTop: 2, flexShrink: 0}}/>
                            <Box flex={1}>
                                <Text size="sm" fw={600} mb={2}>
                                    Website
                                </Text>
                                {clinic.contact?.website ||
                                (clinic as any).website ||
                                (clinic as any).tags?.website ||
                                (clinic as any).tags?.["contact:website"] ? (
                                    <Text
                                        size="sm"
                                        c="blue"
                                        component="a"
                                        href={
                                            clinic.contact?.website ||
                                            (clinic as any).website ||
                                            (clinic as any).tags?.website ||
                                            (clinic as any).tags?.["contact:website"]
                                        }
                                        target="_blank"
                                        style={{textDecoration: "underline"}}
                                    >
                                        {(
                                            clinic.contact?.website ||
                                            (clinic as any).website ||
                                            (clinic as any).tags?.website ||
                                            (clinic as any).tags?.["contact:website"]
                                        )?.replace(/^https?:\/\//, '')}
                                    </Text>
                                ) : (
                                    <Text size="sm" c="dimmed">
                                        Website is currently not available at this time.
                                    </Text>
                                )}
                            </Box>
                        </Group>

                        {/* Phone Number */}
                        <Group gap="sm" align="flex-start">
                            <IconPhone size={20} style={{marginTop: 2, flexShrink: 0}}/>
                            <Box flex={1}>
                                <Text size="sm" fw={600} mb={2}>
                                    Phone
                                </Text>
                                {clinic.contact?.phone && clinic.contact.phone !== "Not available" ? (
                                    <Text
                                        size="sm"
                                        c="blue"
                                        component="a"
                                        href={`tel:${clinic.contact.phone}`}
                                        style={{textDecoration: "underline"}}
                                    >
                                        {clinic.contact.phone}
                                    </Text>
                                ) : (
                                    <Text size="sm" c="dimmed">
                                        Phone number is currently not available at this time.
                                    </Text>
                                )}
                            </Box>
                        </Group>

                        <Divider my="md"/>

                        {/* Current Wait Time */}
                        <Box>
                            <Text size="lg" fw={600} mb="sm">
                                Current Wait Time:
                            </Text>
                            <Group justify="space-between" align="center">
                                <Text size="sm">
                                    Currently at the Clinic?
                                </Text>
                                <Badge color={colour} size="xl" variant="filled">
                                    <Text size="lg" fw={700}>
                                        {clinic.estimatedWaitTime}
                                    </Text>
                                </Badge>
                            </Group>
                        </Box>

                        {/* Action Buttons */}
                        <Stack gap="sm" mt="md">
                            <Button
                                color="blue"
                                size="md"
                                radius="md"
                                leftSection={<IconHourglassEmpty size={20}/>}
                            >
                                Suggest Wait Time
                            </Button>
                            <Button
                                color="blue"
                                size="md"
                                radius="md"
                                variant="outline"
                                leftSection={<IconMapPin2 size={20}/>}
                                component="a"
                                href={mapsUrl}
                                target="_blank"
                            >
                                Get Directions
                            </Button>
                        </Stack>
                    </Stack>
                </Stack>
            </ScrollArea>
        </Stack>
    );
}
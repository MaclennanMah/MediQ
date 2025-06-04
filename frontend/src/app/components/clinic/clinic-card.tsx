import {Badge, Button, Card, Group, Stack, Text} from '@mantine/core';
import {Clinic} from '@models/clinic';

interface ClinicCardProps {
    clinic: Clinic;
}

function ClinicCard({clinic}: ClinicCardProps) {
    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
                <Group justify="flex-start" align="center" p="md">
                    <Badge color="blue" variant="light">
                        <Text size="xs" c="dimmed">
                            {clinic.type}
                        </Text>
                    </Badge>
                    <Badge color={clinic.isOpen ? "green" : "red"} variant="light">
                        <Text size="xs" c="dimmed">
                            {clinic.isOpen ? "OPEN" : "CLOSED"}
                        </Text>
                    </Badge>
                </Group>
            </Card.Section>

            <Group justify="space-between" mb="xs">
                <Text fw={500}>{clinic.name}</Text>
                <Badge color="pink">{clinic.estimatedWaitTime}</Badge>
            </Group>
            <Stack gap="0">
                <Text>Distance: {clinic.distance}</Text>
                <Text>Closing time: {clinic.closingTime}</Text>
            </Stack>
            <Group>
                <Button color="blue" mt="md" radius="md">
                    Directions
                </Button>
                <Button color="blue" mt="md" radius="md">
                    Website
                </Button>
                <Button color="blue" mt="md" radius="md">
                    More info
                </Button>
            </Group>

        </Card>
    );
}

export default ClinicCard;
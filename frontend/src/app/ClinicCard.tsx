import {Badge, Button, Card, Group, Stack, Text} from '@mantine/core';

function ClinicCard() {
    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
                <Group justify="flex-start" align="center" p="md">
                    <Badge color="blue" variant="light">
                        <Text size="xs" c="dimmed">
                            {/*TODO: Replace with dynamic clinic type*/}
                            Hospital
                        </Text>
                    </Badge>
                    <Badge color="blue" variant="light">
                        <Text size="xs" c="dimmed">
                            {/*TODO: Replace with dynamic status OPEN/CLOSED*/}
                            OPEN
                        </Text>
                    </Badge>
                </Group>
            </Card.Section>

            <Group justify="space-between" mb="xs">
                <Text fw={500}>Toronto Western Hospital</Text>
                <Badge color="pink">1h 5m</Badge>
            </Group>
            <Stack gap="0">
                <Text>Distance</Text>
                <Text>Closing time</Text>
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
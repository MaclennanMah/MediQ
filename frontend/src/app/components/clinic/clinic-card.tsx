import {
  Badge,
  Button,
  Card,
  Group,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { Clinic } from "@models/clinic";

interface ClinicCardProps {
  clinic: Clinic;
}

export function ClinicCardSkeleton() {
  return (
    <Card shadow="sm" padding="lg" radius="md" miw={436} withBorder>
      <Card.Section>
        <Group justify="flex-start" align="center" p="md">
          <Skeleton height={20} width={62} radius="sm" />
          <Skeleton height={20} width={62} radius="sm" />
        </Group>
      </Card.Section>

      <Group justify="space-between" mb="xs">
        <Skeleton height={25} width={150} radius="sm" />
        <Skeleton height={20} width={42} radius="sm" />
      </Group>
      <Stack gap="0">
        <Skeleton height={24} width="70%" radius="sm" />
        <Skeleton height={24} width="60%" radius="sm" />
      </Stack>
      <Group>
        <Skeleton height={36} width={100} mt="md" radius="md" />
        <Skeleton height={36} width={100} mt="md" radius="md" />
        <Skeleton height={36} width={100} mt="md" radius="md" />
      </Group>
    </Card>
  );
}

// Kilometers function
function ClinicCard({ clinic }: ClinicCardProps) {
  const distanceKm =
    clinic.distance != null ? (clinic.distance / 1000).toFixed(2) : null;

  return (
    <Card shadow="sm" padding="lg" radius="md" miw={436} withBorder>
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
        <Text>
          {distanceKm ? `Distance: ${distanceKm} km away` : "Distance: unknown"}
        </Text>
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

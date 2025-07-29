"use client";

import React from "react";
import {
  Badge,
  Button,
  Card,
  Group,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconMapPin2,
  IconHourglassEmpty,
  IconInfoCircle,
  IconClockHour2,
  IconUserPin,
} from "@tabler/icons-react";
import { Clinic } from "@/models/clinic";

/* ─────────────────────────── Skeleton ─────────────────────────── */
export function ClinicCardSkeleton() {
  return (
    <Card shadow="sm" p="lg" radius="md" miw={436} withBorder>
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

/* ─────────────────────────── Helpers ─────────────────────────── */
function waitTimeColour(wt: string) {
  const n = parseInt(wt); // crude “30m” → 30
  if (isNaN(n)) return "gray";
  if (n < 15) return "green";
  if (n < 30) return "yellow";
  return "red";
}

/* ─────────────────────────── Card ─────────────────────────── */
interface ClinicCardProps {
  clinic: Clinic;
  onMoreInfoClick: (clinic: Clinic) => void;
}

export default function ClinicCard({ clinic }: { clinic: Clinic }) {
  const distanceKm =
    clinic.distance != null && typeof clinic.distance === "number"
      ? (clinic.distance / 1000).toFixed(2)
      : clinic.distance; // fallback to string

  const colour = waitTimeColour(clinic.estimatedWaitTime);
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${clinic.location.lat},${clinic.location.lng}`;

  return (
    <Card shadow="sm" p="lg" radius="md" miw={450} withBorder>
      {/* ── Labels ─────────────────────────────────────────────── */}
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

      {/* ── Name + Wait-time badge ─────────────────────────────── */}
      <Group justify="space-between" mb="xs">
        <Text
          className="montserrat-bold"
          fz="lg"
          style={{ flex: 1, minWidth: 0 }}
          lineClamp={2}
        >
          {clinic.name}
        </Text>

        <Badge color={colour} style={{ flexShrink: 0, alignSelf: "center" }}>
          {clinic.estimatedWaitTime}
        </Badge>
      </Group>

      {/* ── Distance & Closing Time ────────────────────────────── */}
      <Stack gap={2}>
        <Group gap="xs">
          <IconUserPin size={16} />
          <Text size="sm">
            {distanceKm ? `${distanceKm} km away from you` : "Distance unknown"}
          </Text>
        </Group>
        <Group gap="xs">
          <IconClockHour2 size={16} />
          <Text size="sm">Closes at {clinic.closingTime}</Text>
        </Group>
      </Stack>

      {/* ── NEW: Services / Hours / Contact ────────────────────── */}
      {clinic.services && clinic.services.length > 0 && (
        <Text size="sm" mt="sm">
          <b>Services:</b> {clinic.services.join(", ")}
        </Text>
      )}

      {clinic.hours && (
        <Text size="sm">
          <b>Hours:</b> {clinic.hours}
        </Text>
      )}

      {clinic.contact && (clinic.contact.phone || clinic.contact.email) && (
        <Text size="sm">
          {clinic.contact.phone && (
            <>
              📞 {clinic.contact.phone}
              <br />
            </>
          )}
          {clinic.contact.email && (
            <>
              ✉️ {clinic.contact.email}
              <br />
            </>
          )}
        </Text>
      )}

      {/* ── Buttons ────────────────────────────────────────────── */}
      <Group justify="center" mt="md">
        <Button
          color="blue"
          radius="md"
          h={60}
          w={125}
          p="xs"
          component="a"
          href={mapsUrl}
          target="_blank"
        >
          <Stack gap={4} align="center">
            <IconMapPin2 size={20} />
            <Text className="montserrat-med" size="xs">
              DIRECTIONS
            </Text>
          </Stack>
        </Button>

        <Button color="blue" radius="md" h={60} w={125} p="xs">
          <Stack gap={4} align="center">
            <IconHourglassEmpty size={20} />
            <Text className="montserrat-med" size="xs">
              SUGGEST&nbsp;TIME
            </Text>
          </Stack>
        </Button>

        <Button color="blue" radius="md" h={60} w={125} p="xs">
          <Stack gap={4} align="center">
            <IconInfoCircle size={20} />
            <Text className="montserrat-med" size="xs">
              MORE&nbsp;INFO
            </Text>
          </Stack>
        </Button>
      </Group>
    </Card>
  );
}

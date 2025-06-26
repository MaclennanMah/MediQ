"use client";

import React from 'react';
import { Badge, Button, Card, Text, Skeleton } from '@mantine/core';
import { Clinic } from '@/models/clinic';

/* optional skeleton */
export function ClinicCardSkeleton() {
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Skeleton height={16} width="40%" mb="sm" />
      <Skeleton height={14} width="70%" mb="xs" />
      <Skeleton height={80} />
    </Card>
  );
}

export default function ClinicCard({ clinic }: { clinic: Clinic }) {
  // choose badge colour from estimatedWaitTime
  const num = parseInt(clinic.estimatedWaitTime); // crude parse “30m” → 30
  const colour =
    isNaN(num)   ? 'gray'  :
    num < 15     ? 'green' :
    num < 30     ? 'yellow': 'red';

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${clinic.location.lat},${clinic.location.lng}`;

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder mb="md">
      {/* header badges */}
      <div style={{ display: 'flex', gap: 6 }}>
        <Badge>{clinic.type}</Badge>
        <Badge color={clinic.isOpen ? 'green' : 'red'}>
          {clinic.isOpen ? 'OPEN' : 'CLOSED'}
        </Badge>
      </div>

      {/* name + wait */}
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0 8px' }}>
        <Text fw={600}>{clinic.name}</Text>
        <Badge color={colour}>{clinic.estimatedWaitTime}</Badge>
      </div>

      <Text size="sm" mb={4}>Distance: {clinic.distance}</Text>
      <Text size="sm" mb={4}>Closes: {clinic.closingTime}</Text>

      {/* NEW INFO */}
      {clinic.services && (
        <Text size="sm" mb={4}>
          <b>Services:</b> {clinic.services.join(', ')}
        </Text>
      )}

      {clinic.hours && (
        <Text size="sm" mb={4}>
          <b>Hours:</b> {clinic.hours}
        </Text>
      )}

      {clinic.contact && (
        <Text size="sm" mb={4}>
          {clinic.contact.phone && <>📞 {clinic.contact.phone}<br/></>}
          {clinic.contact.email && <>✉️ {clinic.contact.email}<br/></>}
        </Text>
      )}

      {/* actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="xs" component="a" href={mapsUrl} target="_blank">
          Directions
        </Button>
      </div>
    </Card>
  );
}

"use client";

import React, { useEffect } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import { blueIcon } from "leaflet-color-markers";
import { useClinicContext } from "@/context/clinic-context";
import { createTablerIcon } from '@/utils/map-icons';
import { IconUserFilled } from '@tabler/icons-react';
import {useMantineColorScheme} from "@mantine/core";

export default function UserLocationMarker() {
  const { userLocation } = useClinicContext();
  const map = useMap();
  const { colorScheme } = useMantineColorScheme();

  const userIcon = createTablerIcon(
      <IconUserFilled
          size={36}
          color={colorScheme === 'dark' ? '#9dffb5' : '#00b894'}
      />,
      36, 18, 36
  );

  // Optional: pan/zoom to the user’s position once it’s known
  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], map.getZoom());
    }
  }, [userLocation, map]);

  if (!userLocation) {
    return null;
  }

  return (
    <Marker position={[userLocation.lat, userLocation.lng]} icon={blueIcon}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

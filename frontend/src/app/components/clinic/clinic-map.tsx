"use client";

import React, {useEffect, useState} from "react";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useClinicContext } from "@/context/clinic-context";
import { Icon } from "leaflet";
import { useMantineColorScheme } from '@mantine/core';
import { createTablerIcon } from "@utils/map-icons";
import {
  IconMapPinFilled,
  IconFlag3Filled,
  IconUserFilled
} from "@tabler/icons-react";
import { GeolocationControl } from './geolocation-control';

function MapEventHandler() {
  const { updateMapBounds } = useClinicContext();
  const map = useMap();

  useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const southWest = bounds.getSouthWest();
      const northEast = bounds.getNorthEast();

      // Format: [south, west, north, east]
      updateMapBounds([
        southWest.lat,
        southWest.lng,
        northEast.lat,
        northEast.lng,
      ]);
    },
  });

  useEffect(() => {
    const bounds = map.getBounds();
    const southWest = bounds.getSouthWest();
    const northEast = bounds.getNorthEast();

    updateMapBounds([
      southWest.lat,
      southWest.lng,
      northEast.lat,
      northEast.lng,
    ]);
  }, [map, updateMapBounds]);

  return null;
}

function AutoCenterOnUser() {
  const { userLocation } = useClinicContext();
  const map = useMap();
  const [hasAutocentered, setHasAutocentered] = useState(false);

  useEffect(() => {
    // only auto-center once when user location is available
    if (userLocation && !hasAutocentered) {
      map.flyTo([userLocation.lat, userLocation.lng], 15, {
        duration: 1.5
      });
      setHasAutocentered(true);
    }
  }, [userLocation, map, hasAutocentered]);

  return null;
}

function ClinicMap() {
  const { clinics, userLocation } = useClinicContext();
  const { colorScheme } = useMantineColorScheme();

  // Default center for Toronto
  const defaultCenter = [43.6532, -79.3832];

  // !! map icons !!
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);

  // theme colors
  const colors = {
    primary: colorScheme === 'dark' ? '#74b9ff' : '#005BA9',
    selected: colorScheme === 'dark' ? '#ff6b6b' : '#ff0000',
    user: colorScheme === 'dark' ? '#9dffb5' : '#00b894'
  };

  // create map icons
  const clinicIcon = createTablerIcon(
    <IconMapPinFilled
        size={32}
        color={colors.primary}
        strokeWidth={2}
    />,
      32, 16, 32
  );

  const selectedIcon = createTablerIcon(
    <IconFlag3Filled
        size={40}
        color={colors.selected}
    />,
    40, 20, 40
  );

  const userLocationIcon = createTablerIcon(
    <IconUserFilled
        size={36}
        color={colors.user}
        strokeWidth={1.5}
    />,
    36, 18, 36
  );

  return (
    <>
      <MapContainer
        center={defaultCenter as [number, number]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer // using Stadia Alidade Smooth style
            attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
            url={
              colorScheme === 'dark'
                  ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                  : "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
            }
            key={colorScheme}
        />

        {/* Add markers for each clinic */}
        {clinics.map((clinic) => (
          <Marker
            // icon={markerIcon}
            key={clinic.id}
            position={
              clinic.location
                ? [clinic.location.lat, clinic.location.lng]
                : (defaultCenter as [number, number])
            }
            icon={selectedClinic === clinic.id ? selectedIcon : clinicIcon}
            eventHandlers={{
              click: () => {
                setSelectedClinic(clinic.id);
              },
            }}
          >
            <Popup>
              <div>
                <h3>{clinic.name}</h3>
                <p>Type: {clinic.type}</p>
                <p>Status: {clinic.isOpen ? "Open" : "Closed"}</p>
                <p>Closing Time: {clinic.closingTime}</p>
                <p>Wait Time: {clinic.estimatedWaitTime}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* “You are here” marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userLocationIcon}
          >
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* Component to handle map events */}
        <MapEventHandler />
        <AutoCenterOnUser />
        <GeolocationControl />
      </MapContainer>
    </>
  );
}

export default ClinicMap;

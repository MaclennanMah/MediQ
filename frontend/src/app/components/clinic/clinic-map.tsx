"use client";

import React, { useEffect } from "react";
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

// Existing clinic pin
const clinicIcon = new Icon({
  iconUrl: "/assets/map_icon.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// “You are here” pin, using the blue marker images
const userIcon = new Icon({
  iconUrl: "/assets/marker-icon-2x-blue.png",
  shadowUrl: "/assets/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

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

function ClinicMap() {
  const { clinics, userLocation } = useClinicContext();
  const { colorScheme } = useMantineColorScheme();

  // Default center for Toronto
  const defaultCenter = [43.6532, -79.3832];

  const markerIcon = new Icon({
    iconUrl: "/assets/map_icon.png",
    iconSize: [32, 32],
  });
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
            icon={markerIcon}
            key={clinic.id}
            position={
              clinic.location
                ? [clinic.location.lat, clinic.location.lng]
                : (defaultCenter as [number, number])
            }
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
            icon={userIcon}
          >
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* Component to handle map events */}
        <MapEventHandler />
      </MapContainer>
    </>
  );
}

export default ClinicMap;

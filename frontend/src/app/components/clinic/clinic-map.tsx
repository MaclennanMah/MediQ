"use client";

import React, { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L, { Icon } from "leaflet";
import { useClinicContext } from "@/context/clinic-context";

// Your existing clinic pin
const clinicIcon = new Icon({
  iconUrl: "/assets/map_icon.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// “You are here” pin, using the blue marker images you copied to /public/markers
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

  // Re-fetch on pan/zoom end
  useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      updateMapBounds([sw.lat, sw.lng, ne.lat, ne.lng]);
    },
  });

  // Initial fetch on mount
  useEffect(() => {
    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    updateMapBounds([sw.lat, sw.lng, ne.lat, ne.lng]);
  }, [map, updateMapBounds]);

  return null;
}

export default function ClinicMap() {
  const { clinics, userLocation } = useClinicContext();
  const defaultCenter: [number, number] = [43.6532, -79.3832];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      scrollWheelZoom
      style={{ height: "80vh", width: "60vw" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Clinic markers */}
      {clinics.map((c) => (
        <Marker
          key={c.id}
          position={[c.location.lat, c.location.lng]}
          icon={clinicIcon}
        >
          <Popup>
            <h3>{c.name}</h3>
            <p>Type: {c.type}</p>
            <p>Status: {c.isOpen ? "Open" : "Closed"}</p>
            <p>Closes: {c.closingTime}</p>
            <p>Wait: {c.estimatedWaitTime}</p>
          </Popup>
        </Marker>
      ))}

      {/* “You are here” marker */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      <MapEventHandler />
    </MapContainer>
  );
}

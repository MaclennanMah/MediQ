'use client';

import React, {useEffect} from 'react';
import "leaflet/dist/leaflet.css";
import {MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents} from "react-leaflet";
import {useClinicContext} from '@/context/clinic-context';
import {Icon} from "leaflet";


function MapEventHandler() {
    const {updateMapBounds} = useClinicContext();
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
                northEast.lng
            ]);
        }
    });

    useEffect(() => {
        const bounds = map.getBounds();
        const southWest = bounds.getSouthWest();
        const northEast = bounds.getNorthEast();

        updateMapBounds([
            southWest.lat,
            southWest.lng,
            northEast.lat,
            northEast.lng
        ]);
    }, [map, updateMapBounds]);

    return null;
}

function ClinicMap() {
    const {clinics} = useClinicContext();

    // Default center for Toronto
    const defaultCenter = [43.6532, -79.3832];

    const markerIcon = new Icon({
        iconUrl: '/assets/map_icon.png',
        iconSize: [32, 32]
    })
    return (
        <>
            <MapContainer
                center={defaultCenter as [number, number]}
                zoom={13}
                scrollWheelZoom={true}
                style={{height: '80vh', width: '60vw'}}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Add markers for each clinic */}
                {clinics.map(clinic => (
                    <Marker
                        icon={markerIcon}
                        key={clinic.id}
                        position={
                            clinic.location
                                ? [clinic.location.lat, clinic.location.lng]
                                : defaultCenter as [number, number]
                        }
                    >
                        <Popup>
                            <div>
                                <h3>{clinic.name}</h3>
                                <p>Type: {clinic.type}</p>
                                <p>Status: {clinic.isOpen ? 'Open' : 'Closed'}</p>
                                <p>Closing Time: {clinic.closingTime}</p>
                                <p>Wait Time: {clinic.estimatedWaitTime}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Component to handle map events */}
                <MapEventHandler/>
            </MapContainer>
        </>
    );
}

export default ClinicMap;

"use client";
import {useMap} from "react-leaflet";
import L from "leaflet";
import {useEffect, useRef} from "react";
import {IconCurrentLocation} from "@tabler/icons-react";
import {useMantineColorScheme} from "@mantine/core";
import {renderToString} from "react-dom/server";

export function GeolocationControl() {
    const map = useMap();
    const { colorScheme } = useMantineColorScheme();
    const controlRef = useRef<L.Control | null>(null);

    useEffect(() => {
        // create custom accuracy Leaflet map control
        const GeolocationControlClass = L.Control.extend({
            onAdd: function() {
                const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-geolocation');

                // create button element
                const button = L.DomUtil.create('a', 'leaflet-control-geolocation-button', container);
                button.href = '#';
                button.title = 'Find my location';
                button.setAttribute('role', 'button');
                button.setAttribute('aria-label', 'Find my location');

                // add icon using renderToString
                const iconColor = colorScheme === 'dark' ? '#9dffb5' : '#00b894';
                button.innerHTML = renderToString(
                    <IconCurrentLocation size={18} color={iconColor}/>
                );

                // style the button
                button.style.cssText = `
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-decoration: none;
                `;

                // handle click event
                const handleClick = (e: Event) => {
                    e.preventDefault();
                    e.stopPropagation();

                    map.locate({
                        setView: true,
                        enableHighAccuracy: true,
                        maxZoom: 16
                    });
                };

                L.DomEvent.on(button, 'click', handleClick);
                L.DomEvent.disableClickPropagation(container);

                return container;
            }
        });

        // create and add the control
        const control = new GeolocationControlClass({
            position: 'topleft' // placed under the zoom controls
        });

        control.addTo(map);
        controlRef.current = control;

        // cleanup function
        return () => {
            if (controlRef.current) {
                map.removeControl(controlRef.current);
                controlRef.current = null;
            }
        };
    }, [map, colorScheme]);

    // handle location events
    useEffect(() => {
        const handleLocationError = (e: L.ErrorEvent) => {
            console.error('Location error:', e.message);
            alert(`Location access denied: ${e.message}`);
        };

        map.on('locationerror', handleLocationError);

        return () => {
            map.off('locationerror', handleLocationError);
        };
    }, [map]);

    return null;
}
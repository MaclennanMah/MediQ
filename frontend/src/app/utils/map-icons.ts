// This utility converts React components to HTML strings for Leaflet
// - handles sizing and anchor point math

import { divIcon } from 'leaflet';
import { JSX } from 'react';
import { renderToString } from 'react-dom/server';

export const createTablerIcon = (
    svg: JSX.Element,
    size: number,
    anchorX: number,
    anchorY: number
) => {
    return divIcon({
        html: renderToString(svg),
        className: '',
        iconSize: [size, size],
        iconAnchor: [anchorX, anchorY]
    });
};
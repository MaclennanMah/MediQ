// Reverse geocode utility to generate an address from a coordinate
// - uses Nominatim (OpenStreetMap) free reverse geocoding service
// - For more info: https://nominatim.org/release-docs/latest/api/Reverse/

import { useState, useEffect } from 'react';
import { Clinic } from '@/models/clinic';

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'MediQ App'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Geocoding failed');
        }

        const data = await response.json();

        // always construct address from components to avoid business names
        //  - as business names are already shown at the top of panel
        const addr = data.address;
        if (addr) {
            const parts = [];

            // street address (house number + street name)
            const streetParts = [addr.house_number, addr.road].filter(Boolean);
            if (streetParts.length > 0) {
                parts.push(streetParts.join(' '));
            }

            // unit/Suite/Apartment number (if available)
            if (addr.unit || addr.suite || addr['addr:unit']) {
                const unit = addr.unit || addr.suite || addr['addr:unit'];
                if (parts.length > 0) {
                    parts[0] = `${parts[0]}, Unit ${unit}`;
                }
            }

            // city (prioritize city, fallback to town/village)
            const city = addr.city || addr.town || addr.village;
            if (city) {
                parts.push(city);
            }

            // state/province
            if (addr.state) {
                parts.push(addr.state);
            }

            // postal code
            if (addr.postcode) {
                parts.push(addr.postcode);
            }

            if (parts.length > 0) {
                return parts.join(', ');
            }
        }

        // fallback if no structured address is available
        if (data.display_name) {
            // try to extract meaningful parts from display_name as last resort
            const displayParts = data.display_name.split(', ');
            // skip the first part (likely business name) and take relevant address components
            const relevantParts = displayParts.slice(1, 5).filter(part =>
                !part.includes('Golden Horseshoe') &&
                !part.includes('Centre') &&
                !part.includes('Park') &&
                part.length > 1
            );
            if (relevantParts.length > 0) {
                return relevantParts.join(', ');
            }
        }

        throw new Error('No address found');
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
}

// clinic type with cached address
export interface ClinicWithAddress extends Clinic {
    formattedAddress: string;
    addressLoading?: boolean;
}

// hook to manage address fetching for a clinic
export function useClinicAddress(clinic: Clinic) {
    const [address, setAddress] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (clinic.location?.lat && clinic.location?.lng) {
            setLoading(true);
            reverseGeocode(clinic.location.lat, clinic.location.lng)
                .then(setAddress)
                .catch((error) => {
                    console.error('Failed to get address:', error);
                    setAddress(`Coordinates: ${clinic.location.lat.toFixed(4)}, ${clinic.location.lng.toFixed(4)}`);
                })
                .finally(() => setLoading(false));
        }
    }, [clinic.location?.lat, clinic.location?.lng]);

    return { address, loading };
}


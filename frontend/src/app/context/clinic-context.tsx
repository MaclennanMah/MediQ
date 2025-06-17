'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Clinic } from '@/models/clinic';
import { fetchMedicalFacilities } from '@/services/overpass-api';
import { mockClinics } from '@/data/mock-clinics';

interface ClinicContextType {
  clinics: Clinic[];
  loading: boolean;
  error: string | null;
  updateMapBounds: (bounds: [number, number, number, number]) => void;
  currentBounds: [number, number, number, number] | null;
  userLocation: { lat: number; lng: number } | null;
}

const ClinicContext = createContext<ClinicContextType>({
  clinics: [],
  loading: false,
  error: null,
  updateMapBounds: () => {},
  currentBounds: null,
  userLocation: null,
});

export const useClinicContext = () => useContext(ClinicContext);

interface ClinicProviderProps {
  children: ReactNode;
}

// haversine formula to calculate distance between two points
function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

// function to update clinic distances based on user location
function updateClinicDistances(
    clinics: Clinic[],
    userLocation: { lat: number; lng: number } | null
): Clinic[] {
  if (!userLocation) {
    return clinics.map(clinic => ({
      ...clinic,
      distance: 'Location unavailable'
    }));
  }

  return clinics.map(clinic => {
    if (clinic.location) {
      const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          clinic.location.lat,
          clinic.location.lng
      );
      return {
        ...clinic,
        distance: `${distance} km from you`
      };
    }
    return {
      ...clinic,
      distance: 'Location unavailable'
    };
  });
}

export const ClinicProvider: React.FC<ClinicProviderProps> = ({ children }) => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBounds, setCurrentBounds] = useState<[number, number, number, number] | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(location);

            // Update initial mock clinics with distances
            const clinicsWithDistance = updateClinicDistances(mockClinics, location);
            setClinics(clinicsWithDistance);
          },
          (error) => {
            console.error('Error getting user location:', error);
            // Default to Toronto if location access is denied
            const defaultLocation = { lat: 43.6532, lng: -79.3832 };
            setUserLocation(defaultLocation);

            const clinicsWithDistance = updateClinicDistances(mockClinics, defaultLocation);
            setClinics(clinicsWithDistance);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 600000 // 10 minutes
          }
      );
    } else {
      console.error('Geolocation is not supported by this browser');
      // Default to Toronto if geolocation is not supported
      const defaultLocation = { lat: 43.6532, lng: -79.3832 };
      setUserLocation(defaultLocation);

      const clinicsWithDistance = updateClinicDistances(mockClinics, defaultLocation);
      setClinics(clinicsWithDistance);
    }
  }, []);

  const updateMapBounds = useCallback(async (bounds: [number, number, number, number]) => {
    setCurrentBounds(bounds);
    setLoading(true);
    setError(null);

    try {
      const facilities = await fetchMedicalFacilities(bounds);
      const facilitiesToUse = facilities.length > 0 ? facilities : mockClinics;

      // update distance for the fetched facilities
      const facilitiesWithDistance = updateClinicDistances(facilitiesToUse, userLocation);
      setClinics(facilitiesWithDistance);
    } catch (err) {
      setError('Failed to fetch medical facilities');
      console.error('Error fetching medical facilities:', err)

      //fallback to mock data with distances
      const mockWithDistance = updateClinicDistances(mockClinics, userLocation);
      setClinics(mockWithDistance);
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  const value: ClinicContextType = {
    clinics,
    loading,
    error,
    updateMapBounds,
    currentBounds,
    userLocation,
  };
  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
};

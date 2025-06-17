"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Clinic } from "@/models/clinic";
import { fetchMedicalFacilities } from "@/services/overpass-api";
import { mockClinics } from "@/data/mock-clinics";
import { haversineDistance } from "@/utils/distance";

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

export const ClinicProvider: React.FC<ClinicProviderProps> = ({ children }) => {
  const [rawClinics, setRawClinics] = useState<Clinic[]>(mockClinics);
  const [clinics, setClinics] = useState<Clinic[]>(mockClinics);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBounds, setCurrentBounds] = useState<
    [number, number, number, number] | null
  >(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // 1) Watch user position
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watcherId = navigator.geolocation.watchPosition(
      ({ coords }) =>
        setUserLocation({ lat: coords.latitude, lng: coords.longitude }),
      (err) => {
        console.error("Geolocation error:", err);
        setUserLocation(null);
      },
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watcherId);
  }, []);

  // 2) Fetch clinics when bounds change
  const updateMapBounds = useCallback(
    async (bounds: [number, number, number, number]) => {
      setCurrentBounds(bounds);
      setLoading(true);
      setError(null);
      try {
        const facilities = await fetchMedicalFacilities(bounds);
        setRawClinics(facilities.length > 0 ? facilities : mockClinics);
      } catch (err) {
        console.error("Error fetching medical facilities:", err);
        setError("Failed to fetch medical facilities");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 3) Recompute distance & sort whenever rawClinics or userLocation changes
  useEffect(() => {
    if (!userLocation) {
      setClinics(rawClinics);
      return;
    }

    const enriched = rawClinics
      .map((c) => ({
        ...c,
        distance: haversineDistance(
          userLocation.lat,
          userLocation.lng,
          c.location.lat,
          c.location.lng
        ),
      }))
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

    setClinics(enriched);
  }, [rawClinics, userLocation]);

  return (
    <ClinicContext.Provider
      value={{
        clinics,
        loading,
        error,
        updateMapBounds,
        currentBounds,
        userLocation,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

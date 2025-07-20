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

/* ────────────────────────── Types ────────────────────────── */
export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface EnrichedClinic extends Clinic {
  /** numeric wait-time (null if unknown) */
  waitTime?: number | null;
  services?: string[];
  hours?: string;
  contact?: { phone?: string; email?: string };
  distance?: number;
}

interface ClinicContextType {
  clinics: EnrichedClinic[];
  loading: boolean;
  error: string | null;
  updateMapBounds: (b: [number, number, number, number]) => void;
  currentBounds: [number, number, number, number] | null;
  userLocation: UserLocation | null;
  searchTerm: string;
  updateSearchTerm: (term: string) => void;
}

/* ─────────────────────── Context Setup ───────────────────── */
const ClinicContext = createContext<ClinicContextType>({
  clinics: [],
  loading: false,
  error: null,
  updateMapBounds: () => {},
  currentBounds: null,
  userLocation: null,
  searchTerm: "",
  updateSearchTerm: () => {},
});

export const useClinicContext = () => useContext(ClinicContext);

/* ─────────────────────── Provider ─────────────────────────── */
export const ClinicProvider = ({ children }: { children: ReactNode }) => {
  /* rawClinics → fetched/enriched results without distance */
  const [rawClinics, setRawClinics] = useState<EnrichedClinic[]>(mockClinics);
  /* clinics → what components consume (includes distance) */
  const [clinics, setClinics] = useState<EnrichedClinic[]>(mockClinics);

  const [currentBounds, setCurrentBounds] = useState<
    [number, number, number, number] | null
  >(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");

  /* ── 1. Geolocation watcher ─────────────────────────────── */
  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      ({ coords }) =>
        setUserLocation({
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy,
        }),
      (err) => {
        console.error("Geolocation error:", err);
        setUserLocation(null);
      },
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  /* ── 2. Fetch clinics when map bounds change ────────────── */
  const updateMapBounds = useCallback(
    async (bounds: [number, number, number, number]) => {
      setCurrentBounds(bounds);
      setLoading(true);
      setError(null);

      try {
        /* fetch Overpass data or fall back to mocks */
        const facilities = await fetchMedicalFacilities(bounds);
        const base = facilities.length ? facilities : mockClinics;

        /* enrich with default services/hours/contact */
        const enriched = base.map<EnrichedClinic>((c) => ({
          ...c,
          services: c.services ?? ["General Service"],
          hours: c.hours ?? "N/A",
          contact: c.contact ?? {
            phone: "Not available",
            email: "Not available",
          },
        }));

        setRawClinics(enriched);
      } catch (e) {
        console.error("Fetch error:", e);
        setError("Failed to fetch data");
        setRawClinics(mockClinics);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* ── 3. Re-compute distance & sort when rawClinics/userLocation change ── */
  useEffect(() => {
    let arr = rawClinics.map((c) => ({
      ...c,
      distance: userLocation
        ? haversineDistance(
            userLocation.lat,
            userLocation.lng,
            c.location.lat,
            c.location.lng
          )
        : undefined,
    }));

    if (userLocation) {
      arr.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      arr = arr.filter((c) => c.name.toLowerCase().includes(term));
    }

    setClinics(arr);
  }, [rawClinics, userLocation, searchTerm]);

  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  /* ── Provide context ─────────────────────────────────────── */
  return (
    <ClinicContext.Provider
      value={{
        clinics,
        loading,
        error,
        updateMapBounds,
        currentBounds,
        userLocation,
        searchTerm,
        updateSearchTerm,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

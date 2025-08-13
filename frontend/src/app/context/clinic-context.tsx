"use client";

import React, {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState,} from "react";
import {Clinic} from "@/models/clinic";
import {fetchMedicalFacilities} from "@/services/overpass-api";
import {mockClinics} from "@/data/mock-clinics";
import {haversineDistance} from "@/utils/distance";

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
  updateWaitTime: (clinicId: string, newWaitTime: string) => void;
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
  updateWaitTime: () => {},
});

export const useClinicContext = () => useContext(ClinicContext);

/* ─────────────────────── Provider ─────────────────────────── */
export const ClinicProvider = ({ children }: { children: ReactNode }) => {
  const isLocalStorageAvailable = useCallback(() => {
    if (typeof window === 'undefined') return false;

    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  const saveWaitTimeToCache = useCallback((clinicId: string, waitTime: string) => {
    if (!isLocalStorageAvailable()) return;

    try {
      const waitTimesCache = JSON.parse(localStorage.getItem('clinicWaitTimes') || '{}');

      waitTimesCache[clinicId] = waitTime;

      localStorage.setItem('clinicWaitTimes', JSON.stringify(waitTimesCache));
    } catch (error) {
      console.error('Error saving wait time to cache:', error);
    }
  }, [isLocalStorageAvailable]);

  const getWaitTimesFromCache = useCallback(() => {
    if (!isLocalStorageAvailable()) return {};

    try {
      const waitTimesCache = JSON.parse(localStorage.getItem('clinicWaitTimes') || '{}');
      return waitTimesCache;
    } catch (error) {
      console.error('Error loading wait times from cache:', error);
      return {};
    }
  }, [isLocalStorageAvailable]);

  const initialClinics = useMemo(() => {
    const cachedWaitTimes = typeof window !== 'undefined' ?
      JSON.parse(localStorage.getItem('clinicWaitTimes') || '{}') : {};

    return mockClinics.map(clinic => {
      const cachedWaitTime = cachedWaitTimes[clinic.id];

      if (cachedWaitTime) {
        const waitTimeValue = parseInt(cachedWaitTime);

        return {
          ...clinic,
          estimatedWaitTime: cachedWaitTime,
          waitTime: waitTimeValue
        };
      }

      return clinic;
    });
  }, []);

  /* rawClinics → fetched/enriched results without distance */
  const [rawClinics, setRawClinics] = useState<EnrichedClinic[]>(initialClinics);
  /* clinics → what components consume (includes distance) */
  const [clinics, setClinics] = useState<EnrichedClinic[]>(initialClinics);

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

        const cachedWaitTimes = getWaitTimesFromCache();

        setRawClinics(prevClinics => {
          const existingClinicsMap = new Map<string, EnrichedClinic>();
          prevClinics.forEach(clinic => {
            existingClinicsMap.set(clinic.id, clinic);
          });

          return enriched.map(newClinic => {
            const existingClinic = existingClinicsMap.get(newClinic.id);

            if (existingClinic) {
              return {
                ...newClinic,
                estimatedWaitTime: existingClinic.estimatedWaitTime,
                waitTime: existingClinic.waitTime
              };
            } else {
              const cachedWaitTime = cachedWaitTimes[newClinic.id];

              if (cachedWaitTime) {
                const waitTimeValue = parseInt(cachedWaitTime);
                return {
                  ...newClinic,
                  estimatedWaitTime: cachedWaitTime,
                  waitTime: waitTimeValue
                };
              }
              return newClinic;
            }
          });
        });
      } catch (e) {
        console.error("Fetch error:", e);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    },
    [getWaitTimesFromCache]
  );

  useEffect(() => {
    if (isLocalStorageAvailable()) {
      try {
        const existingCache = JSON.parse(localStorage.getItem('clinicWaitTimes') || '{}');

        if (Object.keys(existingCache).length === 0) {
          const initialCache: Record<string, string> = {};

          mockClinics.forEach(clinic => {
            if (clinic.estimatedWaitTime !== "N/A") {
              initialCache[clinic.id] = clinic.estimatedWaitTime;
            }
          });

          if (Object.keys(initialCache).length > 0) {
            localStorage.setItem('clinicWaitTimes', JSON.stringify(initialCache));
            console.log('Initialized wait time cache with mock data');
          }
        }
      } catch (error) {
        console.error('Error initializing wait time cache:', error);
      }
    }
  }, [isLocalStorageAvailable]);

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

  const updateWaitTime = useCallback((clinicId: string, newWaitTime: string) => {
    if (!RegExp(/^\d+m$/).exec(newWaitTime)) {
      console.error("Invalid wait time format. Expected format: '30m'");
      return;
    }

    const newWaitTimeValue = parseInt(newWaitTime);

    setRawClinics(prevClinics => {
      return prevClinics.map(clinic => {
        if (clinic.id === clinicId) {
          // Extract the current wait time value if it exists
          const currentWaitTime = clinic.estimatedWaitTime;
          let currentWaitTimeValue = 0;

          if (currentWaitTime !== "N/A") {
            currentWaitTimeValue = parseInt(currentWaitTime);
          }

          let updatedWaitTimeValue: number;

          if (currentWaitTime === "N/A" || isNaN(currentWaitTimeValue)) {
            updatedWaitTimeValue = newWaitTimeValue;
          } else {
            const difference = newWaitTimeValue - currentWaitTimeValue;
            updatedWaitTimeValue = Math.max(1, currentWaitTimeValue + Math.round(difference * 0.25));
          }

          const updatedWaitTime = `${updatedWaitTimeValue}m`;

          saveWaitTimeToCache(clinicId, updatedWaitTime);

          return {
            ...clinic,
            estimatedWaitTime: updatedWaitTime,
            waitTime: updatedWaitTimeValue
          };
        }
        return clinic;
      });
    });
  }, [saveWaitTimeToCache]);

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
        updateWaitTime,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

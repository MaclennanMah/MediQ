'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Clinic } from '@/models/clinic';
import { fetchMedicalFacilities } from '@/services/overpass-api';
import { mockClinics } from '@/data/mock-clinics';

export interface EnrichedClinic extends Clinic {
  waitTime: number | null;
  services?: string[];
  hours?: string;
  contact?: {
    phone?: string;
    email?: string;
  };
}


interface ClinicContextType {
  clinics: Clinic[];
  loading: boolean;
  error: string | null;
  updateMapBounds: (bounds: [number, number, number, number]) => void;
  currentBounds: [number, number, number, number] | null;
}

const ClinicContext = createContext<ClinicContextType>({
  clinics: [],
  loading: false,
  error: null,
  updateMapBounds: () => {},
  currentBounds: null,
});

export const useClinicContext = () => useContext(ClinicContext);

interface ClinicProviderProps {
  children: ReactNode;
}

export const ClinicProvider: React.FC<ClinicProviderProps> = ({ children }) => {
  const [clinics, setClinics] = useState<Clinic[]>(mockClinics);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBounds, setCurrentBounds] = useState<[number, number, number, number] | null>(null);

 const updateMapBounds = useCallback(async (bounds: [number, number, number, number]) => {
  setLoading(true);
  setError(null);
  try {
    const facilities = await fetchMedicalFacilities(bounds);
    const rawData = facilities.length ? facilities : mockClinics;

    const enrichedData = rawData.map(c => ({
      ...c,
      services: c.services ?? ['General Service'],
      hours: c.hours ?? 'N/A',
      contact: c.contact ?? {
        phone: 'Not available',
        email: 'Not available',
      },
    }));

    setClinics(enrichedData);
  } catch (e) {
    setClinics(mockClinics);
    setError('Failed to fetch data');
  } finally {
    setLoading(false);
  }
}, []);


  const value: ClinicContextType = {
    clinics,
    loading,
    error,
    updateMapBounds,
    currentBounds,
  };
  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
};

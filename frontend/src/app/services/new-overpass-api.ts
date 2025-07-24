// ─────────────────────────────────────────────────────────────────────────────
// services/overpass-api.ts  (replace the old fetchMedicalFacilities)
// ─────────────────────────────────────────────────────────────────────────────
import { Clinic } from '@/models/clinic';

/**
 * Fetches medical facilities from your backend, which itself
 * will fetch from Overpass and upsert missing entries into Mongo.
 */
export async function fetchMedicalFacilities(
  bounds: [number, number, number, number]
): Promise<Clinic[]> {
  const [south, west, north, east] = bounds;

  // Build the query string
  const qs = new URLSearchParams({
    south: south.toString(),
    west:  west.toString(),
    north: north.toString(),
    east:  east.toString(),
  });

  // Point this at your Express server (e.g. http://localhost:5000)
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  const url      = `${API_BASE}/organizations/nearby?${qs}`;
  console.log('🔗 [fetchMedicalFacilities] GET', url);
  const res = await fetch(url);

  if (!res.ok) {
    console.error('Backend error:', await res.text());
    return [];
  }

  // Backend returns an array of HealthcareOrganization docs
  const orgs: Array<{
    _id: string;
    organizationName: string;
    organizationType: 'Hospital' | 'Walk-In Clinic';
    phoneNumber?: string | null;
    estimatedWaitTime: number | null;
    location: { coordinates: [number, number] };
  }> = await res.json();

  // Map each Mongo doc into your front‑end Clinic interface
  return orgs.map(org => {
    // Mongo stores coords as [longitude, latitude]
    const [lng, lat] = org.location.coordinates;

    return {
      id: org._id,
      type: org.organizationType === 'Walk-In Clinic' ? 'Clinic' : org.organizationType,
      name: org.organizationName,
      isOpen: true,
      distance: 'N/A',              // will be computed in your context’s distance pass
      closingTime: 'N/A',
      estimatedWaitTime: org.estimatedWaitTime != null 
        ? `${org.estimatedWaitTime}m` 
        : 'N/A',
      services: ['General Service'], // you can customize this if you add a services field server‑side
      hours: 'N/A',
      contact: org.phoneNumber 
        ? { phone: org.phoneNumber } 
        : undefined,
      location: { lat, lng },
    } as Clinic;
  });
}

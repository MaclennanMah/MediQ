import { Clinic } from '@/models/clinic';

/**
 * This service fetches medical facilities from the Overpass API.
 * It specifically targets:
 * 1. Hospitals and clinics that provide emergency services, using various
 *    tags to identify them (emergency=yes, emergency=24/7, emergency:time, etc.)
 * 2. Walk-in clinics that accept patients without appointments
 * 
 * The query is designed to be comprehensive, capturing facilities that indicate emergency care
 * or walk-in service through different tagging conventions in OpenStreetMap.
 */

/**
 * Fetches medical facilities (emergency care and walk-in clinics) from the Overpass API within the given bounding box.
 * @param bounds - The bounding box coordinates [south, west, north, east]
 * @returns Promise<Clinic[]> - A promise that resolves to an array of clinics with emergency care or walk-in service
 */
export async function fetchMedicalFacilities(bounds: [number, number, number, number]): Promise<Clinic[]> {
  try {
    const [south, west, north, east] = bounds;

    const query = `
      [out:json];
      (

        node["amenity"="doctors"](${south},${west},${north},${east});
        way["amenity"="doctors"](${south},${west},${north},${east});
        relation["amenity"="doctors"](${south},${west},${north},${east});

        // Hospitals with emergency care
        node["amenity"="hospital"]["emergency"="yes"](${south},${west},${north},${east});
        way["amenity"="hospital"]["emergency"="yes"](${south},${west},${north},${east});
        relation["amenity"="hospital"]["emergency"="yes"](${south},${west},${north},${east});

        // Hospitals with emergency departments
        node["amenity"="hospital"]["emergency:department"="yes"](${south},${west},${north},${east});
        way["amenity"="hospital"]["emergency:department"="yes"](${south},${west},${north},${east});
        relation["amenity"="hospital"]["emergency:department"="yes"](${south},${west},${north},${east});

        // Clinics with emergency care
        node["amenity"="clinic"]["emergency"="yes"](${south},${west},${north},${east});
        way["amenity"="clinic"]["emergency"="yes"](${south},${west},${north},${east});
        relation["amenity"="clinic"]["emergency"="yes"](${south},${west},${north},${east});

        // Clinics with 24/7 emergency care
        node["amenity"="clinic"]["emergency"="24/7"](${south},${west},${north},${east});
        way["amenity"="clinic"]["emergency"="24/7"](${south},${west},${north},${east});
        relation["amenity"="clinic"]["emergency"="24/7"](${south},${west},${north},${east});

        // Emergency departments
        node["healthcare"="emergency_department"](${south},${west},${north},${east});
        way["healthcare"="emergency_department"](${south},${west},${north},${east});
        relation["healthcare"="emergency_department"](${south},${west},${north},${east});

        // Urgent care facilities
        node["healthcare"="urgent_care"](${south},${west},${north},${east});
        way["healthcare"="urgent_care"](${south},${west},${north},${east});
        relation["healthcare"="urgent_care"](${south},${west},${north},${east});

        // Walk-in clinics explicitly tagged
        node["amenity"="clinic"]["healthcare:speciality"="walk_in"](${south},${west},${north},${east});
        way["amenity"="clinic"]["healthcare:speciality"="walk_in"](${south},${west},${north},${east});
        relation["amenity"="clinic"]["healthcare:speciality"="walk_in"](${south},${west},${north},${east});

        // Clinics with walk-in tag
        node["amenity"="clinic"]["walk_in"="yes"](${south},${west},${north},${east});
        way["amenity"="clinic"]["walk_in"="yes"](${south},${west},${north},${east});
        relation["amenity"="clinic"]["walk_in"="yes"](${south},${west},${north},${east});

        // Clinics with appointment tag set to no or walk-in
        node["amenity"="clinic"]["appointment"="no"](${south},${west},${north},${east});
        way["amenity"="clinic"]["appointment"="no"](${south},${west},${north},${east});
        relation["amenity"="clinic"]["appointment"="no"](${south},${west},${north},${east});

        // Clinics with walk-in in the name (common naming convention)
        node["amenity"="clinic"]["name"~"walk.?in|walk.?in clinic",i](${south},${west},${north},${east});
        way["amenity"="clinic"]["name"~"walk.?in|walk.?in clinic",i](${south},${west},${north},${east});
        relation["amenity"="clinic"]["name"~"walk.?in|walk.?in clinic",i](${south},${west},${north},${east});
      );
      out body;
      >;
      out skel qt;
    `;

    const encodedQuery = encodeURIComponent(query);

    const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodedQuery}`);

    if (!response.ok) {
      return [];
    }
    const data = await response.json();

    return transformOverpassData(data);

  } catch (error) {
    console.error('Error fetching medical facilities:', error);
    return [];
  }
}

function parseContact(tags: Record<string, string>) {
  const phone  = tags.phone   ?? tags['contact:phone'];
  const email  = tags.email   ?? tags['contact:email'];
  return (phone || email) ? { phone, email } : undefined;
}



/**
 * Transforms Overpass API data to match the Clinic interface.
 * @param data - The raw data from Overpass API
 * @returns Clinic[] - An array of clinics
 */
function transformOverpassData(data: any): Clinic[] {
  if (!data.elements || !Array.isArray(data.elements)) return [];

  /** cache nodes so ways/relations can get a centre */
  const nodeMap: Record<string, { lat: number; lon: number }> = {};
  data.elements.forEach((el: any) => {
    if (el.type === "node") nodeMap[el.id] = { lat: el.lat, lon: el.lon };
  });

  return data.elements
    .filter((el: any) => el.tags && (el.tags.name || el.tags["name:en"]))
    .map((el: any, idx: number) => {
      const t = el.tags;

      /* ---------- BASIC FIELDS ---------- */
      const id   = `overpass-${el.id ?? idx}`;
      const name = t.name ?? t["name:en"] ?? "Unknown Facility";
      const type =
        t.amenity === "hospital"               ? "Hospital"      :
        t.healthcare === "emergency_department"? "Urgent Care"   :
        t.amenity === "clinic"                 ? "Clinic"        :
                                                 "Clinic";

      /* ---------- SERVICES (healthcare:speciality or amenity) ---------- */
      const services =
        t["healthcare:speciality"]?.split(";").map((s: string) => s.trim()) ??
        (t.amenity === "hospital" ? ["Emergency Care"] :
         t.amenity === "clinic"   ? ["General Practice"] : []);

      /* ---------- HOURS ---------- */
      const hours = t.opening_hours ?? t["opening_hours"] ?? undefined;

      /* ---------- CONTACT ---------- */
      const contact = parseContact(t);   // returns undefined if none

      /* ---------- LOCATION ---------- */
      let lat = el.lat, lng = el.lon;
      if (lat == null && el.nodes?.length) {
        const pts = el.nodes.map((n: string) => nodeMap[n]).filter(Boolean);
        if (pts.length) {
          lat = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
          lng = pts.reduce((s, p) => s + p.lon, 0) / pts.length;
        }
      }

      return {
        id,
        type,
        name,
        isOpen: true,
        distance: "N/A",
        closingTime: hours ?? "Unknown",
        estimatedWaitTime: "N/A",

        /* NEW FIELDS */
        services,
        hours,
        contact,

        location: lat != null ? { lat, lng } : undefined,
      } as Clinic;
    });
}

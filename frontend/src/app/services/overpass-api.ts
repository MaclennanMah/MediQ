import { Clinic } from '@/models/clinic';

/**
 * Generates a random wait time based on facility type and time of day.
 * Clinics have lower wait times than hospitals, and no wait time exceeds 3 hours.
 * @param facilityType - The type of medical facility ("Clinic", "Hospital", or "Urgent Care")
 * @returns string - A formatted wait time string (e.g., "30m")
 */
function generateRandomWaitTime(facilityType: string): string {
  const currentHour = new Date().getHours();
  let maxWaitTime: number;

  if (facilityType === "Hospital") {
    maxWaitTime = 180;
  } else if (facilityType === "Urgent Care") {
    maxWaitTime = 120;
  } else {
    maxWaitTime = 90;
  }


  let timeMultiplier = 0.5;

  if ((currentHour >= 8 && currentHour <= 11) || 
      (currentHour >= 12 && currentHour <= 14) || 
      (currentHour >= 17 && currentHour <= 20)) {
    timeMultiplier = 1.0;
  } else if (currentHour >= 22 || currentHour <= 6) {
    timeMultiplier = 0.3;
  }

  const waitTimeMinutes = Math.floor(Math.random() * maxWaitTime * timeMultiplier) + 1;

  return `${waitTimeMinutes}m`;
}

/**
 * Fetches medical facilities (emergency care and walk-in clinics) from the Overpass API within the given bounding box.
 * @param bounds - The bounding box coordinates [south, west, north, east]
 * @returns Promise<Clinic[]> - A promise that resolves to an array of clinics
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

        node["amenity"="hospital"]["emergency"="yes"](${south},${west},${north},${east});
        way["amenity"="hospital"]["emergency"="yes"](${south},${west},${north},${east});
        relation["amenity"="hospital"]["emergency"="yes"](${south},${west},${north},${east});

        node["amenity"="hospital"]["emergency:department"="yes"](${south},${west},${north},${east});
        way["amenity"="hospital"]["emergency:department"="yes"](${south},${west},${north},${east});
        relation["amenity"="hospital"]["emergency:department"="yes"](${south},${west},${north},${east});

        node["amenity"="clinic"]["emergency"="yes"](${south},${west},${north},${east});
        way["amenity"="clinic"]["emergency"="yes"](${south},${west},${north},${east});
        relation["amenity"="clinic"]["emergency"="yes"](${south},${west},${north},${east});

        node["amenity"="clinic"]["emergency"="24/7"](${south},${west},${north},${east});
        way["amenity"="clinic"]["emergency"="24/7"](${south},${west},${north},${east});
        relation["amenity"="clinic"]["emergency"="24/7"](${south},${west},${north},${east});

        node["healthcare"="emergency_department"](${south},${west},${north},${east});
        way["healthcare"="emergency_department"](${south},${west},${north},${east});
        relation["healthcare"="emergency_department"](${south},${west},${north},${east});

        node["healthcare"="urgent_care"](${south},${west},${north},${east});
        way["healthcare"="urgent_care"](${south},${west},${north},${east});
        relation["healthcare"="urgent_care"](${south},${west},${north},${east});

        node["amenity"="clinic"]["healthcare:speciality"="walk_in"](${south},${west},${north},${east});
        way["amenity"="clinic"]["healthcare:speciality"="walk_in"](${south},${west},${north},${east});
        relation["amenity"="clinic"]["healthcare:speciality"="walk_in"](${south},${west},${north},${east});

        node["amenity"="clinic"]["walk_in"="yes"](${south},${west},${north},${east});
        way["amenity"="clinic"]["walk_in"="yes"](${south},${west},${north},${east});
        relation["amenity"="clinic"]["walk_in"="yes"](${south},${west},${north},${east});

        node["amenity"="clinic"]["appointment"="no"](${south},${west},${north},${east});
        way["amenity"="clinic"]["appointment"="no"](${south},${west},${north},${east});
        relation["amenity"="clinic"]["appointment"="no"](${south},${west},${north},${east});

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

    if (!response.ok) return [];

    const data = await response.json();
    return transformOverpassData(data);

  } catch (error) {
    console.error("Error fetching medical facilities:", error);
    return [];
  }
}

function normalizeWebsite(url?: string): string | undefined {
    if (!url) return undefined;

    // add protocol if missing
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
    }

    return url;
}

function parseContact(tags: Record<string, string>) {
  const phone = tags.phone ?? tags["contact:phone"];
  const email = tags.email ?? tags["contact:email"];
  const website = normalizeWebsite(tags.website ?? tags["contact:website"]);
  return phone || email ? { phone, email } : undefined;
}

function transformOverpassData(data: any): Clinic[] {
  if (!data.elements || !Array.isArray(data.elements)) return [];

  const nodeMap: Record<string, { lat: number; lon: number }> = {};
  data.elements.forEach((el: any) => {
    if (el.type === "node") nodeMap[el.id] = { lat: el.lat, lon: el.lon };
  });

  return data.elements
    .filter((el: any) => el.tags && (el.tags.name || el.tags["name:en"]))
    .map((el: any, idx: number) => {
      const t = el.tags;

      const id = `overpass-${el.id ?? idx}`;
      const name = t.name ?? t["name:en"] ?? "Unknown Facility";

      const type =
        t.healthcare === "urgent_care" ? "Urgent Care" :
        t.amenity === "hospital" || t.healthcare === "emergency_department" ||
        t.emergency === "yes" || t["emergency:department"] === "yes" || t.emergency === "24/7"
          ? "Hospital"
        : t.amenity === "clinic" ? "Clinic"
        : "Clinic";

      const services = t["healthcare:speciality"]
        ? t["healthcare:speciality"].split(";").map((s: string) => s.trim())
        : t.amenity === "hospital"
          ? ["Emergency Care"]
          : t.amenity === "clinic"
            ? ["General Practice"]
            : [];

      const hours = t.opening_hours ?? t["opening_hours"];
      const contact = parseContact(t);

      let lat = el.lat, lng = el.lon;
      if (lat == null && el.nodes?.length) {
        const pts = el.nodes.map((n: string) => nodeMap[n]).filter(Boolean);
        if (pts.length) {
          lat = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
          lng = pts.reduce((s, p) => s + p.lon, 0) / pts.length;
        }
      }

      const estimatedWaitTime = generateRandomWaitTime(type);
      return {
        id,
        type,
        name,
        isOpen: true,
        distance: undefined,
        closingTime: hours ?? "Unknown",
        estimatedWaitTime,
        services,
        hours,
        contact,
        tags: t,
        location: lat != null ? { lat, lng } : { lat: 0, lng: 0 },
      } as Clinic;
    });
}

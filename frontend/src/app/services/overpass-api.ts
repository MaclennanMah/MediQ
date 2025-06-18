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


/**
 * Transforms Overpass API data to match the Clinic interface.
 * @param data - The raw data from Overpass API
 * @returns Clinic[] - An array of clinics
 */
function transformOverpassData(data: any): Clinic[] {
  if (!data.elements || !Array.isArray(data.elements)) {
    return [];
  }

  const nodeMap: Record<string, { lat: number, lon: number }> = {};
  data.elements.forEach((element: any) => {
    if (element.type === 'node' && element.id && element.lat !== undefined && element.lon !== undefined) {
      nodeMap[element.id] = { lat: element.lat, lon: element.lon };
    }
  });

  return data.elements
    .filter((element: any) => {
      return element.tags && (element.tags.name || element.tags['name:en']);
    })
    .filter((element: any) => {
      const name = (element.tags.name || element.tags['name:en'] || '').toLowerCase();
      return name.includes('health') ||
             name.includes('hospital') ||
             name.includes('clinic') ||
             name.includes('medical') ||
             name.includes('urgent care') ||
             name.includes('walk-in') ||
             name.includes('emergency') ||
             element.tags.amenity === 'hospital' ||
             element.tags.amenity === 'clinic' ||
             element.tags.amenity === 'doctors' ||
             element.tags.healthcare;
    })
    .map((element: any, index: number) => {
      let type = 'Walk-in Clinic'; // default to Walk

      //check for urgent care > Emergency > explicit walk-in clinic indicators > check for general doctor's office/clinic
      if (element.tags.healthcare === 'urgent_care') {
        type = 'Urgent Care';
      } else if (element.tags.amenity === 'hospital' ||
          element.tags.healthcare === 'emergency_department' ||
          element.tags.emergency === 'yes' ||
          element.tags['emergency:department'] === 'yes' ||
          element.tags.emergency === '24/7') {
        type = 'Emergency';
      } else if (
          element.tags['healthcare:speciality'] === 'walk_in' ||
          element.tags.walk_in === 'yes' ||
          element.tags.appointment === 'no' ||
          (element.tags.name && /walk.?in/i.test(element.tags.name))) {
        type = 'Walk-in Clinic';
      } else if (element.tags.amenity === 'doctors' || element.tags.amenity === 'clinic') {
        type = 'Walk-in Clinic';
      }

      let name = element.tags.name || element.tags['name:en'] || 'Unknown Facility';

      if (type === 'Walk-in Clinic' && !(/walk.?in/i.test(name))) {
        name += ' (Walk-in)';
      } else if (element.tags.emergency === '24/7' ||
          (element.tags['emergency:time'] && element.tags['emergency:time'].includes('24/7'))) {
        name += ' (24/7 Emergency Care)';
      } else if (element.tags.emergency === 'yes' || element.tags['emergency:department'] === 'yes') {
        name += ' (Emergency)';
      }

      let isOpen = true;
      let closingTime = 'Unknown';

      const clinic: Clinic = {
        id: `overpass-${element.id || index}`,
        type,
        name,
        isOpen,
        distance: 'Calculating...', // This would need to be calculated based on user location
        closingTime,
        estimatedWaitTime: 'N/A', // We don't have this data from Overpass
      };

      if (element.lat !== undefined && element.lon !== undefined) {
        clinic.location = {
          lat: element.lat,
          lng: element.lon
        };
      } else if (element.type === 'way' && element.nodes && element.nodes.length > 0) {
        let validNodes = element.nodes
          .map((nodeId: string | number) => nodeMap[nodeId])
          .filter((node: any) => node);

        if (validNodes.length > 0) {
          const sumLat = validNodes.reduce((sum: number, node: any) => sum + node.lat, 0);
          const sumLon = validNodes.reduce((sum: number, node: any) => sum + node.lon, 0);

          clinic.location = {
            lat: sumLat / validNodes.length,
            lng: sumLon / validNodes.length
          };
        }
      }

      return clinic;
    });
}

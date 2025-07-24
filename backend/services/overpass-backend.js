// backend/src/services/overpass-service.js
import fetch from 'node-fetch';

export async function fetchFromOverpass([south, west, north, east]) {
  const query = `
    [out:json];
    (
      node["amenity"="clinic"](${south},${west},${north},${east});
      // …etc…
    );
    out body;
    >;
    out skel qt;
  `;
  
  const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Overpass failed: ' + await res.text());
  return res.json();  // has an `.elements` array
}

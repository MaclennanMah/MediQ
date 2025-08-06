// backend/src/services/overpass-service.js
import fetch from 'node-fetch';

export async function fetchFromOverpass([south, west, north, east]) {
  // const query = `
  //   [out:json];
  //   (
  //     node["amenity"="clinic"](${south},${west},${north},${east});
  //     // …etc…
  //   );
  //   out body;
  //   >;
  //   out skel qt;
  // `;
  const query = `
    [out:json];
    (
      node["amenity"="hospital"](${south},${west},${north},${east});
      node["amenity"="doctors"](${south},${west},${north},${east});
      way["amenity"="hospital"](${south},${west},${north},${east});
      way["amenity"="doctors"](${south},${west},${north},${east});
      relation["amenity"="hospital"](${south},${west},${north},${east});
      relation["amenity"="doctors"](${south},${west},${north},${east});
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

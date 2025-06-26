# Feature 19 – Additional Clinic Information Display

**Branch:** `Feature-Frontend-Additional-display-info`  
**PR:** _TBD_

## What’s new
| UI element | Summary |
|------------|---------|
| **Services List** | Each card shows `services` (comma-separated) when present. |
| **Operating Hours** | Displays `hours` (tag `opening_hours` or mock field). |
| **Contact Info** | Renders phone 📞 and email ✉️ if either tag exists. |
| **Directions Button** | Opens Google Maps directions to the clinic location. |

## Key files touched
| Path | Purpose |
|------|---------|
| `components/clinic/clinic-card.tsx` | Added Services, Hours, Contact sections and “Directions” button. |
| `components/clinic/clinic-map.tsx`  | No change; still shows markers but inherits richer pop-up if desired. |
| `context/clinic-context.tsx`        | Enriches fetched facilities with defaults; prevents UI flicker. |
| `data/mock-clinics.ts`              | Mock dataset now includes `services`, `hours`, `contact`. |
| `models/clinic.ts`                  | Optional fields added to model. |

## Where data comes from
1. **Mock mode** · `src/app/data/mock-clinics.ts` – used immediately on first render or when Overpass fails.  
2. **Live mode** · `fetchMedicalFacilities()` in `services/overpass-api.ts`  
   - We request extra tags: `opening_hours`, `phone`, `email`, `healthcare:speciality`.  
   - Any missing fields are enriched in `clinic-context.tsx` with sensible defaults so UI never breaks.

## To render properly
| Requirement | Action |
|-------------|--------|
| **Opening hours / contact** | Must exist on the OSM node/way (tags `opening_hours`, `phone`, `email`). If absent, UI shows “Hours: N/A” and hides phone/email. |
| **Services** | Parsed from `healthcare:speciality=*` or fallback to “General Service”. |
| **Directions button** | Works out-of-box; uses clinic `location.lat/lng` to open Google Maps. |
| **No flicker** | Provider starts with `loading=true`, shows skeletons until Overpass data (already enriched) replaces mock. |

## Local testing
```bash
npm install
npm run dev
# open http://localhost:3000

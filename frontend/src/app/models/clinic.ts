/** Base clinic model shared across the app */
export interface Clinic {
  id: string;
  name: string;

  /** Clinic type */
  type: "Clinic" | "Hospital" | "Urgent Care";

  /** Whether the clinic is open */
  isOpen: boolean;

  /** Clinic closing time, e.g. “11:00 PM” or “24h” */
  closingTime: string;

  /** Estimated wait time, e.g. “30m”, “N/A” */
  estimatedWaitTime: string;

  /** Location coordinates */
  location: {
    lat: number;
    lng: number;
  };

  /**
   * Distance to user
   * - From mock data: formatted string like "2.5 km"
   * - From live API: numeric value in meters
   */
  distance?: number;

  /** NEW FIELDS for feature #19 */
  services?: string[];
  hours?: string;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

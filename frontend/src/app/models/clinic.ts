/** Base clinic model shared across the app */
export interface Clinic {
  id: string;
  type: 'Clinic' | 'Hospital' | 'Urgent Care';
  name: string;
  isOpen: boolean;

  /** distance in string form “2.5 km” (mock) or metres as number in live API */
  distance: string | number;

  closingTime: string;          // e.g. “11:00 PM” or “24h”
  estimatedWaitTime: string;    // e.g. “30m”, “N/A”

  location: { lat: number; lng: number };

  /** NEW FIELDS for feature #19 */
  services?: string[];          // list of services
  hours?: string;               // simple hours string (today / general)
  contact?: {
    phone?: string;
    email?: string;
  };
}

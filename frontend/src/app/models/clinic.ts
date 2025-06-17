export interface Clinic {
  id: string;
  name: string;
  type: string;
  isOpen: boolean;
  closingTime: string;
  estimatedWaitTime: string;
  // your existing location shape:
  location: {
    lat: number;
    lng: number;
  };
  // switch `distance` from string to an optional number (metres)
  distance?: number;
}

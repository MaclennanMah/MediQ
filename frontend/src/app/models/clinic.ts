export interface Clinic {
  id: string;
  name: string;
  type: string;
  isOpen: boolean;
  closingTime: string;
  estimatedWaitTime: string;
  location: {
    lat: number;
    lng: number;
  };
  distance?: number;
}

export interface Clinic {
    id: string;
    type: string;
    name: string;
    isOpen: boolean;
    distance: string;
    closingTime: string;
    estimatedWaitTime: string;
    location?: {
        lat: number;
        lng: number;
    };
}

import {Clinic} from '@/models/clinic';

export const mockClinics: Clinic[] = [
    {
        id: '1',
        type: 'Hospital',
        name: 'Toronto Western Hospital',
        isOpen: true,
        distance: '2.5 km',
        closingTime: '11:00 PM',
        estimatedWaitTime: '1h 5m',
        location: {
            lat: 43.6532,
            lng: -79.4012
        }
    },
    {
        id: '2',
        type: 'Clinic',
        name: 'Downtown Medical Clinic',
        isOpen: true,
        distance: '1.2 km',
        closingTime: '8:00 PM',
        estimatedWaitTime: '30m',
        location: {
            lat: 43.6547,
            lng: -79.3847
        }
    },
    {
        id: '3',
        type: 'Hospital',
        name: 'Mount Sinai Hospital',
        isOpen: true,
        distance: '3.7 km',
        closingTime: '24h',
        estimatedWaitTime: '2h 15m',
        location: {
            lat: 43.6578,
            lng: -79.3906
        }
    },
    {
        id: '4',
        type: 'Clinic',
        name: 'Yonge Street Walk-in Clinic',
        isOpen: false,
        distance: '0.8 km',
        closingTime: 'Closed',
        estimatedWaitTime: 'N/A',
        location: {
            lat: 43.6610,
            lng: -79.3832
        }
    },
    {
        id: '5',
        type: 'Urgent Care',
        name: 'Sunnybrook Urgent Care Centre',
        isOpen: true,
        distance: '5.3 km',
        closingTime: '10:00 PM',
        estimatedWaitTime: '45m',
        location: {
            lat: 43.7223,
            lng: -79.3754
        }
    }
];

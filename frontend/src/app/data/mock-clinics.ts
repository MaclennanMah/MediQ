import { Clinic } from '@/models/clinic';

export const mockClinics: Clinic[] = [
  {
    id: '1',
    type: 'Hospital',
    name: 'Toronto Western Hospital',
    isOpen: true,
    distance: 2.5,
    closingTime: '11:00 PM',
    estimatedWaitTime: '1h 5m',
    location: { lat: 43.6532, lng: -79.4012 },
    services: ['Emergency Care', 'Surgery', 'X-Ray'],
    hours: 'Open 24h',
    contact: { phone: '416-603-2581', email: 'info@torontowestern.ca' }
  },
  {
    id: '2',
    type: 'Clinic',
    name: 'Downtown Medical Clinic',
    isOpen: true,
    distance: 1.2,
    closingTime: '8:00 PM',
    estimatedWaitTime: '30m',
    location: { lat: 43.6547, lng: -79.3847 },
    services: ['General Consultation', 'Vaccination', 'Prescriptions'],
    hours: '8:00 AM – 8:00 PM',
    contact: { phone: '416-555-1234', email: 'contact@downtownclinic.ca' }
  },
  {
    id: '3',
    type: 'Hospital',
    name: 'Mount Sinai Hospital',
    isOpen: true,
    distance: 3.7,
    closingTime: '24h',
    estimatedWaitTime: '2h 15m',
    location: { lat: 43.6578, lng: -79.3906 },
    services: ['Emergency', 'Diagnostics', 'Specialist Referrals'],
    hours: 'Open 24h',
    contact: { phone: '416-586-4800', email: 'info@mountsinai.on.ca' }
  },
  {
    id: '4',
    type: 'Clinic',
    name: 'Yonge Street Walk-in Clinic',
    isOpen: false,
    distance: 0.8,
    closingTime: 'Closed',
    estimatedWaitTime: 'N/A',
    location: { lat: 43.6610, lng: -79.3832 },
    services: ['Walk-in Consultation', 'Lab Testing'],
    hours: '9:00 AM – 5:00 PM',
    contact: { phone: '416-555-6789', email: 'info@yongeclinic.ca' }
  },
  {
    id: '5',
    type: 'Urgent Care',
    name: 'Sunnybrook Urgent Care Centre',
    isOpen: true,
    distance: 5.3,
    closingTime: '10:00 PM',
    estimatedWaitTime: '45m',
    location: { lat: 43.7223, lng: -79.3754 },
    services: ['Urgent Treatment', 'Minor Injuries', 'Diagnostic Imaging'],
    hours: '10:00 AM – 10:00 PM',
    contact: { phone: '416-480-6100', email: 'urgentcare@sunnybrook.ca' }
  }
];

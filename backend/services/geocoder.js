// backend/services/geocoder.js
import NodeGeocoder from 'node-geocoder';
const geo = NodeGeocoder({ provider: 'openstreetmap' });
export default geo;

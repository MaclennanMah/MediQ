// backend/services/geocoder.js
import NodeGeocoder from 'node-geocoder';

const geo = NodeGeocoder({
  provider: 'openstreetmap',
  httpAdapter: 'https',
  formatter: null,
  headers: {
    'User-Agent': 'MyMediQApp/1.0 '
  }
});

// We need to throttle it
import pThrottle from 'p-throttle';
const geocodeOncePerSecond = pThrottle({
  limit: 1,
  interval: 1000
})(geo.geocode.bind(geo));

export default {
  geocode: geocodeOncePerSecond
};

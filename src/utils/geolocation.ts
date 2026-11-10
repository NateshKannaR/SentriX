export interface LiveLocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  altitude: number | null;
  timestamp: number;
  address?: string;
  isMockFallback?: boolean;
}

const DEFAULT_FALLBACK_LAT = 12.9716;
const DEFAULT_FALLBACK_LON = 77.5946;

// Local landmark directory for rapid offline geocoding
const KNOWN_LANDMARKS = [
  { name: 'MG Road Metro Station Corridor', lat: 12.9756, lon: 77.6066 },
  { name: 'Phoenix Marketcity Main Atrium, Whitefield Road', lat: 12.9959, lon: 77.6964 },
  { name: 'Koramangala 80ft Road Junction', lat: 12.9352, lon: 77.6245 },
  { name: 'Indiranagar 100ft Road Commercial Zone', lat: 12.9719, lon: 77.6412 },
  { name: 'Electronic City Toll Plaza, Phase 1', lat: 12.8452, lon: 77.6602 },
  { name: 'Yeshwanthpur Industrial Suburb & Rail Terminal', lat: 13.0285, lon: 77.5455 },
  { name: 'Hebbal Flyover Express Arterial Corridor', lat: 13.0358, lon: 77.597 },
  { name: 'Majestic City Central Transport Hub', lat: 12.9767, lon: 77.5713 },
];

/**
 * Calculates Haversine distance between two coordinates in kilometers
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Reverse geocodes coordinates to a human-readable address with online OSM + offline heuristic
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: { 'Accept-Language': 'en' },
      }
    );
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        // Return a condensed, readable address segment
        const parts = data.display_name.split(', ');
        return parts.slice(0, 3).join(', ');
      }
    }
  } catch {
    // Offline or rate-limited; fallback to closest landmark heuristic
  }

  // Find nearest known landmark
  let nearest = KNOWN_LANDMARKS[0];
  let minDistance = calculateDistanceKm(lat, lon, nearest.lat, nearest.lon);

  for (let i = 1; i < KNOWN_LANDMARKS.length; i++) {
    const dist = calculateDistanceKm(lat, lon, KNOWN_LANDMARKS[i].lat, KNOWN_LANDMARKS[i].lon);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = KNOWN_LANDMARKS[i];
    }
  }

  if (minDistance <= 1.5) {
    return `Near ${nearest.name} (${minDistance}km)`;
  }
  return `GPS Sector [${lat.toFixed(4)}, ${lon.toFixed(4)}]`;
}

/**
 * Obtains current user GPS location from browser Geolocation API
 */
export function getLiveLocation(): Promise<LiveLocationResult> {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      resolve({
        latitude: DEFAULT_FALLBACK_LAT,
        longitude: DEFAULT_FALLBACK_LON,
        accuracy: 50,
        speed: null,
        heading: null,
        altitude: null,
        timestamp: Date.now(),
        address: 'MG Road Central Corridor (Geolocation Unsupported)',
        isMockFallback: true,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude, accuracy, speed, heading, altitude } = position.coords;
        const address = await reverseGeocode(latitude, longitude);
        resolve({
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          speed,
          heading,
          altitude,
          timestamp: position.timestamp,
          address,
          isMockFallback: false,
        });
      },
      async () => {
        // Fallback on permission denied or timeout
        const address = await reverseGeocode(DEFAULT_FALLBACK_LAT, DEFAULT_FALLBACK_LON);
        resolve({
          latitude: DEFAULT_FALLBACK_LAT,
          longitude: DEFAULT_FALLBACK_LON,
          accuracy: 25,
          speed: null,
          heading: null,
          altitude: null,
          timestamp: Date.now(),
          address,
          isMockFallback: true,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 15000,
      }
    );
  });
}

/**
 * Subscribes to continuous live location stream
 */
export function watchLiveLocation(
  onUpdate: (loc: LiveLocationResult) => void,
  onError?: (err: string) => void
): () => void {
  if (!navigator.geolocation) {
    if (onError) onError('Geolocation not supported');
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    async position => {
      const { latitude, longitude, accuracy, speed, heading, altitude } = position.coords;
      onUpdate({
        latitude,
        longitude,
        accuracy: Math.round(accuracy),
        speed,
        heading,
        altitude,
        timestamp: position.timestamp,
        isMockFallback: false,
      });
    },
    error => {
      if (onError) onError(error.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    }
  );

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}

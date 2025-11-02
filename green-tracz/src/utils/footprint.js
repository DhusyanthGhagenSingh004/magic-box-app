// src/utils/footprint.js

// Emission factors in kg CO₂ per km (example values).
// For real accuracy, replace with authoritative datasets (e.g., DEFRA, IPCC, IEA).
export const EMISSION_FACTORS = {
  walk: 0.01,       // ~0, but we add tiny overhead for shoes/food production
  bike: 0.01,       // ~0, but tiny overhead for food energy
  public: 0.05,     // public transit average (bus/train shared per person)
  car: 0.21,        // average car (ICE ~200–250 g/km)
  motorcycle: 0.11, // average motorbike
};

// Approximate cost factors per km in ₹ (example values).
// Replace with user input or region-specific data for realism.
export const COST_PER_KM = {
  walk: 0,
  bike: 0,
  public: 0.5,
  car: 1.5,
  motorcycle: 0.6,
};

/**
 * Haversine formula to compute distance between two GPS coordinates in meters.
 * @param {number} lat1 - latitude of point 1
 * @param {number} lon1 - longitude of point 1
 * @param {number} lat2 - latitude of point 2
 * @param {number} lon2 - longitude of point 2
 * @returns {number} distance in meters
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Detect likely mode of transport from average speed (m/s).
 * Uses simple thresholds for walk/bike/public/car.
 * Extend this for more modes or custom user calibration.
 *
 * @param {number} ms - speed in meters/second
 * @returns {string} detected mode
 */
export function detectModeFromSpeed(ms) {
  const kmh = ms * 3.6;
  if (kmh < 8) return "walk";
  if (kmh < 20) return "bike";
  if (kmh < 50) return "public";
  return "car";
}

/**
 * Compute emissions and cost for a given distance and mode.
 *
 * @param {number} distanceMeters - distance traveled in meters
 * @param {string} mode - transport mode (walk, bike, public, car, motorcycle)
 * @returns {{ km: number, kg: number, cost: number }}
 */
export function computeEmissions(distanceMeters, mode = "car") {
  const km = distanceMeters / 1000;
  const kg = (EMISSION_FACTORS[mode] ?? EMISSION_FACTORS.car) * km;
  const cost = (COST_PER_KM[mode] ?? COST_PER_KM.car) * km;
  return { km, kg, cost };
}
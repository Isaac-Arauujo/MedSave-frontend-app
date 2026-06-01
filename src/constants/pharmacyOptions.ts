export const NEARBY_RADIUS_OPTIONS = [5, 10, 20, 50] as const;

export type NearbyRadiusKm = (typeof NEARBY_RADIUS_OPTIONS)[number];

export const DEFAULT_NEARBY_RADIUS_KM: NearbyRadiusKm = 10;

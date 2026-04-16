import * as turf from "@turf/turf";
import nagaBoundary from "../data/nagaBoundary.json";

export const getBarangayFromLocation = (lat, lng) => {
  if (!lat || !lng) return null;

  const point = turf.point([lng, lat]); // Longitude first

  const foundBarangay = nagaBoundary.features.find((polygonFeature) => {
    try {
      return turf.booleanPointInPolygon(point, polygonFeature);
    } catch (error) {
      console.error("Error checking point in polygon:", error);
      return false;
    }
  });

  // If a barangay was found, return its name. Otherwise, return null (meaning outside Naga).
  return foundBarangay ? foundBarangay.properties.adm4_en : null;
};

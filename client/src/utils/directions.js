export const getDirections = async (startCoords, endCoords, profile = "driving") => {
  const start = `${startCoords.lng},${startCoords.lat}`;
  const end = `${endCoords.lng},${endCoords.lat}`;

  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start};${end}?geometries=geojson&access_token=${token}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      return data.routes[0]; 
    }
    throw new Error("No route found");
  } catch (error) {
    console.error("Error fetching directions:", error);
    throw error;
  }
};
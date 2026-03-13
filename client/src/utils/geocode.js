export const getAddressFromCoordinates = async (lat, lng) => {
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN; 

  if (!MAPBOX_TOKEN) {
    console.error("Mapbox access token is missing.");
    return null;
  }

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=poi,address,neighborhood,locality,place`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }

    const data = await response.json();

if (data.features && data.features.length > 0) {
      const fullAddress = data.features[0].place_name;
      let formattedAddress = fullAddress.replace(/,\s*Philippines$/i, '');
      formattedAddress = formattedAddress.replace(/,\s*\d{4}$/, '');

      return formattedAddress;
    }

    return null;
  } catch (error) {
    console.error("Error during reverse geocoding:", error);
    return "Error fetching address";
  }
};
import React from 'react';
import Map from '../components/Map';
import ResponderMap from '../components/ResponderMap';
import { useAuthContext } from '../providers/useAuthContext';

const MapPage = ({ targetCoords }) => {
  const { userDoc } = useAuthContext();
  const role = userDoc?.role;

  return role === "RESPONDER" ? <ResponderMap targetCoords={targetCoords} /> : <Map />;
};

export default MapPage;
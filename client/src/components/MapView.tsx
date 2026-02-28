import React, { useState } from 'react';
// @ts-ignore
import Map from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapView() {
  const [viewState, setViewState] = useState({
    longitude: -117.8265, 
    latitude: 33.6846,    
    zoom: 13.5            
  });

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-red-50 text-red-500 font-medium">
        Error: Missing Mapbox Token. Check your .env file.
      </div>
    );
  }

  return (
    <Map
      {...viewState}
      onMove={(evt: any) => setViewState(evt.viewState)}
      mapStyle="mapbox://styles/mapbox/light-v11" 
      mapboxAccessToken={MAPBOX_TOKEN}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
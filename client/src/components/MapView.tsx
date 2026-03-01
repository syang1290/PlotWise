import React, { useEffect, useRef } from 'react';
import Map, { Marker, Layer, Source, type MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface MapViewProps {
  coordinates?: { longitude: number; latitude: number } | null;
}

export default function MapView({ coordinates }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (coordinates && mapRef.current) {
      mapRef.current.flyTo({
        center: [coordinates.longitude, coordinates.latitude],
        zoom: 18,
        pitch: 60,
        bearing: -20,
        duration: 3000,
        essential: true
      });
    }
  }, [coordinates]);

  return (
    <Map
      ref={mapRef}
      preserveDrawingBuffer={true}
      initialViewState={{
        longitude: -117.8228,
        latitude: 33.6846,
        zoom: 12,
        pitch: 0
      }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
      antialias={true}
    >
      <Layer
        id="3d-buildings"
        source="composite"
        source-layer="building"
        filter={['==', 'extrude', 'true']}
        type="fill-extrusion"
        paint={{
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.6
        }}
      />

      {coordinates && (
        <>
          <Source
            id="parcel-data"
            type="geojson"
            data={{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [coordinates.longitude, coordinates.latitude]
              },
              properties: {}
            }}
          >
            <Layer
              id="parcel-highlight"
              type="circle"
              paint={{
                'circle-radius': 100,
                'circle-color': '#4b3e99',
                'circle-opacity': 0.1,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#4b3e99'
              }}
            />
          </Source>
          <Marker 
            longitude={coordinates.longitude} 
            latitude={coordinates.latitude} 
            color="#4b3e99" 
          />
        </>
      )}
    </Map>
  );
}
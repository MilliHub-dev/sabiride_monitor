import { useEffect, useRef, useState } from 'react';
import Map, { NavigationControl, type MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Ride, Driver, Location } from '../../types';
import DriverPin from './DriverPin';
import RidePin from './RidePin';

const ABUJA = { lat: 9.0765, lng: 7.3986 };

// Mapbox ships a dark theme, which replaces the hand-written style array this
// map used to carry. Attribution stays on: Mapbox's terms require it.
const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? '';

interface Props {
  drivers: Driver[];
  pendingRides: Ride[];
  selectedDriverId: string | null;
  onDriverClick: (driverId: string) => void;
  onRideClick: (ride: Ride) => void;
  panTarget: Location | null;
}

export default function LiveMap({
  drivers,
  pendingRides,
  selectedDriverId,
  onDriverClick,
  onRideClick,
  panTarget,
}: Props) {
  const mapRef = useRef<MapRef | null>(null);
  const [center, setCenter] = useState(ABUJA);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCenter({ lat: latitude, lng: longitude });
        mapRef.current?.flyTo({ center: [longitude, latitude], duration: 800 });
      },
      (error) => {
        console.warn('Geolocation error:', error);
        // Stay on Abuja.
      },
    );
  }, []);

  useEffect(() => {
    if (panTarget) {
      mapRef.current?.flyTo({
        center: [panTarget.lng, panTarget.lat],
        duration: 1000,
      });
    }
  }, [panTarget]);

  if (!TOKEN) {
    return (
      <div style={placeholderStyle}>
        VITE_MAPBOX_TOKEN is not set — add it to .env and restart the dev server
      </div>
    );
  }

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={TOKEN}
      initialViewState={{
        longitude: center.lng,
        latitude: center.lat,
        zoom: 13,
      }}
      mapStyle={MAP_STYLE}
      style={{ width: '100%', height: '100%' }}
    >
      <NavigationControl position="top-right" showCompass={false} />

      {drivers.map((driver) => (
        <DriverPin
          key={driver.id}
          driver={driver}
          isSelected={driver.id === selectedDriverId}
          onClick={() => onDriverClick(driver.id)}
        />
      ))}
      {pendingRides.map((ride) => (
        <RidePin key={ride.id} ride={ride} onClick={() => onRideClick(ride)} />
      ))}
    </Map>
  );
}

const placeholderStyle = {
  flex: 1,
  height: '100%',
  background: '#0d1117',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--color-text-muted)',
  fontSize: 13,
  textAlign: 'center' as const,
  padding: 24,
};

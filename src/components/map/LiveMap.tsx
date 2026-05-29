import { useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import type { Ride, Driver } from '../../types';
import DriverPin from './DriverPin';
import RidePin from './RidePin';

const ABUJA = { lat: 9.0765, lng: 7.3986 };

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2332' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#111827' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1f2d45' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#060d16' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1a2332' }] },
  ],
};

interface Props {
  drivers: Driver[];
  pendingRides: Ride[];
  selectedDriverId: string | null;
  onDriverClick: (driverId: string) => void;
  onRideClick: (ride: Ride) => void;
  panTarget: google.maps.LatLngLiteral | null;
}

export default function LiveMap({
  drivers,
  pendingRides,
  selectedDriverId,
  onDriverClick,
  onRideClick,
  panTarget,
}: Props) {
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '',
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    if (mapRef.current && panTarget) {
      mapRef.current.panTo(panTarget);
    }
  }, [panTarget]);

  if (!isLoaded) {
    return (
      <div
        style={{
          flex: 1,
          background: '#0d1117',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted)',
          fontSize: 13,
        }}
      >
        Loading map…
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ flex: 1, height: '100%' }}
      center={ABUJA}
      zoom={13}
      options={MAP_OPTIONS}
      onLoad={onLoad}
    >
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
    </GoogleMap>
  );
}

import { Marker } from 'react-map-gl/mapbox';
import type { Driver } from '../../types';

interface Props {
  driver: Driver;
  isSelected: boolean;
  onClick: () => void;
}

export default function DriverPin({ driver, isSelected, onClick }: Props) {
  const iconUrl = driver.status === 'busy' ? '/busy.png' : '/online.png';
  const size = isSelected ? 48 : 36;

  return (
    <Marker
      longitude={driver.location.lng}
      latitude={driver.location.lat}
      anchor="center"
      style={{ zIndex: isSelected ? 10 : 1 }}
      onClick={(event) => {
        // Without this the click also reaches the map underneath.
        event.originalEvent.stopPropagation();
        onClick();
      }}
    >
      <img
        src={iconUrl}
        alt={`${driver.name} · ${driver.status}`}
        title={`${driver.name} · ${driver.status}`}
        width={size}
        height={size}
        style={{ cursor: 'pointer', display: 'block' }}
      />
    </Marker>
  );
}

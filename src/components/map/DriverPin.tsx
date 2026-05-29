import { Marker } from '@react-google-maps/api';
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
      position={driver.location}
      onClick={onClick}
      title={`${driver.name} · ${driver.status}`}
      zIndex={isSelected ? 10 : 1}
      icon={{
        url: iconUrl,
        scaledSize: new google.maps.Size(size, size),
        anchor: new google.maps.Point(size / 2, size / 2),
      }}
    />
  );
}

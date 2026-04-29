import { OverlayView } from '@react-google-maps/api';
import type { Driver } from '../../types';

interface Props {
  driver: Driver;
  isSelected: boolean;
  onClick: () => void;
}

const STATUS_COLOR: Record<Driver['status'], string> = {
  online: '#2DBF6E',
  busy: '#F59E0B',
  offline: '#4B5563',
};

export default function DriverPin({ driver, isSelected, onClick }: Props) {
  const color = STATUS_COLOR[driver.status];
  const initials = driver.avatarInitials || driver.name.slice(0, 2).toUpperCase();

  return (
    <OverlayView
      position={driver.location}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(w, h) => ({ x: -w / 2, y: -h / 2 })}
    >
      <div
        onClick={onClick}
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: color,
          border: isSelected ? '3px solid #fff' : '2px solid rgba(255,255,255,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isSelected
            ? `0 0 0 3px ${color}, 0 2px 8px rgba(0,0,0,0.5)`
            : '0 2px 6px rgba(0,0,0,0.4)',
          transition: 'transform 0.15s ease',
          transform: isSelected ? 'scale(1.15)' : 'scale(1)',
          zIndex: isSelected ? 10 : 1,
          userSelect: 'none',
        }}
        title={`${driver.name} · ${driver.status}`}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>
          {initials}
        </span>
      </div>
    </OverlayView>
  );
}

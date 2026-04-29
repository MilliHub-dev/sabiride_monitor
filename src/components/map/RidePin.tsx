import { OverlayView } from '@react-google-maps/api';
import type { Ride } from '../../types';

interface Props {
  ride: Ride;
  onClick: () => void;
}

export default function RidePin({ ride, onClick }: Props) {
  return (
    <OverlayView
      position={ride.pickup}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(w, h) => ({ x: -w / 2, y: -h / 2 })}
    >
      <div onClick={onClick} style={{ cursor: 'pointer', position: 'relative', width: 24, height: 24 }}>
        {/* Pulsing ring */}
        <span className="ride-pin-pulse" />
        {/* Core dot */}
        <span
          style={{
            position: 'absolute',
            inset: '50%',
            transform: 'translate(-50%, -50%)',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#EF4444',
            border: '2px solid #fff',
            boxShadow: '0 0 6px rgba(239,68,68,0.8)',
            display: 'block',
          }}
        />
      </div>
    </OverlayView>
  );
}

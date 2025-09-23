import { LatLngTuple } from 'leaflet';
import { CircleMarker } from 'react-leaflet';

type Props = {
  points?: LatLngTuple[];
};

export default function UploadedDataPoints({ points }: Props) {
  if (!points) return null;
  return (
    <>
      {points.map((point, index) => (
        <CircleMarker
          key={index}
          radius={2}
          pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 1 }}
          center={point}
        />
      ))}
    </>
  );
}

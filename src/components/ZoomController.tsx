import { useMap } from 'react-leaflet';

const ZoomController = ({
  onZoomReady,
}: {
  onZoomReady: (zoomIn: () => void, zoomOut: () => void) => void;
}) => {
  const map = useMap();

  onZoomReady(() => map.zoomIn(), () => map.zoomOut());

  return null;
};
export default ZoomController;
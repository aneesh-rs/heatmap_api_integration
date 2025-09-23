// src/types/leaflet-draw.d.ts
import * as L from 'leaflet';

declare module 'leaflet' {
  namespace Control {
    class Draw extends L.Control {
      constructor(options?: any);
    }
  }

  namespace DrawEvents {
    interface Created extends L.LeafletEvent {
      layerType: string;
      layer: L.Layer;
    }
  }

  namespace Draw {
    const Event: {
      CREATED: string;
      EDITED: string;
      DELETED: string;
    };
  }
}

import { create } from 'zustand';
import { LatLngTuple } from 'leaflet';
import { ReportFormData, ReportStatus } from '../types';
import { getReports } from '../services/reports';

export type AdminMarker = ReportFormData & {
  id: string;
  reportStatus: ReportStatus;
  position: LatLngTuple;
  _id?: string;
};

interface AdminMarkersState {
  markers: AdminMarker[];
  isLoading: boolean;
  error: string | null;
  fetchMarkers: () => Promise<void>;
  setMarkers: (markers: AdminMarker[]) => void;
  clearMarkers: () => void;
}

export const useAdminMarkersStore = create<AdminMarkersState>((set) => ({
  markers: [],
  isLoading: false,
  error: null,

  fetchMarkers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getReports();
      console.log('fetched markers : ', res);
      if (res.success && res.data) {
        const markers = res.data.map((record) => ({
          ...record,
          position: [record.location.lat, record.location.lng] as LatLngTuple,
        }));
        set({ markers, isLoading: false });
      } else {
        set({ error: 'Failed to fetch markers', isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching markers:', error);
      set({ error: 'Error fetching markers', isLoading: false });
    }
  },

  setMarkers: (markers) => set({ markers }),

  clearMarkers: () => set({ markers: [] }),
}));

import { create } from 'zustand';
import { LatLngTuple } from 'leaflet';
import { ReportFormData, ReportStatus } from '../types';
import { getReports } from '../services/reports';

export type UserMarker = ReportFormData & {
  id: string;
  reportStatus: ReportStatus;
  position: LatLngTuple;
};

interface UserMarkersState {
  markers: UserMarker[];
  isLoading: boolean;
  error: string | null;
  fetchUserMarkers: (userId: string) => Promise<void>;
  setMarkers: (markers: UserMarker[]) => void;
  clearMarkers: () => void;
}

export const useUserMarkersStore = create<UserMarkersState>((set) => ({
  markers: [],
  isLoading: false,
  error: null,

  fetchUserMarkers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getReports();
      if (res.success && res.data) {
        const records = res.data; // backend may filter by auth; otherwise filter by userId if available later
        const markers = records.map((record) => ({
          ...record,
          position: [record.location.lat, record.location.lng] as LatLngTuple,
        }));
        set({ markers, isLoading: false });
      } else {
        set({ error: 'Failed to fetch user markers', isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching user markers:', error);
      set({ error: 'Error fetching user markers', isLoading: false });
    }
  },

  setMarkers: (markers) => set({ markers }),

  clearMarkers: () => set({ markers: [] }),
}));

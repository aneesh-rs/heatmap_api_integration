import { create } from 'zustand';

type FilterDistrictStore = {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;

  interestZone: 'Districts' | 'City' | 'Neighborhoods'; 
  setInterestZone: (zone: 'Districts' | 'City' | 'Neighborhoods') => void;

  selectedAudioTypes: string[];
  setSelectedAudioTypes: (types: string[]) => void;
  toggleAudioType: (type: string) => void;

  reportCount: string;
  setReportCount: (count: string) => void;

  selectedDistricts: number[];
  setSelectedDistricts: (districts: number[]) => void;
  toggleDistrict: (id: number) => void;
};

const useFilterDistrictStore = create<FilterDistrictStore>((set, get) => ({
  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),
  interestZone: 'Districts',
  setInterestZone: (zone) => set({ interestZone: zone }),
  
  selectedAudioTypes: ['All'],
  setSelectedAudioTypes: (types) => set({ selectedAudioTypes: types }),
  toggleAudioType: (type) => {
    const { selectedAudioTypes } = get();
    if (type === 'All') {
      if (selectedAudioTypes.includes('All')) {
        set({ selectedAudioTypes: [] });
      } else {
        set({ selectedAudioTypes: ['All'] });
      }
    } else {
      if (selectedAudioTypes.includes(type)) {
        const newTypes = selectedAudioTypes.filter(
          (t) => t !== type && t !== 'All'
        );
        set({ selectedAudioTypes: newTypes });
      } else {
        const newTypes = selectedAudioTypes.filter((t) => t !== 'All');
        newTypes.push(type);
        set({ selectedAudioTypes: newTypes });
      }
    }
  },

  reportCount: 'All',
  setReportCount: (count) => set({ reportCount: count }),

  selectedDistricts: [],
  setSelectedDistricts: (districts) => set({ selectedDistricts: districts }),
  toggleDistrict: (id) => {
    const { selectedDistricts } = get();
    if (selectedDistricts.includes(id)) {
      set({ selectedDistricts: selectedDistricts.filter((districtId: number) => districtId !== id) });
    } else {
      set({ selectedDistricts: [...selectedDistricts, id] });
    }
  },
}));

export default useFilterDistrictStore;

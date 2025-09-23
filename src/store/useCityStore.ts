import { create } from 'zustand';
import { cities } from '../constants';
import { City } from '../types';

type CityStore = {
  selectedCity: City;
  setSelectedCity: (city: City) => void;
};

export const useCityStore = create<CityStore>((set) => ({
  selectedCity: cities[0],
  setSelectedCity: (city) => set({ selectedCity: city }),
}));

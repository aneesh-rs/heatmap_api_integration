import { create } from 'zustand';

interface SearchResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  boundingbox: string[];
}

interface StreetSearchStore {
  searchQuery: string;
  searchResults: SearchResult[];
  selectedStreet: SearchResult | null;
  isSearching: boolean;
  showSuggestions: boolean;

  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setSelectedStreet: (street: SearchResult | null) => void;
  setIsSearching: (loading: boolean) => void;
  setShowSuggestions: (show: boolean) => void;
  clearSearch: () => void;
  searchStreets: (query: string, city?: string) => Promise<void>;
}

export const useStreetSearchStore = create<StreetSearchStore>((set) => ({
  searchQuery: '',
  searchResults: [],
  selectedStreet: null,
  isSearching: false,
  showSuggestions: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  setSelectedStreet: (street) =>
    set({ selectedStreet: street, showSuggestions: false }),
  setIsSearching: (loading) => set({ isSearching: loading }),
  setShowSuggestions: (show) => set({ showSuggestions: show }),

  clearSearch: () =>
    set({
      searchQuery: '',
      searchResults: [],
      selectedStreet: null,
      showSuggestions: false,
      isSearching: false,
    }),

  searchStreets: async (query: string) => {
    if (!query || query.length < 3) {
      set({ searchResults: [], showSuggestions: false });
      return;
    }

    set({ isSearching: true });

    try {
      const encodedQuery = encodeURIComponent(`${query}`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          `q=${encodedQuery}&` +
          `format=json&`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data: SearchResult[] = await response.json();

      // Filter results to prioritize streets, roads, and addresses
      const streetResults = data;

      set({
        searchResults: streetResults.slice(0, 10), // Limit to top 10 results
        showSuggestions: streetResults.length > 0,
        isSearching: false,
      });
    } catch (error) {
      console.error('Street search error:', error);
      set({
        searchResults: [],
        showSuggestions: false,
        isSearching: false,
      });
    }
  },
}));

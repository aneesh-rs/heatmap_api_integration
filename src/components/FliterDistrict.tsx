import { motion, AnimatePresence } from "motion/react";
import { useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useMapModeStore } from "../store/useMapModeStore";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import { PieChart, Pie, Cell } from "recharts";
import { PiUserCircleFill } from "react-icons/pi";
import { polygons1, polygons2 } from "../constants";
import useFilterDistrictStore from "../store/useFilterDistrictStore";
import { useTranslation } from "react-i18next";
import { useStreetSearchStore } from "../store/useStreetSearchStore";
import DatePickerInput from "./DatePickerInput";
import SocialReportAudioFilter from "./SocialReportAudioFilter";

const parseName = (name: string) => {
  const n = name.split("-");
  const n1 = n[0].charAt(0).toUpperCase() + n[0].slice(1);
  const n2 = n[1];
  return n1 + " " + n2;
};

const data = [
  { name: "<40", value: 22048, color: "#AEE9FF" },
  { name: "45-50", value: 8819, color: "#C5FF99" },
  { name: "50-55", value: 4409, color: "#4CAF50" },
];

export default function FilterDistrict() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState("Day");
  const { mode: mapMode, setMode } = useMapModeStore();
  const {
    selectedId,
    setSelectedId,
    interestZone,
    setInterestZone,
    setSelectedDistricts,
    setSelectedAudioTypes,
    setReportCount,
  } = useFilterDistrictStore();
  const {
    searchQuery,
    searchResults,
    selectedStreet,
    isSearching,
    showSuggestions,
    setSearchQuery,
    setSelectedStreet,
    setShowSuggestions,
    clearSearch,
  } = useStreetSearchStore();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setSelectedStreet(suggestion);
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    clearSearch();
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const clearAllFilters = () => {
    setTimeRange("Day");
    setInterestZone("Districts");
    setSelectedDistricts([]);
    setSelectedAudioTypes(["All"]);
    setReportCount("All");
    setSelectedId(null);
    clearSearch();
  };

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const selectedPolygon =
    interestZone === "Districts"
      ? polygons1.find((polygon) => polygon.id === selectedId)
      : polygons2.find((polygon) => polygon.id === selectedId);
  const populationDensity = selectedPolygon
    ? selectedPolygon.population / 1000
    : "N/A";

  return (
    <AnimatePresence>
      {mapMode === "filterDistrict" && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          className="fixed inset-y-0 right-0 z-50 flex items-start overflow-y-auto justify-center max-w-sm bg-white"
        >
          <div className="w-full max-w-md bg-white p-6 rounded-lg ">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-gray-700">
                {t("FilterDistrict.title")}
              </h2>
              <div className="flex items-center">
                <button
                  className="text-blue-500 mr-4 text-sm"
                  onClick={clearAllFilters}
                >
                  {t("Filters.clearAll")}
                </button>
                <button
                  className="cursor-pointer text-gray-500 duration-300 hover:text-gray-700"
                  onClick={() => setMode("drag")}
                >
                  <IoMdClose size={20} />
                </button>
              </div>
            </div>
            <div className="font-medium text-lg text-center">
              {selectedPolygon && parseName(selectedPolygon?.id || "")}
            </div>
            <div className="relative flex flex-col items-center justify-center p-6 bg-white rounded-xl max-w-md mx-auto">
              <PieChart width={240} height={240}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div className="absolute top-1/3 left-1/2 flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 text-center">
                <PiUserCircleFill size={30} />
                <div className="text-gray-500 text-sm">
                  {t("FilterDistrict.averageCitizens")}
                </div>
                <div className="text-2xl font-semibold">
                  {populationDensity}
                </div>
              </div>

              <div className="mt-6 w-full">
                <table className="w-full text-sm text-left text-gray-700">
                  <thead>
                    <tr className="">
                      <th className="py-1">{t("FilterDistrict.decibel")}</th>
                      <th className="py-1 text-right">
                        {t("FilterDistrict.citizens")}
                      </th>
                      <th className="py-1 text-right">
                        {t("FilterDistrict.percentage")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, idx) => {
                      const percentage = ((item.value / total) * 100).toFixed(
                        1
                      );
                      return (
                        <tr key={idx}>
                          <td className="py-1">
                            <span
                              className="inline-block w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: item.color }}
                            ></span>
                            {item.name}
                          </td>
                          <td className="py-1 text-right">
                            {item.value.toLocaleString()}
                          </td>
                          <td className="py-1 text-right">{percentage}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-6 w-full">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-gray-500 mb-2">
                  {t("Filters.timeRanges")}
                </label>
                <DatePickerInput />
              </div>
              <div className="relative flex w-full bg-gray-100 rounded-full p-1">
                <div
                  className={`absolute top-1 bottom-1 w-[49%] rounded-full bg-blue-500 transition-all duration-300 ${
                    timeRange === "Day" ? "left-1" : "left-1/2"
                  }`}
                ></div>

                <button
                  className={`flex-1 z-10 py-2 text-center rounded-full transition-colors duration-300 ${
                    timeRange === "Day" ? "text-white" : "text-gray-600"
                  }`}
                  onClick={() => setTimeRange("Day")}
                >
                  {t("FilterDistrict.day")}
                </button>
                <button
                  className={`flex-1 z-10 py-2 text-center rounded-full transition-colors duration-300 ${
                    timeRange === "Night" ? "text-white" : "text-gray-600"
                  }`}
                  onClick={() => setTimeRange("Night")}
                >
                  {t("FilterDistrict.night")}
                </button>
              </div>
            </div>
            <div className="mb-6 relative">
              <label className="block text-gray-500 mb-2">
                {t("Filters.streetSearch")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  ) : (
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t("Filters.streetSearchPlaceholder")}
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => {
                    if (searchResults.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  className="w-full pl-10 pr-10 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {(searchQuery || selectedStreet) && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <IoMdClose className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              {/* Search Suggestions */}
              {showSuggestions && searchResults.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1"
                >
                  {searchResults.map((result, index) => {
                    // Extract street info from display_name
                    const parts = result.display_name.split(", ");
                    const firstPart = parts[0] || "";
                    const houseNumberMatch = firstPart.match(/(\d+)/);
                    const houseNumber = houseNumberMatch
                      ? houseNumberMatch[1]
                      : null;

                    let streetName = "";
                    if (parts.length > 1) {
                      if (houseNumber) {
                        streetName =
                          parts[1] ||
                          parts[0].replace(/\d+\s*,?\s*/, "").trim();
                      } else {
                        streetName = parts[0];
                      }
                    } else {
                      streetName = firstPart;
                    }

                    return (
                      <button
                        key={result.place_id || index}
                        onClick={() => handleSuggestionClick(result)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-start gap-3"
                      >
                        <FaMapMarkerAlt className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 truncate">
                              {streetName.trim() ||
                                result.name ||
                                t("Filters.unknownStreet")}
                            </span>
                            {houseNumber && (
                              <span className="text-blue-600 font-medium">
                                #{houseNumber}
                              </span>
                            )}
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {result.type || result.class}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {result.display_name}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Selected Street Display */}
              {selectedStreet && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="h-4 w-4 text-blue-600" />
                    <div>
                      {(() => {
                        // Extract street info for selected street
                        const parts = selectedStreet.display_name.split(", ");
                        const firstPart = parts[0] || "";
                        const houseNumberMatch = firstPart.match(/(\d+)/);
                        const houseNumber = houseNumberMatch
                          ? houseNumberMatch[1]
                          : null;

                        let streetName = "";
                        if (parts.length > 1) {
                          if (houseNumber) {
                            streetName =
                              parts[1] ||
                              parts[0].replace(/\d+\s*,?\s*/, "").trim();
                          } else {
                            streetName = parts[0];
                          }
                        } else {
                          streetName = firstPart;
                        }

                        const city =
                          parts.find(
                            (part) =>
                              part.toLowerCase().includes("terrassa") ||
                              part.toLowerCase().includes("barcelona")
                          ) || "";

                        const postalCodeMatch =
                          selectedStreet.display_name.match(/\b\d{5}\b/);
                        const postalCode = postalCodeMatch
                          ? postalCodeMatch[0]
                          : "";

                        return (
                          <>
                            <p className="font-medium text-blue-900">
                              {streetName.trim() || selectedStreet.name}
                              {houseNumber && ` #${houseNumber}`}
                            </p>
                            <p className="text-sm text-blue-700">
                              {city && `${city}`}
                              {postalCode && `, ${postalCode}`}
                              {!city &&
                                !postalCode &&
                                selectedStreet.type &&
                                ` (${selectedStreet.type})`}
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* No Results Message */}
              {showSuggestions &&
                searchQuery.length >= 3 &&
                searchResults.length === 0 &&
                !isSearching && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg mt-1 p-4 text-center text-gray-500">
                    {t("Filters.noStreetsFound")} "{searchQuery}"
                  </div>
                )}
            </div>

            <SocialReportAudioFilter />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

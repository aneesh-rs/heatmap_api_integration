import Select from 'react-select';
import { City } from '../types';
import { useMapModeStore } from '../store/useMapModeStore';
import { useEffect } from 'react';
import { useModalStore } from '../store/useModalStore';

type Props = {
  selectedCity: City;
  setSelectedCity: (city: City) => void;
  cities: City[];
};

export default function CountrySelector({
  selectedCity,
  setSelectedCity,
  cities,
}: Props) {
  const { mode } = useMapModeStore();
  const { setCreateReportModalOpen, setLocationDetailsModalOpen } =
    useModalStore();
  useEffect(() => {
    if (selectedCity.value !== 'terrassa') {
      setLocationDetailsModalOpen(false);
      setCreateReportModalOpen(false);
    }
  }, [selectedCity]);

  return (
    <div
      className={`fixed top-6 right-8 ${
        mode !== 'drag' && mode !== 'chart'
          ? '-translate-x-96'
          : 'translate-x-0'
      } z-30 duration-300 ease-in-out`}
    >
      <Select
        isSearchable={false}
        options={cities}
        value={selectedCity}
        onChange={(city) => city && setSelectedCity(city)}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
      />
    </div>
  );
}

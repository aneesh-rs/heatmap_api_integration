import React from 'react';
import FilterButton from '../components/FilterButton';

interface FilterSelectProps {
  categories: { id: string; label: string; IconComponent: any }[];
  selectedFilters: string[];
  setSelectedFilters: React.Dispatch<React.SetStateAction<string[]>>;
}

const FilterSelect: React.FC<FilterSelectProps> = ({
  categories,
  selectedFilters,
  setSelectedFilters,
}) => {
  const handleFilterClick = (id: string) => {
    setSelectedFilters((prev) => {
      if (id === 'all') return ['all'];

      const newSelections = new Set(prev.filter((f) => f !== 'all'));
      if (newSelections.has(id)) {
        newSelections.delete(id);
      } else {
        newSelections.add(id);
      }
      const updated = Array.from(newSelections);
      return updated.length === 0 ? ['all'] : updated;
    });
  };

  return (
    <div className='bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-2xl'>
      <h1 className='text-xl sm:text-2xl font-bold text-gray-800 mb-6'>
        Filtros:{' '}
        <span className='font-semibold text-gray-600'>Selección múltiple</span>
      </h1>
      <div className='flex flex-wrap gap-3'>
        <FilterButton
          key='all'
          icon={<span className='font-bold'>All</span>}
          label='Todos'
          isSelected={selectedFilters.includes('all')}
          onClick={() => handleFilterClick('all')}
        />

        {categories
          .filter((cat) => cat.id !== 'all')
          .map((cat) => (
            <FilterButton
              key={cat.id}
              icon={<cat.IconComponent className='w-5 h-5' />}
              label={cat.label}
              isSelected={selectedFilters.includes(cat.id)}
              onClick={() => handleFilterClick(cat.id)}
            />
          ))}
      </div>
    </div>
  );
};

export default FilterSelect;

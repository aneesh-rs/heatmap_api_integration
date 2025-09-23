import React from 'react'


interface FilterButtonProps {
    icon: React.ReactNode;
    label: string;
    isSelected: boolean;
    onClick: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ icon, label, isSelected, onClick }) => {
    const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2";
    const selectedClasses = "bg-blue-500 text-white shadow-md hover:bg-blue-600 focus:ring-blue-500";
    const unselectedClasses = "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-blue-400";
  return (
    <button type='button' onClick={onClick} className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}>
        {icon}
        <span>{label}</span>
    </button>

  )
}
 
export default FilterButton
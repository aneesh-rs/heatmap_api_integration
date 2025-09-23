import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className='flex justify-center items-center'>
      <div className='animate-spin rounded-full h-6 w-6 border-2 border-b-blue-500 border-white'></div>
    </div>
  );
};

export default Loader;

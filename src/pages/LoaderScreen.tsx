import React from 'react';
import { motion } from 'motion/react';
import { IMAGES } from '../assets/images/ImageConstants';

const LoaderScreen: React.FC = () => {
  return (
    <div className='fixed inset-0 bg-white flex items-center justify-center z-50'>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: 'reverse',
          repeatDelay: 0.5,
        }}
        className='w-24 h-24 flex items-center justify-center'
      >
        <img
          src={IMAGES.Logo}
          alt='Loading'
          className='w-full h-full object-contain'
        />
      </motion.div>
    </div>
  );
};

export default LoaderScreen;
